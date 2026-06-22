import mongoose from 'mongoose';
import { Payment, PaymentMethod, PaymentStatus, IPayment } from '../models/payment.model';
import { ParkingSession, SessionStatus, IParkingSession } from '../models/parkingSession.model';
import { ParkingSlot, SlotStatus } from '../models/parkingSlot.model';
import { SessionService } from './session.service';
import { AppError } from '../middlewares/error.middleware';
import { getIO } from '../config/socket';
import { UploadService } from './upload.service';

export class PaymentService {
  /**
   * Tạo Payment Intent (Dành cho thanh toán Online trước khi ra cổng)
   */
  static async createPaymentIntent(data: {
    sessionId: string;
    method: PaymentMethod;
    driverId?: string;
  }): Promise<{ payment: IPayment; paymentUrl?: string }> {
    const session = await ParkingSession.findById(data.sessionId);
    if (!session) {
      throw new AppError('Session không tồn tại', 404);
    }
    if (session.status === SessionStatus.COMPLETED) {
      throw new AppError('Lượt gửi xe đã kết thúc', 400);
    }

    // Tính toán số tiền hiện tại
    const feeResult = await SessionService.calculateFee(data.sessionId, new Date());
    const totalFee = feeResult.totalFee;

    // Sinh mã giao dịch ngẫu nhiên
    const transactionCode = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const payment = new Payment({
      sessionId: data.sessionId,
      transactionCode,
      amount: totalFee,
      method: data.method,
      status: PaymentStatus.PENDING,
      driverId: data.driverId || session.driverId,
      note: 'Thanh toán trực tuyến (Pre-payment)',
    });

    await payment.save();

    // Giả lập tạo URL thanh toán (Trong thực tế sẽ gọi API VNPay, Momo...)
    let paymentUrl;
    if (data.method === PaymentMethod.QR_PAY || data.method === PaymentMethod.E_WALLET) {
      paymentUrl = `https://mock-payment-gateway.com/pay?txn=${transactionCode}&amount=${totalFee}`;
    }

    return { payment, paymentUrl };
  }

  /**
   * Xử lý Webhook khi thanh toán online thành công
   * Sử dụng MongoDB Transaction để đảm bảo tính toàn vẹn
   */
  static async confirmPaymentWebhook(transactionCode: string): Promise<void> {
    const sessionMongoose = await mongoose.startSession();
    sessionMongoose.startTransaction();

    try {
      // 1. Tìm Payment PENDING
      const payment = await Payment.findOne({ transactionCode }).session(sessionMongoose);
      if (!payment) {
        throw new AppError('Không tìm thấy giao dịch', 404);
      }
      if (payment.status === PaymentStatus.COMPLETED) {
        // Idempotency: Giao dịch đã được xử lý
        await sessionMongoose.abortTransaction();
        sessionMongoose.endSession();
        return;
      }

      // 2. Tìm Session liên quan
      const session = await ParkingSession.findById(payment.sessionId).session(sessionMongoose);
      if (!session) {
        throw new AppError('Không tìm thấy lượt gửi xe', 404);
      }

      // 3. Tìm Slot
      const slot = await ParkingSlot.findById(session.slotId).session(sessionMongoose);

      // 4. Cập nhật Payment -> COMPLETED
      payment.status = PaymentStatus.COMPLETED;
      await payment.save({ session: sessionMongoose });

      // 5. Cập nhật Session -> COMPLETED
      // Lưu ý: Trường hợp thanh toán online trước khi xe ra tới cổng, ta ghi nhận checkOutTime 
      // là thời điểm thanh toán. Hoặc ta có thể giữ pending checkout (tuỳ logic chi tiết).
      // Để đơn giản hoá theo yêu cầu, ta đánh dấu checkout hoàn tất.
      session.checkOutTime = new Date();
      session.status = SessionStatus.COMPLETED;
      session.totalFee = payment.amount;
      await session.save({ session: sessionMongoose });

      // 6. Cập nhật Slot -> AVAILABLE
      if (slot) {
        slot.status = SlotStatus.AVAILABLE;
        slot.currentSessionId = null;
        slot.maintenanceReason = '';
        await slot.save({ session: sessionMongoose });
      }

      // Commit Transaction
      await sessionMongoose.commitTransaction();
      sessionMongoose.endSession();

      // Xử lý Async / Side-effects sau khi commit thành công
      try {
        getIO().to(`facility:${session.facilityId}`).emit('slot:statusChanged', {
          slotId: session.slotId,
          status: SlotStatus.AVAILABLE,
          facilityId: session.facilityId,
        });
      } catch (e) {
        // Bỏ qua lỗi socket
      }
      UploadService.processCompletedSessionImages(session._id.toString()).catch(console.error);

    } catch (error) {
      await sessionMongoose.abortTransaction();
      sessionMongoose.endSession();
      throw error;
    }
  }

