import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, Tool } from '@google/generative-ai';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ChatHistory, IChatHistory } from '../models/chatHistory.model';
import { ReportService } from './report.service';
import { ParkingFacility } from '../models/parkingFacility.model';
import { Exception, ExceptionStatus, ExceptionType } from '../models/exception.model';
import { ParkingSession, SessionStatus } from '../models/parkingSession.model';
import { Feedback, FeedbackStatus } from '../models/feedback.model';
import { AppError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

// ─── Types ────────────────────────────────────────────────

interface ChatResponse {
  answer: string;
  data: Record<string, any>;
  chartType: string | null;
  processingTimeMs: number;
  conversationId: string;
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
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

// ─── Dynamic System Prompt ────────────────────────────────

const BASE_SYSTEM_PROMPT = `Bạn là Trợ lý AI thông minh cho hệ thống Quản lý Bãi Đỗ Xe Thông Minh.

VAI TRÒ:
- Giúp Manager thống kê, phân tích dữ liệu bãi xe
- Đưa ra nhận xét, cảnh báo, khuyến nghị hành động dựa trên dữ liệu
- Trả lời câu hỏi về nghiệp vụ, quy trình, chính sách bãi xe

KHẢ NĂNG:
1. Truy vấn dữ liệu: doanh thu, lượt xe, tỷ lệ lấp đầy, giờ cao điểm, ngoại lệ, feedback, xe đang gửi bằng cách gọi các function tương ứng.
2. Phân tích & nhận xét: so sánh xu hướng, phát hiện bất thường, đề xuất cải thiện  
3. Tư vấn nghiệp vụ: giải thích quy trình, chính sách phí, cách xử lý ngoại lệ

QUY TẮC TRẢ LỜI & NHẬN XÉT:
1. Trả lời bằng tiếng Việt, ngắn gọn, chuyên nghiệp. Format số tiền VNĐ (VD: 2.500.000đ).
2. Khi doanh thu giảm > 20% so với kỳ trước → Cảnh báo + đề xuất nguyên nhân
3. Khi tỷ lệ lấp đầy > 85% → Cảnh báo gần đầy + đề xuất phân luồng
4. Khi ngoại lệ tăng đột biến → Cảnh báo + đề xuất kiểm tra quy trình
5. Luôn kết thúc bằng 1-2 khuyến nghị hành động cụ thể nếu có số liệu.
6. TUYỆT ĐỐI KHÔNG dùng từ "dữ liệu" trong câu trả lời (sai: "Dữ liệu hôm nay không có"). Trả lời tự nhiên (đúng: "Hôm nay chưa có lượt xe nào").
7. **QUAN TRỌNG — TẤT CẢ SỐ LIỆU PHẢI NẰM TRONG ANSWER**:
   - Đọc kỹ kết quả từ function, trích xuất các con số quan trọng và đưa VÀO trong phần "answer".
   - Sử dụng bảng markdown, danh sách hoặc bullet points để trình bày số liệu rõ ràng.
   - VÍ DỤ ĐÚNG: "### Doanh thu hôm nay\n| Tòa nhà | Doanh thu | Giao dịch |\n|---|---|---|\n| Tòa A | 5.200.000đ | 45 |\n| Tòa B | 3.100.000đ | 28 |\n\n**Tổng: 8.300.000đ**\n\n📌 Khuyến nghị: ..."
   - VÍ DỤ SAI: Chỉ trả lời "Đã lấy báo cáo doanh thu" mà không kèm con số.
   - Manager sẽ chỉ đọc phần "answer", KHÔNG đọc raw data. Vì vậy answer phải đầy đủ thông tin.
8. Trả về kết quả dưới dạng một JSON hợp lệ duy nhất với cấu trúc:
   {"answer": "câu trả lời đầy đủ số liệu, dùng markdown", "chartType": "bar|line|pie|table|null"}
   Không thêm bất kỳ text nào nằm ngoài JSON này.

KNOWLEDGE BASE (Kiến thức về hệ thống):
- Hệ thống quản lý bãi đỗ xe thông minh với 4 actor: Admin, Manager, Staff, Driver
- Models: ParkingFacility (tòa nhà), Floor (tầng), ParkingSlot (slot), VehicleType (loại xe)
- ParkingSession: ghi nhận lượt gửi xe (check-in → check-out)
- PricingPlan: bảng giá (flat_rate, duration_based, time_window)  
- Payment: thanh toán (cash, qr_pay, e_wallet, bank_card)
- Exception: ngoại lệ (lost_card, wrong_plate, overtime, wrong_zone, unpaid)
- Feedback: phản hồi khách hàng
- Reservation: đặt chỗ trước
- Thuật toán MFD (Macroscopic Fundamental Diagram) cho occupancy heatmap
`;

/**
 * Xây dựng system prompt động theo scope Manager.
 * Inject danh sách tòa nhà để AI biết phạm vi truy cập.
 */
async function buildSystemPrompt(facilityScope?: string[]): Promise<string> {
  if (!facilityScope || facilityScope.length === 0) {
    return BASE_SYSTEM_PROMPT;
  }

  const facilities = await ParkingFacility.find({
    _id: { $in: facilityScope.map((id) => new mongoose.Types.ObjectId(id)) },
    status: 'active',
  })
    .select('_id name address')
    .lean();

  if (facilities.length === 0) {
    return BASE_SYSTEM_PROMPT;
  }

  const facilityList = facilities
    .map((f: any) => `- ${f.name} (địa chỉ: ${f.address || 'N/A'})`)
    .join('\n');

  return `${BASE_SYSTEM_PROMPT}

PHẠM VI QUẢN LÝ CỦA MANAGER HIỆN TẠI:
Bạn chỉ được trả lời và truy vấn dữ liệu về các tòa nhà sau:
${facilityList}

QUY TẮC BẢO MẬT & PHẠM VI:
- CHỈ trả lời câu hỏi liên quan đến các tòa nhà được liệt kê ở trên.
- Nếu Manager hỏi về tòa nhà không có trong danh sách → trả lời: "Xin lỗi, bạn không có quyền truy cập thông tin của tòa nhà này. Bạn chỉ có thể xem báo cáo của: ${facilities.map((f: any) => f.name).join(', ')}."
- Khi Manager hỏi chung (không chỉ định tòa nhà cụ thể), hãy trả lời tổng hợp cho TẤT CẢ các tòa nhà trong phạm vi.
- Khi so sánh, chỉ so sánh giữa các tòa nhà trong phạm vi.
`;
}

// ─── Time Range Resolver ──────────────────────────────────

/**
 * Resolve khoảng thời gian từ preset string hoặc custom dates.
 * Hỗ trợ: preset cố định, last_N_days (dynamic), all_time, và custom start/end dates.
 */
function resolveTimeRange(
  timeRangeStr: string | null | undefined,
  customStartDate?: string,
  customEndDate?: string
): TimeRange {
  // Ưu tiên custom dates nếu có
  if (customStartDate || customEndDate) {
    const now = new Date();
    const start = customStartDate ? new Date(customStartDate) : new Date(0); // epoch nếu không có start
    const end = customEndDate ? new Date(customEndDate) : new Date(now);
    // Đảm bảo end date bao gồm hết ngày
    if (customEndDate && !customEndDate.includes('T')) {
      end.setHours(23, 59, 59, 999);
    }
    if (customStartDate && !customStartDate.includes('T')) {
      start.setHours(0, 0, 0, 0);
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Dynamic last_N_days pattern (ví dụ: last_2_days, last_5_days, last_14_days)
  const lastNDaysMatch = timeRangeStr?.match(/^last_(\d+)_days$/);
  if (lastNDaysMatch) {
    const n = parseInt(lastNDaysMatch[1], 10);
    const start = new Date(today);
    start.setDate(start.getDate() - n);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: endOfDay.toISOString() };
  }

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
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: startOfWeek.toISOString(), endDate: endOfDay.toISOString() };
    }
    case 'last_week': {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay() - 6);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
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
    case 'this_year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: startOfYear.toISOString(), endDate: endOfDay.toISOString() };
    }
    case 'last_year': {
      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);
      endOfLastYear.setHours(23, 59, 59, 999);
      return { startDate: startOfLastYear.toISOString(), endDate: endOfLastYear.toISOString() };
    }
    case 'all_time': {
      // Lấy từ đầu hệ thống (epoch) đến hiện tại
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: new Date(0).toISOString(), endDate: endOfDay.toISOString() };
    }
    default: {
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return { startDate: today.toISOString(), endDate: endOfDay.toISOString() };
    }
  }
}

