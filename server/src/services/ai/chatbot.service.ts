/**
 * AI Chatbot Service — FR-6.5 / RQ5
 *
 * Pipeline:
 *   Manager message → Gemini (Intent+Entity extraction)
 *   → Backend queries MongoDB via ReportService
 *   → Gemini (Response generation in Vietnamese)
 *   → Save to ChatHistory
 *
 * References:
 *   [P11] Quamar et al., FnTDB 2022 — NLI Survey
 *   [P12] Chen & Tsai, Sensors 2021 — Chatbot FM (4-module architecture)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ChatHistory, IChatHistory } from '../../models/chatHistory.model';
import { ReportService } from '../report.service';
import { ParkingFacility } from '../../models/parkingFacility.model';
import { Exception, ExceptionStatus, ExceptionType } from '../../models/exception.model';
import { ParkingSession, SessionStatus } from '../../models/parkingSession.model';
import { AppError } from '../../middlewares/error.middleware';
import mongoose from 'mongoose';

// ─── Types ────────────────────────────────────────────────

interface ParsedIntent {
  intent: string;
  entities: {
    timeRange?: string | null;
    facilityName?: string | null;
    facilityName2?: string | null; // Tòa nhà thứ 2 khi so sánh
    floorName?: string | null;
    vehicleType?: string | null;
  };
}

interface ChatResponse {
  answer: string;
  data: Record<string, any>;
  chartType: string | null;
  intent: string;
  processingTimeMs: number;
}

interface TimeRange {
  startDate: string;
  endDate: string;
}

// ─── Gemini Client ────────────────────────────────────────

function getGenAI(): GoogleGenerativeAI {
  if (!env.GEMINI_API_KEY) {
    throw new AppError('GEMINI_API_KEY chưa được cấu hình. Vui lòng thêm vào file .env', 500);
  }
  // Tạo mới mỗi lần để luôn đọc config mới nhất (sau khi .env thay đổi)
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

// ─── Retry Helper (xử lý 429 rate limit) ─────────────────

async function callGeminiWithRetry(
  model: any,
  content: string[],
  maxRetries: number = 2
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(content);
      return result.response.text().trim();
    } catch (err: any) {
      const is429 = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('Too Many Requests');
      if (is429 && attempt < maxRetries) {
        const waitMs = (attempt + 1) * 5000; // 5s, 10s
        logger.warn(`[Chatbot] Rate limited, waiting ${waitMs}ms before retry ${attempt + 1}/${maxRetries}`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

// ─── System Prompts ───────────────────────────────────────

const INTENT_EXTRACTION_PROMPT = `Bạn là AI assistant của hệ thống Quản lý Bãi Đỗ Xe thông minh (Smart Parking System).

Nhiệm vụ: Phân tích câu hỏi của Manager và trả về JSON chính xác.

Các intent được hỗ trợ:
- "revenue_report": Hỏi về doanh thu, tiền, thu nhập, lợi nhuận, so sánh doanh thu
- "traffic_report": Hỏi về lượt xe vào/ra, số xe, lưu lượng
- "occupancy_report": Hỏi về tỷ lệ lấp đầy, slot trống, chỗ trống, tình trạng bãi
- "peak_hours": Hỏi về giờ cao điểm, giờ đông, giờ vắng, khung giờ
- "facility_info": Hỏi về thông tin bãi xe, tòa nhà, giờ mở cửa
- "exception_summary": Hỏi về ngoại lệ, sự cố, mất thẻ, sai biển số
- "active_sessions": Hỏi về xe đang gửi, xe trong bãi, bao nhiêu xe
- "unknown": Không thuộc các intent trên. BAO GỒM: câu hỏi về thời tiết, chào hỏi, truyện cười, câu hỏi cá nhân, chủ đề không liên quan đến bãi xe

QUY TẮC QUAN TRỌNG:
- Chỉ phân loại vào các intent trên. Nếu câu hỏi KHÔNG liên quan đến quản lý bãi đỗ xe, BUỘC PHẢI trả về "unknown".
- Nếu câu hỏi hỏi so sánh giữa 2 mốc thời gian (vd: "so sánh doanh thu hôm nay và hôm qua"), chọn intent phù hợp và đặt timeRange là mốc rộng hơn (vd: "last_7_days").
- Nếu câu hỏi so sánh giữa 2 tòa nhà/bãi xe (vd: "so sánh doanh thu tòa A và tòa B"), điền facilityName và facilityName2.

Các timeRange:
- "today": hôm nay
- "yesterday": hôm qua
- "this_week": tuần này
- "last_week": tuần trước
- "this_month": tháng này
- "last_month": tháng trước
- "last_7_days": 7 ngày qua
- "last_30_days": 30 ngày qua
- null: không xác định

Chỉ trả về JSON duy nhất, KHÔNG giải thích, KHÔNG markdown:
{"intent":"...","entities":{"timeRange":"...","facilityName":null,"facilityName2":null,"floorName":null,"vehicleType":null}}`;

const RESPONSE_GENERATION_PROMPT = `Bạn là AI assistant của hệ thống Quản lý Bãi Đỗ Xe thông minh.

Quy tắc trả lời:
1. Trả lời bằng tiếng Việt, ngắn gọn, chuyên nghiệp
2. Sử dụng số liệu cụ thể từ dữ liệu được cung cấp
3. Format số tiền VNĐ với dấu chấm ngăn cách hàng nghìn (vd: 2.500.000đ)
4. Nếu không có giao dịch/doanh thu/lượt xe trong khoảng thời gian hỏi, trả lời theo ngữ cảnh kinh doanh. Ví dụ:
   - Đúng: "Doanh thu hôm nay chưa có giao dịch nào."
   - Đúng: "Hôm nay chưa có lượt xe nào vào bãi."
   - SAI: "Dữ liệu hôm nay không có." (KHÔNG dùng từ "dữ liệu")
5. Cuối câu trả lời, nếu phù hợp, gợi ý 1-2 insight từ dữ liệu
6. Đề xuất loại biểu đồ phù hợp nhất (bar/line/pie/table) nếu có số liệu
7. TUYYỆT ĐỐI KHÔNG dùng từ "dữ liệu" trong câu trả lời. Thay bằng từ cụ thể: "doanh thu", "lượt xe", "tỷ lệ lấp đầy", "giao dịch", ...

Trả về JSON duy nhất:
{"answer":"câu trả lời","chartType":"bar|line|pie|table|null"}`;

// ─── Time Range Resolver ──────────────────────────────────

function resolveTimeRange(timeRangeStr: string | null | undefined): TimeRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (timeRangeStr) {
    case 'today': {
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: today.toISOString(), endDate: endOfDay.toISOString() };
    }
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const endYesterday = new Date(yesterday);
      endYesterday.setHours(23, 59, 59, 999);
      return { startDate: yesterday.toISOString(), endDate: endYesterday.toISOString() };
    }
    case 'this_week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: startOfWeek.toISOString(), endDate: endOfDay.toISOString() };
    }
    case 'last_week': {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay() - 6); // Last Monday
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 6); // Last Sunday
      endOfLastWeek.setHours(23, 59, 59, 999);
      return { startDate: startOfLastWeek.toISOString(), endDate: endOfLastWeek.toISOString() };
    }
    case 'this_month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: startOfMonth.toISOString(), endDate: endOfDay.toISOString() };
    }
    case 'last_month': {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      endOfLastMonth.setHours(23, 59, 59, 999);
      return { startDate: startOfLastMonth.toISOString(), endDate: endOfLastMonth.toISOString() };
    }
    case 'last_7_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: endOfDay.toISOString() };
    }
    case 'last_30_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: endOfDay.toISOString() };
    }
    default: {
      // Default: hôm nay
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: today.toISOString(), endDate: endOfDay.toISOString() };
    }
  }
}

// ─── Facility Name Resolver ───────────────────────────────

/**
 * Resolve facility từ tên do Manager nhắc đến.
 *
 * Logic:
 * - Không nhắc tên → undefined (sẽ aggregate tất cả facilities trong scope)
 * - Có nhắc tên → tìm theo tên, PHẢI nằm trong scope của Manager
 */