  /**
   * Thanh toán bằng tiền mặt tại cổng (Bao gồm tạo Payment + Checkout Session)
   * Sử dụng MongoDB Transaction
   */
  static async processCashCheckout(data: {
    sessionId: string;
    staffOutId: string;
    gateOut: string;
    checkOutImage?: string;
  }): Promise<IParkingSession> {
    const sessionMongoose = await mongoose.startSession();
    sessionMongoose.startTransaction();

    try {
      // 1. Lấy Session
      const session = await ParkingSession.findById(data.sessionId).session(sessionMongoose);
      if (!session) throw new AppError('Session không tồn tại', 404);
      if (session.status === SessionStatus.COMPLETED) {
        throw new AppError('Lượt gửi xe đã kết thúc', 400);
      }
      if (session.status === SessionStatus.EXCEPTION) {
        throw new AppError('Lượt gửi xe đang có ngoại lệ chưa được xử lý', 400);
      }

      // 2. Tính phí
      const checkOutTime = new Date();
      const feeResult = await SessionService.calculateFee(data.sessionId, checkOutTime);

      // 3. Sinh mã giao dịch & Lưu Payment
      const transactionCode = `CASH${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const payment = new Payment({
        sessionId: data.sessionId,
        transactionCode,
        amount: feeResult.totalFee,
        method: PaymentMethod.CASH,
        status: PaymentStatus.COMPLETED, // Vì trả tiền mặt nên COMPLETED luôn
        staffId: data.staffOutId,
      });
      await payment.save({ session: sessionMongoose });

      // 4. Update Session
      session.checkOutTime = checkOutTime;
      session.gateOut = data.gateOut;
      session.staffOutId = new mongoose.Types.ObjectId(data.staffOutId);
      session.totalFee = payment.amount;
      session.status = SessionStatus.COMPLETED;
      if (data.checkOutImage) {
        session.checkOutImage = data.checkOutImage;
      }
      await session.save({ session: sessionMongoose });

      // 5. Update Slot
      const slot = await ParkingSlot.findById(session.slotId).session(sessionMongoose);
      if (slot) {
        slot.status = SlotStatus.AVAILABLE;
        slot.currentSessionId = null;
        slot.maintenanceReason = '';
        await slot.save({ session: sessionMongoose });
      }

      // Commit
      await sessionMongoose.commitTransaction();
      sessionMongoose.endSession();

      // Populate Session để trả về (Bắt buộc dùng outside of transaction vì đã commit)
      const populatedSession = await ParkingSession.findById(session._id)
        .populate('vehicleTypeId', 'name code icon')
        .populate('facilityId', 'name address')
        .populate('floorId', 'name')
        .populate('slotId', 'code status')
        .populate('pricingPlanId', 'name feeType rates')
        .populate('staffInId', 'name email')
        .populate('staffOutId', 'name email');

      // Async
      try {
        getIO().to(`facility:${session.facilityId}`).emit('slot:statusChanged', {
          slotId: session.slotId,
          status: SlotStatus.AVAILABLE,
          facilityId: session.facilityId,
        });
      } catch (err) {}
      UploadService.processCompletedSessionImages(session._id.toString()).catch(console.error);

      return populatedSession!;
    } catch (error) {
      await sessionMongoose.abortTransaction();
      sessionMongoose.endSession();
      throw error;
    }
  }

  /**
   * Lấy lịch sử payment của một Session (Tuỳ chọn)
   */
  static async getPaymentsBySession(sessionId: string): Promise<IPayment[]> {
    return await Payment.find({ sessionId }).sort({ createdAt: -1 }).populate('staffId', 'name email');
  }
}
