import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Pagination } from '../../../../components/ui/Pagination';
import { IReservation, ReservationStatus } from '../../../../services/reservation.service';

interface ReservationTableProps {
  reservations: IReservation[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetail: (reservation: IReservation) => void;
}

export function ReservationTable({
  reservations,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetail,
}: ReservationTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return <Badge variant="warning">Chờ duyệt</Badge>;
      case ReservationStatus.CONFIRMED:
        return <Badge variant="success">Đã xác nhận</Badge>;
      case ReservationStatus.USED:
        return <Badge variant="info">Đã sử dụng</Badge>;
      case ReservationStatus.CANCELLED:
        return <Badge variant="destructive">Đã hủy</Badge>;
      case ReservationStatus.EXPIRED:
        return <Badge variant="secondary">Hết hạn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        Đang tải dữ liệu đặt chỗ...
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Không tìm thấy đặt chỗ</h3>
        <p className="text-gray-500 text-sm">Chưa có lượt đặt chỗ nào khớp với điều kiện tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đặt chỗ</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Biển số xe</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation._id}>
              <TableCell className="font-medium text-gray-900">{reservation.code}</TableCell>
              <TableCell>
                <div className="text-sm font-medium text-gray-900">{reservation.userId?.fullName}</div>
                <div className="text-xs text-gray-500">{reservation.userId?.phone}</div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-mono text-sm uppercase">
                  {reservation.licensePlate}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">{reservation.vehicleTypeId?.name}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <span className="text-gray-500 mr-1">Vào:</span>
                  {formatDate(reservation.startTime)}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 mr-1">Ra:</span>
                  {formatDate(reservation.endTime)}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(reservation.status)}</TableCell>
              <TableCell className="text-right">
                <button
                  onClick={() => onViewDetail(reservation)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Xem chi tiết
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