async function resolveFacilityId(
  facilityName: string | null | undefined,
  facilityScope?: string[]
): Promise<string | undefined> {
  // Không nhắc tên → aggregate tất cả facilities trong scope
  if (!facilityName) return undefined;

  // Có nhắc tên → tìm kiếm theo tên (case-insensitive, partial match)
  const query: any = { name: { $regex: facilityName, $options: 'i' } };

  // Nếu Manager có scope → chỉ tìm trong các tòa được phân công
  if (facilityScope && facilityScope.length > 0) {
    query._id = { $in: facilityScope.map((id) => new mongoose.Types.ObjectId(id)) };
  }

  const facility = await ParkingFacility.findOne(query).select('_id name');

  if (!facility) {
    // Tòa nhà không tồn tại hoặc không nằm trong scope
    logger.warn('[Chatbot] Facility not found or not in scope', { facilityName, facilityScope });
    return undefined;
  }

  return facility._id?.toString();
}

/**
 * Aggregate data từ nhiều facilities của Manager.
 *
 * Nếu facilityId cụ thể → gọi handler 1 lần.
 * Nếu không có facilityId + Manager có scope → gọi handler cho từng facility rồi merge.
 * Nếu không có facilityId + không có scope (Admin) → gọi handler không filter (tất cả).
 */