// ─── Regex Escape Helper ──────────────────────────────────

/**
 * Escape ký tự đặc biệt trong regex để tránh lỗi khi tên toà nhà
 * chứa ký tự như [ ] ( ) . * + ? ^ $ { } | \
 * Ví dụ: "Vinhome - 1 [Test]" → "Vinhome \- 1 \[Test\]"
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Facility Name Resolver ───────────────────────────────

async function resolveFacilityId(
  facilityName: string | null | undefined,
  facilityScope?: string[]
): Promise<string | null | undefined> {
  if (!facilityName) return undefined;

  // Escape ký tự đặc biệt regex trong tên toà nhà
  const escapedName = escapeRegex(facilityName);
  const query: any = { name: { $regex: escapedName, $options: 'i' } };
  if (facilityScope && facilityScope.length > 0) {
    query._id = { $in: facilityScope.map((id) => new mongoose.Types.ObjectId(id)) };
  }

  try {
    const facility = await ParkingFacility.findOne(query).select('_id name');
    if (!facility) {
      logger.warn(`[Chatbot] Facility not found: "${facilityName}"`, { escapedName, scopeCount: facilityScope?.length });
      return null;
    }
    return facility._id?.toString();
  } catch (err: any) {
    logger.error(`[Chatbot] Error resolving facility name: "${facilityName}"`, { error: err.message });
    return null;
  }
}

async function queryWithScope(
  handler: (args: any, facilityId?: string) => Promise<any>,
  args: any,
  facilityId: string | null | undefined,
  facilityScope?: string[]
): Promise<any> {
  if (facilityId === null) {
    return { error: 'Không tìm thấy tòa nhà này hoặc bạn không có quyền truy cập dữ liệu của tòa nhà này.' };
  }
  if (facilityId) {
    const facility = await ParkingFacility.findById(facilityId).select('name').lean();
    const result = await handler(args, facilityId);
    if (result.error) return result;
    return { ...result, facilityName: facility?.name || 'Không rõ' };
  }
  if (facilityScope && facilityScope.length > 0) {
    if (facilityScope.length === 1) {
      const facility = await ParkingFacility.findById(facilityScope[0]).select('name').lean();
      const result = await handler(args, facilityScope[0]);
      if (result.error) return result;
      return { ...result, facilityName: facility?.name || 'Không rõ' };
    }
    const [facilities, ...results] = await Promise.all([
      ParkingFacility.find({
        _id: { $in: facilityScope.map((id) => new mongoose.Types.ObjectId(id)) },
      }).select('_id name').lean(),
      ...facilityScope.map((fId) => handler(args, fId).catch((err: any) => {
        logger.warn(`[Chatbot] Handler failed for facility ${fId}`, { error: err.message });
        return null;
      })),
    ]);
    const nameMap = new Map<string, string>(facilities.map((f: any) => [f._id.toString(), f.name]));
    return mergeMultiFacilityData(results.filter(Boolean), facilityScope, nameMap);
  }
  const allFacilities = await ParkingFacility.find({ status: 'active' }).select('_id name').lean();
  if (allFacilities.length === 0) return handler(args);
  if (allFacilities.length === 1) {
    const result = await handler(args, allFacilities[0]._id.toString());
    if (result.error) return result;
    return { ...result, facilityName: allFacilities[0].name };
  }
  const allIds = allFacilities.map((f: any) => f._id.toString());
  const results = await Promise.all(allIds.map((fId: string) => handler(args, fId).catch((err: any) => {
    logger.warn(`[Chatbot] Handler failed for facility ${fId}`, { error: err.message });
    return null;
  })));
  const nameMap = new Map(allFacilities.map((f: any) => [f._id.toString(), f.name]));
  return mergeMultiFacilityData(results.filter(Boolean), allIds, nameMap);
}

function mergeMultiFacilityData(results: any[], facilityIds: string[], nameMap: Map<string, string>): any {
  if (results.length === 0) return {};
  if (results.length === 1) {
    return { ...results[0], facilityName: nameMap.get(facilityIds[0]) || 'Không rõ' };
  }
  const perFacility = results.map((result, index) => ({
    facilityName: nameMap.get(facilityIds[index]) || `Tòa ${index + 1}`,
    ...(result || {}),
  }));
  const merged: any = { facilitiesIncluded: facilityIds.length, perFacility };
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

// ─── Data Handlers ─────────────────────────────────────────

async function handleRevenueReport(args: any, facilityId?: string) {
  const timeRange = resolveTimeRange(args.timeRange, args.customStartDate, args.customEndDate);
  return ReportService.getRevenueReport({ facilityId, startDate: timeRange.startDate, endDate: timeRange.endDate, groupBy: 'day' });
}
async function handleTrafficReport(args: any, facilityId?: string) {
  const timeRange = resolveTimeRange(args.timeRange, args.customStartDate, args.customEndDate);
  return ReportService.getTrafficReport({ facilityId, startDate: timeRange.startDate, endDate: timeRange.endDate, groupBy: 'day' });
}
async function handleOccupancyReport(args: any, facilityId?: string) {
  return ReportService.getOccupancyReport({ facilityId });
}
async function handlePeakHours(args: any, facilityId?: string) {
  const timeRange = resolveTimeRange(args.timeRange, args.customStartDate, args.customEndDate);
  return ReportService.getPeakHoursReport({ facilityId, startDate: timeRange.startDate, endDate: timeRange.endDate });
}
async function handleFacilityInfo(args: any, facilityId?: string) {
  if (facilityId) {
    const facility = await ParkingFacility.findById(facilityId);
    return facility ? facility.toObject() : { error: 'Không tìm thấy bãi xe' };
  }
  const facilities = await ParkingFacility.find({ status: 'active' }).select('name address openTime closeTime status totalSlots');
  return { facilities, total: facilities.length };
}
async function handleExceptionSummary(args: any, facilityId?: string) {
  const timeRange = resolveTimeRange(args.timeRange, args.customStartDate, args.customEndDate);
  const matchStage: any = { createdAt: { $gte: new Date(timeRange.startDate), $lte: new Date(timeRange.endDate) } };
  if (facilityId) {
    const sessionIds = await ParkingSession.find({ facilityId }).select('_id').then((sessions) => sessions.map((s) => s._id));
    matchStage.sessionId = { $in: sessionIds };
  }
  const [byType, byStatus, total] = await Promise.all([
    Exception.aggregate([{ $match: matchStage }, { $group: { _id: '$type', count: { $sum: 1 } } }]),
    Exception.aggregate([{ $match: matchStage }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Exception.countDocuments(matchStage),
  ]);
  return {
    total,
    byType: byType.map((item: any) => ({ type: item._id, count: item.count })),
    byStatus: byStatus.map((item: any) => ({ status: item._id, count: item.count })),
  };
}
async function handleActiveSessions(args: any, facilityId?: string) {
  const filter: any = { status: { $in: [SessionStatus.ACTIVE, SessionStatus.EXCEPTION] } };
  if (facilityId) filter.facilityId = facilityId;
  const [total, byVehicleType] = await Promise.all([
    ParkingSession.countDocuments(filter),
    ParkingSession.aggregate([
      { $match: filter },
      { $lookup: { from: 'vehicletypes', localField: 'vehicleTypeId', foreignField: '_id', as: 'vehicleType' } },
      { $unwind: '$vehicleType' },
      { $group: { _id: { vehicleTypeId: '$vehicleTypeId', vehicleTypeName: '$vehicleType.name' }, count: { $sum: 1 } } },
    ]),
  ]);
  return {
    totalActiveSessions: total,
    byVehicleType: byVehicleType.map((item: any) => ({ vehicleType: item._id.vehicleTypeName, count: item.count })),
  };
}
async function handleFeedbackReport(args: any, facilityId?: string) {
  const timeRange = resolveTimeRange(args.timeRange, args.customStartDate, args.customEndDate);
  const filter: any = { createdAt: { $gte: new Date(timeRange.startDate), $lte: new Date(timeRange.endDate) } };
  if (facilityId) filter.facilityId = facilityId;
  const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  const summary = {
    totalFeedbacks: feedbacks.length,
    byStatus: feedbacks.reduce((acc: any, f: any) => { acc[f.status] = (acc[f.status] || 0) + 1; return acc; }, {}),
    byType: feedbacks.reduce((acc: any, f: any) => { acc[f.type] = (acc[f.type] || 0) + 1; return acc; }, {}),
    recentComplaints: feedbacks.filter((f: any) => (f.type as string).toLowerCase() === 'complaint').slice(0, 3).map((f: any) => f.description),
  };
  return { summary };
}

// ─── Gemini Tools (Function Declarations) ─────────────────

const timeRangeDesc = "Khoảng thời gian. Giá trị preset: today, yesterday, this_week, last_week, this_month, last_month, this_year, last_year, last_7_days, last_30_days, last_N_days (thay N bằng số ngày, ví dụ: last_2_days, last_3_days, last_14_days), all_time (tất cả). Nếu user yêu cầu khoảng thời gian cụ thể (ví dụ: từ ngày 1/6 đến 15/6) thì KHÔNG dùng timeRange, hãy dùng customStartDate và customEndDate thay thế.";
const customDateDesc = "Ngày bắt đầu/kết thúc tùy chỉnh theo format YYYY-MM-DD (ví dụ: 2026-06-01). Chỉ dùng khi user yêu cầu khoảng thời gian cụ thể không nằm trong các preset.";

const reportTools: Tool[] = [{
  functionDeclarations: [
    {
      name: "get_revenue_report",
      description: "Lấy báo cáo doanh thu theo khoảng thời gian và bãi xe",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          timeRange: { type: SchemaType.STRING, description: timeRangeDesc },
          customStartDate: { type: SchemaType.STRING, description: customDateDesc },
          customEndDate: { type: SchemaType.STRING, description: customDateDesc },
          facilityName: { type: SchemaType.STRING, description: "Tên tòa nhà/bãi xe (optional)" },
        }
      }
    },
    {
      name: "get_traffic_report",
      description: "Lấy báo cáo lượt xe vào/ra theo khoảng thời gian",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          timeRange: { type: SchemaType.STRING, description: timeRangeDesc },
          customStartDate: { type: SchemaType.STRING, description: customDateDesc },
          customEndDate: { type: SchemaType.STRING, description: customDateDesc },
          facilityName: { type: SchemaType.STRING },
        }
      }
    },
    {
      name: "get_occupancy_report",
      description: "Lấy báo cáo tỷ lệ lấp đầy hiện tại của bãi xe",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          facilityName: { type: SchemaType.STRING },
        }
      }
    },
    {
      name: "get_peak_hours_report",
      description: "Lấy báo cáo khung giờ cao điểm (nhiều xe vào ra nhất)",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          timeRange: { type: SchemaType.STRING, description: timeRangeDesc },
          customStartDate: { type: SchemaType.STRING, description: customDateDesc },
          customEndDate: { type: SchemaType.STRING, description: customDateDesc },
          facilityName: { type: SchemaType.STRING },
        }
      }
    },
    {
      name: "get_exception_summary",
      description: "Tóm tắt các trường hợp ngoại lệ (mất thẻ, sai biển, etc.)",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          timeRange: { type: SchemaType.STRING, description: timeRangeDesc },
          customStartDate: { type: SchemaType.STRING, description: customDateDesc },
          customEndDate: { type: SchemaType.STRING, description: customDateDesc },
          facilityName: { type: SchemaType.STRING },
        }
      }
    },
    {
      name: "get_active_sessions",
      description: "Lấy số lượng xe đang được gửi trong bãi (active sessions)",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          facilityName: { type: SchemaType.STRING },
        }
      }
    },
    {
      name: "get_feedback_report",
      description: "Lấy báo cáo phản hồi của khách hàng",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          timeRange: { type: SchemaType.STRING, description: timeRangeDesc },
          customStartDate: { type: SchemaType.STRING, description: customDateDesc },
          customEndDate: { type: SchemaType.STRING, description: customDateDesc },
          facilityName: { type: SchemaType.STRING },
        }
      }
    },
    {
      name: "get_facility_info",
      description: "Lấy thông tin của các tòa nhà / bãi xe",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          facilityName: { type: SchemaType.STRING },
        }
      }
    }
  ]
}];

const FUNCTION_HANDLERS: Record<string, (args: any, facilityId?: string) => Promise<any>> = {
  get_revenue_report: handleRevenueReport,
  get_traffic_report: handleTrafficReport,
  get_occupancy_report: handleOccupancyReport,
  get_peak_hours_report: handlePeakHours,
  get_exception_summary: handleExceptionSummary,
  get_active_sessions: handleActiveSessions,
  get_feedback_report: handleFeedbackReport,
  get_facility_info: handleFacilityInfo,
};

// ─── Quick Reply Suggestions ──────────────────────────────

const QUICK_REPLIES = {
  overview: ['Tình hình hôm nay thế nào?', 'Tóm tắt tuần này cho tôi'],
  revenue: ['Doanh thu hôm nay bao nhiêu?', 'So sánh doanh thu tuần này với tuần trước', 'Tòa nhà nào doanh thu cao nhất tháng này?'],
  traffic: ['Tuần này có bao nhiêu lượt xe?', 'Giờ nào đông nhất hôm nay?', 'So sánh lượt xe hôm nay và hôm qua'],
  operations: ['Tỷ lệ lấp đầy bãi xe hiện tại?', 'Có bao nhiêu xe đang gửi?', 'Tóm tắt ngoại lệ tuần này'],
  insights: ['Có vấn đề gì cần chú ý không?', 'Phân tích xu hướng doanh thu 30 ngày qua', 'Khách hàng phàn nàn gì gần đây?'],
};

// ─── Conversation Title Generator ─────────────────────────

/**
 * Tạo tiêu đề ngắn gọn cho conversation dựa trên tin nhắn đầu tiên.
 * Dùng Gemini để tóm tắt thành ≤8 từ.
 */
