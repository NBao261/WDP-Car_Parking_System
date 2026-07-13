# User Flow Diagram Mapping

Below is the mapping of the 7 main flowcharts for the Car Parking System based on the codebase logic:

| Flow # | Filename                                                                                                                   | Description                                                                           | Roles                 |
| ------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------- |
| **01** | [01_WalkIn_CheckIn.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/01_WalkIn_CheckIn.drawio)           | Xe vãng lai vào bãi (quét biển, tạo session)                                          | Staff, System         |
| **02** | [02_CheckOut_Payment.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/02_CheckOut_Payment.drawio)       | Xe ra bãi, tính tiền, thanh toán và xử lý ngoại lệ biển số không khớp                 | Staff, System         |
| **03** | [03_Reservation_CheckIn.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/03_Reservation_CheckIn.drawio) | Đặt chỗ trước qua App và làm thủ tục Check-in bằng QR (quét QR, chụp ảnh, so biển số) | Driver, Staff, System |
| **04** | [04_AI_Chatbot.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/04_AI_Chatbot.drawio)                   | Tra cứu thống kê và hỏi đáp qua AI Chatbot                                            | Manager, System / AI  |
| **05** | [05_Admin_Facility.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/05_Admin_Facility.drawio)           | Admin khởi tạo bãi đỗ xe mới, cấu hình tầng & vị trí đỗ                               | Admin, System         |
| **06** | [06_Admin_Pricing.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/06_Admin_Pricing.drawio)             | Admin cấu hình biểu phí block, áp dụng bảng giá cho bãi đỗ                            | Admin, System         |
| **07** | [07_Admin_User_Access.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/07_Admin_User_Access.drawio)     | Admin quản lý tài khoản nhân viên, phân quyền RBAC                                    | Admin, System         |

> [!NOTE]
>
> - Flow Exception Handling cũ đã được tích hợp hoàn toàn vào Flow 02 để đảm bảo quy trình check-out và xử lý sự cố biển số lệch khớp được liên tục.
> - Tính năng thanh toán online khi đặt lịch đã được gỡ bỏ để khớp với thực tế codebase (chỉ thanh toán lúc check-out).