async function queryWithScope(
  handler: (entities: ParsedIntent['entities'], facilityId?: string) => Promise<any>,
  entities: ParsedIntent['entities'],
  facilityId: string | undefined,
  facilityScope?: string[]
): Promise<any> {
  // Trường hợp 1: Hỏi cụ thể 1 tòa nhà
  if (facilityId) {
    const facility = await ParkingFacility.findById(facilityId).select('name').lean();
    const result = await handler(entities, facilityId);
    return { ...result, facilityName: facility?.name || 'Không rõ' };
  }

  // Trường hợp 2: Hỏi chung + Manager có scope → aggregate tất cả tòa trong scope
  if (facilityScope && facilityScope.length > 0) {
    if (facilityScope.length === 1) {
      const facility = await ParkingFacility.findById(facilityScope[0]).select('name').lean();
      const result = await handler(entities, facilityScope[0]);
      return { ...result, facilityName: facility?.name || 'Không rõ' };
    }

    // Lấy tên tất cả tòa nhà song song với query data
    const [facilities, ...results] = await Promise.all([
      ParkingFacility.find({
        _id: { $in: facilityScope.map((id) => new mongoose.Types.ObjectId(id)) },
      })
        .select('_id name')
        .lean(),
      ...facilityScope.map((fId) => handler(entities, fId).catch(() => null)),
    ]);

    // Map facilityId → name
    const nameMap = new Map(
      facilities.map((f: any) => [f._id.toString(), f.name])
    );

    // Merge kết quả có kèm tên tòa
    return mergeMultiFacilityData(
      results.filter(Boolean),
      facilityScope,
      nameMap
    );
  }

  // Trường hợp 3: Admin (không có scope) → query tất cả facilities kèm tên
  const allFacilities = await ParkingFacility.find({ status: 'active' }).select('_id name').lean();

  if (allFacilities.length === 0) {
    return handler(entities);
  }

  if (allFacilities.length === 1) {
    const result = await handler(entities, allFacilities[0]._id.toString());
    return { ...result, facilityName: allFacilities[0].name };
  }

  // Query từng tòa song song
  const allIds = allFacilities.map((f: any) => f._id.toString());
  const results = await Promise.all(
    allIds.map((fId: string) => handler(entities, fId).catch(() => null))
  );

  const nameMap = new Map(
    allFacilities.map((f: any) => [f._id.toString(), f.name])
  );

  return mergeMultiFacilityData(results.filter(Boolean), allIds, nameMap);
}

/**
 * Merge kết quả từ nhiều facilities thành 1 tổng hợp — kèm tên tòa nhà
 */