async function generateConversationTitle(firstMessage: string): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: env.GEMINI_MODEL });
    const result = await model.generateContent(
      `Tóm tắt câu sau thành tiêu đề ngắn gọn (tối đa 8 từ tiếng Việt), không dùng dấu ngoặc kép, không giải thích:\n"${firstMessage}"`
    );
    const title = result.response.text().trim().replace(/^["']|["']$/g, '');
    return title.length > 100 ? title.substring(0, 100) : title;
  } catch (err: any) {
    logger.warn('[Chatbot] Failed to generate conversation title', { error: err.message });
    // Fallback: cắt tin nhắn đầu tiên làm title
    return firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
  }
}

// ─── Retry Helper ─────────────────────────────────────────

/**
 * Retry một async function với exponential backoff.
 * Chỉ retry khi gặp transient errors (429, 503, network).
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 2000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isRetryable =
        err.message?.includes('429') ||
        err.message?.includes('503') ||
        err.message?.includes('UNAVAILABLE') ||
        err.message?.includes('DEADLINE_EXCEEDED');
      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }
      const delay = baseDelayMs * Math.pow(2, attempt);
      logger.warn(`[Chatbot] Retrying Gemini call (attempt ${attempt + 1}/${maxRetries})`, {
        error: err.message,
        delayMs: delay,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// ─── Main Service ─────────────────────────────────────────

export class ChatbotService {
  static async processQuery(
    userId: string,
    message: string,
    facilityScope?: string[],
    conversationId?: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    const isNewConversation = !conversationId;
    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      // Xây dựng system prompt động theo scope Manager
      const systemPrompt = await buildSystemPrompt(facilityScope);

      const ai = getGenAI();
      const model = ai.getGenerativeModel({
        model: env.GEMINI_MODEL,
        tools: reportTools,
        systemInstruction: systemPrompt,
      });

      // Load up to 10 recent messages for this conversation context
      const historyDocs = await ChatHistory.find({ userId, conversationId: convId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      
      const history = historyDocs.reverse().flatMap((doc) => [
        { role: 'user' as const, parts: [{ text: doc.message }] },
        { role: 'model' as const, parts: [{ text: doc.response }] }
      ]);

      const chat = model.startChat({ history });

      // Send the user message with retry
      let result = await withRetry(() => chat.sendMessage([{ text: message }]));
      let functionCalls = result.response.functionCalls();
      let accumulatedData: any = {};

      // Handle multi-turn function calls (AI có thể gọi nhiều lượt)
      const MAX_FUNCTION_CALL_ROUNDS = 3;
      let round = 0;
      while (functionCalls && functionCalls.length > 0 && round < MAX_FUNCTION_CALL_ROUNDS) {
        round++;
        const functionResponses: Array<{ functionResponse: { name: string; response: any } }> = [];
        
        for (const call of functionCalls) {
          const handler = FUNCTION_HANDLERS[call.name];
          if (handler) {
            try {
              const facilityId = await resolveFacilityId((call.args as any).facilityName, facilityScope);
              const data = await queryWithScope(handler, call.args, facilityId, facilityScope);
              accumulatedData[call.name] = data;
              
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: data
                }
              });
            } catch (err: any) {
              logger.error(`[Chatbot] Function ${call.name} error`, { error: err.message });
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { error: err.message }
                }
              });
            }
          }
        }
        
        // Send function responses back to the model
        if (functionResponses.length > 0) {
          result = await withRetry(() => chat.sendMessage(functionResponses));
          functionCalls = result.response.functionCalls();
        } else {
          break;
        }
      }

      const responseText = result.response.text();
      let answer = responseText;
      let chartType = null;

      // Try to parse JSON from the response text
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.answer) answer = parsed.answer;
          if (parsed.chartType) chartType = parsed.chartType;
        }
      } catch (e) {
        // Fallback to raw text if it didn't return valid JSON
      }

      const processingTimeMs = Date.now() - startTime;

      // Check if this is the first message in the conversation
      const existingCount = await ChatHistory.countDocuments({ userId, conversationId: convId });
      const isFirstMessage = existingCount === 0;

      // Generate title for new conversations
      let title = '';
      if (isFirstMessage) {
        title = await generateConversationTitle(message);
      }

      // Save history
      try {
        const validScope = facilityScope?.filter((id) => id && mongoose.Types.ObjectId.isValid(id));
        await ChatHistory.create({
          userId: new mongoose.Types.ObjectId(userId),
          conversationId: convId,
          title: isFirstMessage ? title : undefined,
          isFirstMessage,
          message,
          intent: Object.keys(accumulatedData).join(',') || 'general_query',
          entities: {},
          response: answer,
          responseData: accumulatedData,
          chartType: chartType || null,
          processingTimeMs,
          facilityScope: validScope && validScope.length > 0 ? validScope.map((id) => new mongoose.Types.ObjectId(id)) : [],
        });
      } catch (saveErr: any) {
        logger.error('[Chatbot] Failed to save chat history', { error: saveErr.message, userId });
      }

      return {
        answer,
        data: accumulatedData,
        chartType,
        processingTimeMs,
        conversationId: convId,
      };
    } catch (error: any) {
      logger.error('[Chatbot] processQuery error', { error: error.message, stack: error.stack });
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new AppError('AI Chatbot đang quá tải. Vui lòng thử lại sau 30 giây.', 429);
      }
      if (error.message?.includes('503') || error.message?.includes('Service Unavailable') || error.message?.includes('high demand')) {
        throw new AppError('Hệ thống AI (Google Gemini) đang quá tải do lượng truy cập cao. Vui lòng thử lại sau 1-2 phút.', 503);
      }
      if (error.message?.includes('API_KEY')) {
        throw new AppError('Chatbot AI chưa được cấu hình. Vui lòng liên hệ Admin.', 503);
      }
      throw new AppError(`Chatbot gặp lỗi: ${error.message}`, 500);
    }
  }

  static async getChatHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      ChatHistory.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ChatHistory.countDocuments({ userId }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async clearChatHistory(userId: string) {
    const result = await ChatHistory.deleteMany({ userId });
    return { deletedCount: result.deletedCount };
  }

  static getQuickReplies() {
    return QUICK_REPLIES;
  }

  static async getConversations(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    // Lấy danh sách conversationId duy nhất, kèm title từ tin nhắn đầu tiên
    const pipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      { $group: { 
          _id: '$conversationId', 
          lastMessage: { $first: '$message' },
          lastResponse: { $first: '$response' },
          updatedAt: { $first: '$createdAt' },
          // Lấy title từ record có isFirstMessage = true (hoặc fallback record đầu tiên theo createdAt ASC)
          titles: { $push: { title: '$title', isFirst: '$isFirstMessage' } },
        }
      },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];
    
    const countPipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$conversationId' } },
      { $count: 'total' }
    ];

    const [data, countResult] = await Promise.all([
      ChatHistory.aggregate(pipeline as any),
      ChatHistory.aggregate(countPipeline as any)
    ]);

    const total = countResult[0]?.total || 0;

    return {
      data: data.map(d => {
        // Tìm title từ record đầu tiên (isFirstMessage = true)
        const firstMsgRecord = d.titles?.find((t: any) => t.isFirst && t.title);
        const title = firstMsgRecord?.title || d.lastMessage?.substring(0, 50) || 'Cuộc hội thoại';

        return {
          conversationId: d._id,
          title,
          lastMessage: d.lastMessage,
          lastResponse: d.lastResponse,
          updatedAt: d.updatedAt,
        };
      }),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getConversationMessages(userId: string, conversationId: string) {
    const data = await ChatHistory.find({ userId, conversationId })
      .sort({ createdAt: 1 })
      .lean();
    return data;
  }

  static async deleteConversation(userId: string, conversationId: string) {
    const result = await ChatHistory.deleteMany({ userId, conversationId });
    return { deletedCount: result.deletedCount };
  }

  /**
   * Đổi tên (title) của conversation.
   * Cập nhật title trên record đầu tiên (isFirstMessage = true).
   */
  static async renameConversation(userId: string, conversationId: string, newTitle: string) {
    // Tìm record đầu tiên của conversation
    const firstRecord = await ChatHistory.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      conversationId,
      isFirstMessage: true,
    });

    if (!firstRecord) {
      // Fallback: cập nhật record cũ nhất nếu không có isFirstMessage
      const oldestRecord = await ChatHistory.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        conversationId,
      }).sort({ createdAt: 1 });

      if (!oldestRecord) {
        throw new AppError('Không tìm thấy cuộc hội thoại này.', 404);
      }

      oldestRecord.title = newTitle.trim();
      oldestRecord.isFirstMessage = true;
      await oldestRecord.save();
      return { conversationId, title: newTitle.trim() };
    }

    firstRecord.title = newTitle.trim();
    await firstRecord.save();
    return { conversationId, title: newTitle.trim() };
  }
}
