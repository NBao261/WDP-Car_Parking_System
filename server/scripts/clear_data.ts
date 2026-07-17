import { connectDatabase } from '../src/database/connection';
import { ParkingSession } from '../src/models/parkingSession.model';
import { Exception } from '../src/models/exception.model';
import { Reservation } from '../src/models/reservation.model';
import { Payment } from '../src/models/payment.model';
import { ChatHistory } from '../src/models/chatHistory.model';
import { AuditLog } from '../src/models/auditLog.model';
import { Feedback } from '../src/models/feedback.model';
import { Vehicle } from '../src/models/vehicle.model';
import { ParkingSlot, SlotStatus } from '../src/models/parkingSlot.model';

const clear = async () => {
  try {
    await connectDatabase();
    console.log('Clearing auto-generated data...');
    await ParkingSession.deleteMany({});
    await Exception.deleteMany({});
    await Reservation.deleteMany({});
    await Payment.deleteMany({});
    await ChatHistory.deleteMany({});
    await AuditLog.deleteMany({});
    await Feedback.deleteMany({});
    await Vehicle.deleteMany({});
    
    await ParkingSlot.updateMany({}, { status: SlotStatus.AVAILABLE, currentSessionId: null });
    
    console.log('Data cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
}
clear();