function mergeMultiFacilityData(
  results: any[],
  facilityIds: string[],
  nameMap: Map<string, string>
): any {
  if (results.length === 0) return {};
  if (results.length === 1) {
    return { ...results[0], facilityName: nameMap.get(facilityIds[0]) || 'Không rõ' };
  }

  // Gắn tên tòa vào từng kết quả
  const perFacility = results.map((result, index) => ({
    facilityName: nameMap.get(facilityIds[index]) || `Tòa ${index + 1}`,
    ...(result || {}),
  }));

  const merged: any = {
    facilitiesIncluded: facilityIds.length,
    perFacility,
  };

  // Cộng dồn summary nếu có
  const firstResult = results[0];
  if (firstResult?.summary) {
    const mergedSummary: any = {};
    const summaryKeys = Object.keys(firstResult.summary);

    for (const key of summaryKeys) {
      const values = results.map((r) => r?.summary?.[key]).filter((v) => v != null);
      if (values.every((v) => typeof v === 'number')) {
        mergedSummary[key] = values.reduce((sum: number, v: number) => sum + v, 0);
      } else {
        mergedSummary[key] = values[0];
      }
    }
    merged.summary = mergedSummary;
  }

  return merged;
}

async function handleRevenueReport(entities: ParsedIntent['entities'], facilityId?: string) {
  const timeRange = resolveTimeRange(entities.timeRange);
  const data = await ReportService.getRevenueReport({
    facilityId,
    startDate: timeRange.startDate,
    endDate: timeRange.endDate,
    groupBy: 'day',
  });
  return data;
}

async function handleTrafficReport(entities: ParsedIntent['entities'], facilityId?: string) {
  const timeRange = resolveTimeRange(entities.timeRange);
  const data = await ReportService.getTrafficReport({
    facilityId,
    startDate: timeRange.startDate,
    endDate: timeRange.endDate,
    groupBy: 'day',
  });
  return data;
}

async function handleOccupancyReport(_entities: ParsedIntent['entities'], facilityId?: string) {
  const data = await ReportService.getOccupancyReport({ facilityId });
  return data;
}

async function handlePeakHours(entities: ParsedIntent['entities'], facilityId?: string) {
  const timeRange = resolveTimeRange(entities.timeRange);
  const data = await ReportService.getPeakHoursReport({
    facilityId,
    startDate: timeRange.startDate,
    endDate: timeRange.endDate,
  });
  return data;
}

async function handleFacilityInfo(_entities: ParsedIntent['entities'], facilityId?: string) {
  if (facilityId) {
    const facility = await ParkingFacility.findById(facilityId);
    return facility ? facility.toObject() : { message: 'Không tìm thấy bãi xe' };
  }

  // Lấy tất cả facilities
  const facilities = await ParkingFacility.find({ status: 'active' }).select(
    'name address openTime closeTime status totalSlots'
  );
  return { facilities, total: facilities.length };
}

