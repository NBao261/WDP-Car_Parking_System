# WDP - Car Parking Management System

Hệ thống quản lý bãi đỗ xe thông minh ứng dụng nhận diện biển số tự động (ALPR).

## 📂 Cấu trúc dự án (Monorepo)

*   `server/`: Backend Core API (Node.js + Express + TypeScript + MongoDB).
*   `alpr-service/`: Dịch vụ AI nhận diện biển số xe (Python + FastAPI + YOLOv8 + EasyOCR).
*   `web/`: Ứng dụng Web dành cho nhân viên (Staff), quản lý (Manager) và quản trị viên (Admin) [React + Vite].
*   `mobile/`: Ứng dụng di động dành cho khách gửi xe (Driver).
*   `shared/`: Thư mục chứa các kiểu dữ liệu và định nghĩa dùng chung (TypeScript types/interfaces).
*   `docs/`: Tài liệu hướng dẫn thiết kế & kiến trúc hệ thống.

## 🏗️ Kiến trúc hệ thống: Kiến trúc 3 tầng tích hợp Hướng dịch vụ (Three-Tier Architecture with Service-Oriented Integration)

Sơ đồ kiến trúc tổng thể của hệ thống được lưu tại file [system_architecture.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/system_architecture.drawio), bao gồm:

*   **Tầng Giao diện (Presentation Tier - Frontend)**: React Web App (`web/`) & Mobile App (`mobile/`).
*   **Tầng Nghiệp vụ (Application Tier - Backend / SOA)**: Node.js Core Backend API Server (`server/`) đóng vai trò điều phối chính và Python ALPR Service (`alpr-service/`) xử lý mô hình AI YOLOv8 độc lập.
*   **Tầng Dữ liệu (Data Tier - Persistence)**: Cơ sở dữ liệu MongoDB lưu trữ thông tin thực thể và Cloud Storage lưu trữ hình ảnh xe lúc Check-in/out.
*   **Dịch vụ bên thứ ba (Third-Party Services)**: Cổng thanh toán (MoMo/ZaloPay) và AI Assistant API (Gemini/OpenAI) cho chatbot.

---

## 🔄 Các luồng nghiệp vụ chính (User Flows)

Chi tiết 7 luồng nghiệp vụ lõi được lưu trữ tại thư mục [docs/flows/](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/):

*   **01. Walk-in Check-in**: [01_WalkIn_CheckIn.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/01_WalkIn_CheckIn.drawio) - Xe vãng lai vào bãi.
*   **02. Check-out & Payment**: [02_CheckOut_Payment.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/02_CheckOut_Payment.drawio) - Xe ra bãi & thanh toán (bao gồm xử lý lệch biển số).
*   **03. Reservation Booking & Check-in**: [03_Reservation_CheckIn.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/03_Reservation_CheckIn.drawio) - Tài xế đặt lịch trên app & Check-in bằng QR tại cổng barrier.
*   **04. AI Chatbot Analytics**: [04_AI_Chatbot.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/04_AI_Chatbot.drawio) - Quản lý tra cứu dữ liệu thống kê bãi qua chatbot AI.
*   **05. Admin Facility Setup**: [05_Admin_Facility.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/05_Admin_Facility.drawio) - Khởi tạo bãi đỗ, tầng và vị trí đỗ xe.
*   **06. Admin Pricing**: [06_Admin_Pricing.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/06_Admin_Pricing.drawio) - Cấu hình bảng giá block gửi xe.
*   **07. Admin User Access**: [07_Admin_User_Access.drawio](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/07_Admin_User_Access.drawio) - Quản lý tài khoản và phân quyền hệ thống.

> Chi tiết mô tả từng sơ đồ được tổng hợp tại [docs/flows/README.md](file:///c:/Users/Admin/Desktop/Ki%208/WDPdoc/WDP/docs/flows/README.md).