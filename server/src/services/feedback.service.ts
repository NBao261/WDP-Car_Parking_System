import { Feedback, IFeedback, FeedbackStatus } from '../models/feedback.model';
import { ParkingSession } from '../models/parkingSession.model';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

export class FeedbackService {
  /**
   * FR-17.1: Tạo phản hồi (Driver only)
   */
  static async createFeedback(userId: string, data: {
    sessionId?: string;
    type: string;
    description: string;
    images?: string[];
  }): Promise<IFeedback> {
    // Validate session nếu có
    if (data.sessionId) {
      const session = await ParkingSession.findById(data.sessionId);
      if (!session) throw new AppError('Lượt gửi xe không tồn tại', 404);
    }

    const feedback = await Feedback.create({
      userId,
      sessionId: data.sessionId || null,
      type: data.type,
      description: data.description,
      images: data.images || [],
      status: FeedbackStatus.SUBMITTED,
    });

    logger.info(`Feedback created: ${feedback._id} by user ${userId}, type: ${data.type}`);

    return feedback.populate([
      { path: 'userId', select: 'fullName email phone' },
      { path: 'sessionId', select: 'code licensePlate checkInTime' },
    ]);
  }

  /**
   * FR-17.2: Xem danh sách phản hồi
   * Driver: chỉ xem của mình
   * Manager/Admin: xem tất cả, filter
   * Staff: xem liên quan (feedback liên quan đến session mà mình xử lý)
   */
  static async getFeedbacks(
    userId: string,
    role: string,
    query: any
  ): Promise<{ data: IFeedback[]; total: number; page: number; totalPages: number }> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // PQ-03: Driver chỉ xem dữ liệu của mình
    if (role === 'driver') {
      filter.userId = userId;
    }

    if (query?.status) filter.status = query.status;
    if (query?.type) filter.type = query.type;
    if (query?.userId && role !== 'driver') filter.userId = query.userId;

    const sortBy = query?.sortBy || 'createdAt';
    const sortOrder = query?.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      Feedback.find(filter)
        .populate('userId', 'fullName email phone')
        .populate('sessionId', 'code licensePlate checkInTime')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Feedback.countDocuments(filter),
    ]);

    return {
      data: data as any[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * FR-17.3: Xử lý phản hồi (Manager/Admin)
   * Cập nhật trạng thái + ghi chú phản hồi
   */
  static async updateFeedbackStatus(
    feedbackId: string,
    managerId: string,
    data: { status: string; responseNote?: string }
  ): Promise<IFeedback> {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) throw new AppError('Phản hồi không tồn tại', 404);

    // Không thể xử lý feedback đã resolved/rejected
    if ([FeedbackStatus.RESOLVED, FeedbackStatus.REJECTED].includes(feedback.status as FeedbackStatus)) {
      throw new AppError('Phản hồi đã được xử lý, không thể thay đổi', 400);
    }

    feedback.status = data.status as FeedbackStatus;
    if (data.responseNote !== undefined) {
      feedback.responseNote = data.responseNote;
    }
    await feedback.save();

    logger.info(`Feedback ${feedbackId} updated to ${data.status} by manager ${managerId}`);

    return feedback.populate([
      { path: 'userId', select: 'fullName email phone' },
      { path: 'sessionId', select: 'code licensePlate checkInTime' },
    ]);
  }

  /**
   * Xem chi tiết feedback
   */
  static async getFeedbackById(feedbackId: string): Promise<IFeedback> {
    const feedback = await Feedback.findById(feedbackId)
      .populate('userId', 'fullName email phone')
      .populate('sessionId', 'code licensePlate checkInTime');

    if (!feedback) throw new AppError('Phản hồi không tồn tại', 404);
    return feedback;
  }
}