async function handleExceptionSummary(entities: ParsedIntent['entities'], facilityId?: string) {
  const timeRange = resolveTimeRange(entities.timeRange);

  const matchStage: any = {
    createdAt: {
      $gte: new Date(timeRange.startDate),
      $lte: new Date(timeRange.endDate),
    },
  };

  if (facilityId) {
    // Tìm sessions của facility để lọc exceptions
    const sessionIds = await ParkingSession.find({ facilityId })
      .select('_id')
      .then((sessions) => sessions.map((s) => s._id));
    matchStage.sessionId = { $in: sessionIds };
  }

  const [byType, byStatus, total] = await Promise.all([
    Exception.aggregate([
      { $match: matchStage },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    Exception.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Exception.countDocuments(matchStage),
  ]);

  return {
    total,
    byType: byType.map((item) => ({ type: item._id, count: item.count })),
    byStatus: byStatus.map((item) => ({ status: item._id, count: item.count })),
  };
}

async function handleActiveSessions(_entities: ParsedIntent['entities'], facilityId?: string) {
  const filter: any = { status: { $in: [SessionStatus.ACTIVE, SessionStatus.EXCEPTION] } };
  if (facilityId) filter.facilityId = facilityId;

  const [total, byVehicleType] = await Promise.all([
    ParkingSession.countDocuments(filter),
    ParkingSession.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'vehicletypes',
          localField: 'vehicleTypeId',
          foreignField: '_id',
          as: 'vehicleType',
        },
      },
      { $unwind: '$vehicleType' },
      {
        $group: {
          _id: { vehicleTypeId: '$vehicleTypeId', vehicleTypeName: '$vehicleType.name' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return {
    totalActiveSessions: total,
    byVehicleType: byVehicleType.map((item) => ({
      vehicleType: item._id.vehicleTypeName,
      count: item.count,
    })),
  };
}

// ─── Intent → Handler Map ─────────────────────────────────

const INTENT_HANDLERS: Record<
  string,
  (entities: ParsedIntent['entities'], facilityId?: string) => Promise<any>
> = {
  revenue_report: handleRevenueReport,
  traffic_report: handleTrafficReport,
  occupancy_report: handleOccupancyReport,
  peak_hours: handlePeakHours,
  facility_info: handleFacilityInfo,
  exception_summary: handleExceptionSummary,
  active_sessions: handleActiveSessions,
};

// ─── Quick Reply Suggestions ──────────────────────────────

const QUICK_REPLIES = [
  'Hôm nay doanh thu bao nhiêu?',
  'Liệt kê doanh thu từng tòa nhà hôm nay?',
  'Tỷ lệ lấp đầy bãi xe hiện tại?',
  'Tuần này có bao nhiêu lượt xe?',
  'Giờ nào đông nhất hôm nay?',
  'Có bao nhiêu xe đang gửi?',
  'Tóm tắt ngoại lệ tuần này?',
];

// ─── Fallback Response (khi Gemini bị rate limit) ─────────

function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}

function generateFallbackResponse(intent: string, data: any): string {
  const summary = data?.summary || data || {};
  const perFacility = data?.perFacility as any[] | undefined;

  // Nếu có breakdown theo tòa → liệt kê
  if (perFacility && perFacility.length > 0) {
    const lines: string[] = [];

    switch (intent) {
      case 'revenue_report': {
        lines.push('📊 Doanh thu theo từng tòa nhà:');
        perFacility.forEach((f: any) => {
          const name = f.facilityName || 'Không rõ';
          const revenue = f.summary?.totalRevenue ?? f.grandTotal ?? 0;
          const transactions = f.summary?.totalTransactions ?? f.totalTransactions ?? 0;
          lines.push(`• ${name}: ${formatVND(revenue)} (${transactions} giao dịch)`);
        });
        if (summary.totalRevenue != null || summary.grandTotal != null) {
          lines.push(`\n💰 Tổng cộng: ${formatVND(summary.totalRevenue ?? summary.grandTotal ?? 0)}`);
        }
        break;
      }
      case 'traffic_report': {
        lines.push('🚗 Lượt xe theo từng tòa nhà:');
        perFacility.forEach((f: any) => {
          const name = f.facilityName || 'Không rõ';
          const entries = f.summary?.totalEntries ?? 0;
          const exits = f.summary?.totalExits ?? 0;
          lines.push(`• ${name}: ${entries} vào / ${exits} ra`);
        });
        break;
      }
      default: {
        lines.push(`Kết quả theo từng tòa nhà:`);
        perFacility.forEach((f: any) => {
          lines.push(`• ${f.facilityName || 'Không rõ'}: ${JSON.stringify(f.summary || {})}`);
        });
      }
    }
    return lines.join('\n');
  }

  // Fallback đơn giản (1 tòa hoặc không có data)
  switch (intent) {
    case 'revenue_report': {
      const revenue = summary.totalRevenue ?? summary.grandTotal ?? 0;
      const transactions = summary.totalTransactions ?? 0;
      if (revenue === 0 && transactions === 0) {
        return 'Chưa có giao dịch nào trong khoảng thời gian này.';
      }
      return `Doanh thu: ${formatVND(revenue)} từ ${transactions} giao dịch.`;
    }
    case 'traffic_report': {
      const entries = summary.totalEntries ?? 0;
      const exits = summary.totalExits ?? 0;
      if (entries === 0 && exits === 0) {
        return 'Chưa có lượt xe nào trong khoảng thời gian này.';
      }
      return `Tổng lượt xe: ${entries} vào, ${exits} ra.`;
    }
    case 'occupancy_report':
      return `Tỷ lệ lấp đầy hiện tại: ${summary.occupancyRate ?? 0}%.`;
    case 'active_sessions':
      return `Hiện có ${summary.totalActiveSessions ?? data?.totalActiveSessions ?? 0} xe đang gửi trong bãi.`;
    default:
      return `Thông tin ${intent.replace('_', ' ')}: ${JSON.stringify(summary)}`;
  }
}

// ─── Main Service ─────────────────────────────────────────

export class ChatbotService {
  /**
   * Xử lý câu hỏi từ Manager
   *
   * Pipeline 4-module [P12]:
   *   1. Intent Analysis    — Gemini phân loại intent + trích xuất entity
   *   2. Parking Dataset    — MongoDB query qua ReportService
   *   3. Decision Mechanism — chọn handler theo intent
   *   4. Response Generation — Gemini format câu trả lời tiếng Việt
   */
  static async processQuery(
    userId: string,
    message: string,
    facilityScope?: string[]
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      const ai = getGenAI();
      const model = ai.getGenerativeModel({ model: env.GEMINI_MODEL });

      // ── Module 1: Intent Analysis (Gemini) ──────────────
      let parsed: ParsedIntent;
      try {
        const intentText = await callGeminiWithRetry(model, [
          INTENT_EXTRACTION_PROMPT,
          `Câu hỏi: "${message}"`,
        ]);
        logger.info('[Chatbot] Gemini raw intent response', { intentText });

        // Strip markdown code fences nếu có (```json...``` hoặc ```...```)
        let cleanText = intentText;
        const codeBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          cleanText = codeBlockMatch[1].trim();
        }

        // Parse JSON từ response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error(`Gemini không trả về JSON hợp lệ. Raw: ${intentText}`);
        }
        parsed = JSON.parse(jsonMatch[0]);

        // Validate intent
        if (!parsed.intent || !parsed.entities) {
          throw new Error(`JSON thiếu fields. Parsed: ${JSON.stringify(parsed)}`);
        }
      } catch (parseErr: any) {
        logger.warn('[Chatbot] Intent parsing failed, using fallback', {
          error: parseErr.message,
          stack: parseErr.stack,
        });
        parsed = { intent: 'unknown', entities: {} };
      }

      logger.info('[Chatbot] Intent parsed', { intent: parsed.intent, entities: parsed.entities });

      // ── Module 2+3: Dataset Query + Decision ────────────
      let data: any = {};
      const handler = INTENT_HANDLERS[parsed.intent];

      if (handler) {
        const facilityId = await resolveFacilityId(parsed.entities.facilityName, facilityScope);

        // Kiểm tra nếu Manager yêu cầu SO SÁNH 2 tòa nhà
        if (parsed.entities.facilityName2) {
          const facilityId2 = await resolveFacilityId(parsed.entities.facilityName2, facilityScope);

          if (facilityId && facilityId2) {
            // Query song song cả 2 tòa
            const [data1, data2] = await Promise.all([
              handler(parsed.entities, facilityId),
              handler(parsed.entities, facilityId2),
            ]);
            data = {
              comparison: true,
              facility1: { name: parsed.entities.facilityName, ...data1 },
              facility2: { name: parsed.entities.facilityName2, ...data2 },
            };
          } else {
            // Không tìm thấy 1 trong 2 tòa → query tòa tìm được hoặc aggregate
            data = await queryWithScope(handler, parsed.entities, facilityId || facilityId2, facilityScope);
          }
        } else {
          // Query bình thường (1 tòa hoặc aggregate tất cả)
          data = await queryWithScope(handler, parsed.entities, facilityId, facilityScope);
        }
      }

      // ── Module 4: Response Generation (Gemini) ──────────
      let answer: string;
      let chartType: string | null = null;

      if (parsed.intent === 'unknown') {
        answer =
          'Xin lỗi, tôi không hỗ trợ câu hỏi ngoài phạm vi quản lý bãi đỗ xe. ' +
          'Tôi có thể giúp bạn về:\n' +
          '• Doanh thu (vd: "Doanh thu hôm nay bao nhiêu?")\n' +
          '• Lượt xe vào/ra (vd: "Tuần này có bao nhiêu lượt xe?")\n' +
          '• Tỷ lệ lấp đầy (vd: "Tình trạng bãi xe hiện tại?")\n' +
          '• Giờ cao điểm (vd: "Giờ nào đông nhất?")\n' +
          '• Ngoại lệ (vd: "Tóm tắt sự cố tuần này?")\n' +
          '• Xe đang gửi (vd: "Có bao nhiêu xe trong bãi?")';
        chartType = null;
      } else {
        try {
          const responseText = await callGeminiWithRetry(model, [
            RESPONSE_GENERATION_PROMPT,
            `Dữ liệu từ hệ thống:\n${JSON.stringify(data, null, 2)}\n\nCâu hỏi gốc: "${message}"`,
          ]);
          logger.info('[Chatbot] Gemini raw response', { responseText: responseText.substring(0, 200) });

          // Strip markdown code fences
          let cleanResponse = responseText;
          const codeBlockMatch = cleanResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (codeBlockMatch) {
            cleanResponse = codeBlockMatch[1].trim();
          }

          // Parse JSON response
          const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const responseObj = JSON.parse(jsonMatch[0]);
            answer = responseObj.answer || responseText;
            chartType = responseObj.chartType || null;
          } else {
            answer = responseText;
          }
        } catch (genErr) {
          logger.warn('[Chatbot] Response generation failed, using fallback', { error: genErr });
          // Tạo fallback response thân thiện thay vì dump JSON
          answer = generateFallbackResponse(parsed.intent, data);
        }
      }

      const processingTimeMs = Date.now() - startTime;

      // ── Lưu lịch sử chat ───────────────────────────────
      try {
        // Lọc facilityScope hợp lệ trước khi convert ObjectId
        const validScope = facilityScope?.filter(
          (id) => id && mongoose.Types.ObjectId.isValid(id)
        );

        await ChatHistory.create({
          userId: new mongoose.Types.ObjectId(userId),
          message,
          intent: parsed.intent,
          entities: parsed.entities || {},
          response: answer,
          responseData: data?.summary || data || {},
          chartType: chartType || null,
          processingTimeMs,
          facilityScope:
            validScope && validScope.length > 0
              ? validScope.map((id) => new mongoose.Types.ObjectId(id))
              : [],
        });
      } catch (saveErr: any) {
        logger.error('[Chatbot] Failed to save chat history', {
          error: saveErr.message,
          userId,
          intent: parsed.intent,
        });
        // Không throw — vẫn trả response cho user
      }

      return {
        answer,
        data: data.summary || data,
        chartType,
        intent: parsed.intent,
        processingTimeMs,
      };
    } catch (error: any) {
      logger.error('[Chatbot] processQuery error', { error: error.message, stack: error.stack });

      // Lỗi rate limit (429)
      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Too Many Requests')) {
        throw new AppError('AI Chatbot đang quá tải (hết quota). Vui lòng thử lại sau 30 giây hoặc liên hệ Admin để nâng cấp API key.', 429);
      }

      // Lỗi API key
      if (error.message?.includes('API_KEY') || error.message?.includes('GEMINI') || error.message?.includes('401')) {
        throw new AppError('Chatbot AI chưa được cấu hình hoặc API key không hợp lệ. Vui lòng liên hệ Admin.', 503);
      }

      throw new AppError(`Chatbot gặp lỗi: ${error.message}`, 500);
    }
  }

  /**
   * Lấy lịch sử chat của user (phân trang, mới nhất lên đầu)
   */
  static async getChatHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ChatHistory.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ChatHistory.countDocuments({ userId }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Xóa lịch sử chat của user
   */
  static async clearChatHistory(userId: string): Promise<{ deletedCount: number }> {
    const result = await ChatHistory.deleteMany({ userId });
    return { deletedCount: result.deletedCount };
  }

  /**
   * Lấy danh sách gợi ý câu hỏi nhanh
   */
  static getQuickReplies(): string[] {
    return QUICK_REPLIES;
  }
}
