# KẾ HOẠCH PHÂN CHIA CÔNG VIỆC – HỆ THỐNG QUẢN LÝ BÃI ĐỖ XE

**Thời gian:** 9 tuần | **Nhóm:** 5 người  
**Tech Stack:** Node.js Express + MongoDB/Mongoose | React (Web) | React Native (Mobile)

---

## 👥 PHÂN CHIA NHÂN SỰ

| Mã  | Vai trò             | Phụ trách chính                                            |
| --- | ------------------- | ---------------------------------------------------------- |
| BE1 | Backend Lead        | API core, DB design, Auth, Parking Session, Thanh toán     |
| BE2 | Backend Developer   | API CRUD, Báo cáo, Ngoại lệ, Realtime (Socket.IO)          |
| FE1 | Frontend Lead (Web) | Web Admin/Manager Dashboard, Báo cáo, Quản trị hệ thống    |
| FE2 | Frontend Dev (Web)  | Web Staff Portal (xe vào/ra, session, thu phí, ngoại lệ)   |
| FE3 | Mobile Dev (RN)     | React Native App cho Driver (xem bãi, đặt chỗ, thanh toán) |

---

## 📅 TỔNG QUAN 9 TUẦN

| Tuần | Phase                        | Mục tiêu chính                                      |
| ---- | ---------------------------- | --------------------------------------------------- |
| 1    | Phase 1: Khởi tạo & Thiết kế | Setup project, DB schema, UI/UX design, boilerplate |
| 2–3  | Phase 2: Core Backend + Auth | API Auth, CRUD tòa nhà/tầng/slot/loại xe, Web Admin |
| 4–5  | Phase 3: Parking Operations  | Session xe vào/ra, tính phí, Staff portal, Mobile   |
| 6–7  | Phase 4: Nâng cao            | Đặt chỗ, thanh toán, báo cáo, ngoại lệ, realtime    |
| 8    | Phase 5: Tích hợp & Testing  | Tích hợp E2E, fix bug, test toàn hệ thống           |
| 9    | Phase 6: Hoàn thiện & Deploy | Polish UI, docs, deploy, demo                       |

---

## 🔵 PHASE 1 – TUẦN 1: KHỞI TẠO & THIẾT KẾ

### BE1 – Backend Lead

- [x] Khởi tạo project Node.js Express (folder structure: routes/controllers/services/models)
- [x] Setup MongoDB + Mongoose connection
- [x] Thiết kế toàn bộ Mongoose Schema:
  - `User` (name, email, phone, password, role, assignedFacilities, status)
  - `ParkingFacility` (name, address, floors, openTime, closeTime, status)
  - `Floor` (facilityId, name, allowedVehicleTypes, status)
  - `VehicleType` (name, code, slotSize, icon)
  - `ParkingSlot` (code, floorId, facilityId, vehicleType, status, currentSessionId)
  - `PricingPlan` (name, vehicleType, facilityId, feeType, rates, surcharges, status)
  - `ParkingSession` (code, licensePlate, vehicleType, checkInTime, checkOutTime, slotId, staffIn, staffOut, fee, status, paymentStatus)
  - `Reservation` (userId, vehicleType, facilityId, slotId, startTime, endTime, status)
  - `Payment` (sessionId, amount, method, staffId, status, transactionCode)
  - `Exception` (sessionId, type, description, staffId, status, managerNote)
  - `Feedback` (userId, sessionId, type, description, images, status)
  - `SystemConfig` / `AuditLog`
- [x] Setup ESLint + Prettier cho backend
- [x] Viết seed data cơ bản

### BE2 – Backend Developer

- [x] Setup middleware: error handler, logger (Winston), CORS, rate limiter
- [x] Setup Swagger/OpenAPI documentation skeleton
- [x] Tạo base CRUD utility (generic controller pattern)
- [x] Nghiên cứu & setup Socket.IO server cơ bản
- [x] Viết helper: pagination, filtering, sorting cho query MongoDB

### FE1 – Frontend Lead (Web)

- [x] Khởi tạo React project (Vite)
- [x] Setup design system: theme, colors, typography, spacing
- [x] Tạo layout components: Sidebar, Header, MainContent, Breadcrumb
- [x] Setup routing (React Router): Admin routes, Manager routes, Staff routes
- [x] Setup state management (Zustand/Redux Toolkit), Axios instance
- [x] ESLint + Prettier cho frontend

### FE2 – Frontend Dev (Web)

- [x] Thiết kế wireframe/mockup cho Staff Portal (Figma hoặc trên giấy)
- [x] Tạo shared UI components: Button, Input, Select, Modal, Table, Badge, Toast
- [x] Tạo component Loading, ErrorBoundary, ConfirmDialog
- [x] Setup form validation (React Hook Form + Zod/Yup)

### FE3 – Mobile Dev (React Native)

- [x] Khởi tạo React Native project (Expo)
- [x] Setup navigation (React Navigation): Tab, Stack
- [x] Tạo design system mobile: theme, typography, spacing
- [x] Tạo shared mobile components: Button, Input, Card, Badge
- [x] Setup Axios instance, AsyncStorage cho token

**✅ Deliverable tuần 1:** Project skeleton chạy được trên cả 3 nền tảng, DB schema hoàn chỉnh, UI boilerplate sẵn sàng.

---

## 🟢 PHASE 2 – TUẦN 2–3: CORE BACKEND + AUTH + CRUD QUẢN LÝ

### Tuần 2

#### BE1

- [x] API Authentication: Register, Login, Refresh Token (JWT)
- [x] Middleware Auth: verifyToken, checkRole (RBAC)
- [x] API User CRUD (FR-18): create, update, lock/unlock, resetPassword, list
- [ ] API Role & Permission (FR-19): getAll roles, assignRole, updatePermissions

#### BE2

- [x] API ParkingFacility CRUD (FR-1): create, update, deactivate, list
- [x] API VehicleType CRUD (FR-2): create, update, delete (soft), list
- [x] API Floor CRUD + gán loại xe (FR-3): create, assignVehicleTypes, getFloorMap
- [ ] Validation middleware cho tất cả API trên

#### FE1

- [ ] Trang Login / Quên mật khẩu
- [ ] Layout Admin Panel hoàn chỉnh
- [ ] Trang Quản lý Tài khoản (FR-18): danh sách, tạo/sửa/khóa, filter
- [ ] Trang Phân quyền (FR-19): gán vai trò, xem quyền

#### FE2

- [ ] Trang Login cho Staff
- [ ] Layout Staff Portal (tối ưu cho tablet)
- [ ] Tích hợp Auth flow (login, logout, token refresh)

#### FE3

- [ ] Màn hình Login / Đăng ký Driver
- [ ] Auth flow mobile (JWT + AsyncStorage)
- [ ] Màn hình Home skeleton (tab bar: Trang chủ, Lượt gửi, Đặt chỗ, Tài khoản)

### Tuần 3

#### BE1

- [x] API ParkingSlot CRUD (FR-4): create (bulk), update status, delete, getByFloor
- [x] Business logic: validate chuyển trạng thái slot (BR-3.3)
- [x] API PricingPlan CRUD (FR-5): create, assign to facility, deactivate, list
- [x] Business logic: chỉ 1 bảng giá active / tổ hợp (BR-4.2)

#### BE2

- [x] API SystemConfig (FR-20): get/update config, notification settings
- [x] API AuditLog (FR-20.4): list logs with filter
- [x] API xem thông tin bãi xe công khai (FR-12): facility info, pricing, slot count
- [ ] Unit test cho tất cả API tuần 2-3

#### FE1

- [ ] Trang Quản lý Tòa nhà (FR-1): CRUD + trạng thái
- [ ] Trang Quản lý Loại xe (FR-2): CRUD
- [ ] Trang Phân tầng (FR-3): gán loại xe cho tầng, sơ đồ tầng
- [ ] Trang Cấu hình Hệ thống (FR-20): form cấu hình chung

#### FE2

- [ ] Trang Quản lý Slot (FR-4): bản đồ slot theo tầng, mã màu trạng thái
- [ ] Trang Bảng giá (FR-5): xem danh sách, tạo/sửa bảng giá
- [ ] Component SlotStatusBadge, SlotGrid

#### FE3

- [ ] Màn hình Xem thông tin bãi xe (FR-12.1): tên, địa chỉ, giờ hoạt động
- [ ] Màn hình Xem bảng giá (FR-12.2): hiển thị theo loại xe
- [ ] Màn hình Xem slot trống (FR-12.3): số lượng theo loại xe
- [ ] Pull-to-refresh, loading states

**✅ Deliverable tuần 2–3:** Auth hoạt động, CRUD quản lý hoàn chỉnh, Admin Panel + Staff Portal cơ bản, Mobile xem được thông tin bãi xe.

---

## 🟡 PHASE 3 – TUẦN 4–5: PARKING OPERATIONS (XE VÀO/RA)

### Tuần 4

#### BE1

- [ ] API Check-in xe (FR-8 + FR-9): checkConditions, createSession
  - Validate: loại xe, slot trống, giờ hoạt động, blacklist (BR-5.1)
  - Tạo session + cập nhật slot → Occupied
  - Sinh mã thẻ xe / QR code
- [ ] API gợi ý tầng/khu vực (FR-8.3): dựa trên loại xe + slot trống
- [ ] API tìm session (FR-10.1): theo mã thẻ, biển số, mã session

#### BE2

- [ ] API Check-out xe (FR-10.2 + FR-10.3):
  - Tính phí tự động theo bảng giá (BR-4.3, BR-4.4, BR-4.5)
  - Logic: làm tròn giờ, phí qua đêm, phí quá giờ
  - Thu phí + cập nhật session → Completed, slot → Available
- [ ] API lấy danh sách session đang active (FR-9.2): filter, sort
- [ ] Socket.IO: emit event khi slot thay đổi trạng thái

#### FE1

- [ ] Trang Quản lý Bảng giá nâng cao: nhiều mức giá, phí qua đêm, phí quá giờ
- [ ] Dashboard Manager: tổng quan bãi xe (tổng slot, đang dùng, trống, bảo trì)
- [ ] Realtime: nhận Socket.IO event cập nhật dashboard

#### FE2

- [ ] **Màn hình Xe VÀO bãi** (FR-8 + FR-9):
  - Chọn cổng vào → Chọn loại xe → Nhập biển số
  - Hiển thị kết quả kiểm tra điều kiện
  - Gợi ý tầng/khu vực → Xác nhận tạo session
  - Hiển thị mã thẻ/QR để in
- [ ] Component: LicensePlateInput, SessionCard, QRDisplay

#### FE3

- [ ] Màn hình Lượt gửi hiện tại (FR-15.1): giờ vào, loại xe, khu vực, phí tạm tính
- [ ] Màn hình Lịch sử gửi xe (FR-15.2): danh sách, chi tiết
- [ ] Component: SessionDetailCard, FeeEstimate

### Tuần 5

#### BE1

- [ ] API Payment (FR-16): create payment, confirm payment
  - Ghi nhận: mã giao dịch, session, số tiền, phương thức, Staff
- [ ] Logic thanh toán online: tạo payment intent, webhook callback
- [ ] MongoDB Transaction cho flow: tạo payment + update session + update slot

#### BE2

- [ ] API Exception CRUD (FR-11):
  - Mất thẻ (FR-11.1): tìm session theo biển số, phụ phí mất thẻ
  - Sai biển số (FR-11.2): tạo exception, cần Manager duyệt
  - Quá hạn (FR-11.3): auto-detect, cảnh báo
  - Sai khu vực (FR-11.4): cập nhật slot thực tế
- [ ] API cập nhật trạng thái slot bởi Staff (FR-11.5): giới hạn quyền

#### FE1

- [ ] Trang Quản lý Bảng giá: gán bảng giá cho tòa nhà (FR-5.2)
- [ ] Trang Log hệ thống (FR-20.4): filter, phân trang
- [ ] Nâng cao Dashboard: biểu đồ slot realtime

#### FE2

- [ ] **Màn hình Xe RA bãi** (FR-10):
  - Quét/nhập mã thẻ → Hiển thị session
  - Hiển thị chi tiết phí → Chọn phương thức thanh toán → Xác nhận
  - In biên lai
- [ ] **Màn hình Xử lý Ngoại lệ** (FR-11):
  - Form báo mất thẻ, sai biển số, quá hạn
  - Cập nhật trạng thái slot
- [ ] Component: PaymentSummary, ExceptionForm, ReceiptPreview

#### FE3

- [ ] Màn hình Thanh toán tại bãi (FR-13.2): xem phí, QR thanh toán
- [ ] Màn hình Thanh toán online (FR-16.2): chọn phương thức, xác nhận
- [ ] Tích hợp hiển thị phí tạm tính realtime

**✅ Deliverable tuần 4–5:** Flow xe vào/ra hoạt động E2E, tính phí tự động, thu phí, xử lý ngoại lệ cơ bản, Mobile xem/theo dõi lượt gửi.

---

## 🟠 PHASE 4 – TUẦN 6–7: TÍNH NĂNG NÂNG CAO

### Tuần 6

#### BE1

- [ ] API Reservation (FR-14): create, cancel, list, autoExpire
  - Logic: kiểm tra slot trống theo khung giờ (BR-6.1)
  - Auto-cancel sau 30 phút (BR-6.4) – sử dụng cron job / agenda
  - Chuyển reservation → session khi Driver đến (BR-6.6)
- [ ] API chính sách hủy (BR-6.5): tính phí hủy nếu < 2 giờ

#### BE2

- [ ] API Báo cáo (FR-6):
  - Lượt xe vào/ra (FR-6.1): aggregate theo ngày/tuần/tháng, filter
  - Doanh thu (FR-6.2): aggregate payments, group by method/vehicleType
  - Tỷ lệ lấp đầy (FR-6.3): calculate occupied/total per floor
  - Khung giờ cao điểm (FR-6.4): aggregate by hour
- [ ] API Export báo cáo: xuất Excel (xlsx) / PDF

#### FE1

- [ ] **Trang Báo cáo** (FR-6):
  - Tab Lượt xe: biểu đồ đường/cột, bộ lọc thời gian
  - Tab Doanh thu: tổng, trung bình, biểu đồ xu hướng
  - Tab Lấp đầy: heatmap theo tầng, biểu đồ tròn theo loại xe
  - Tab Cao điểm: biểu đồ phân bố theo giờ
  - Nút xuất Excel/PDF
- [ ] Sử dụng Chart.js hoặc Recharts

#### FE2

- [ ] Danh sách session nâng cao: filter, search, pagination
- [ ] Phím tắt cho Staff: F1 = Xe vào, F2 = Xe ra, F3 = Tìm session
- [ ] Cải thiện UX: auto-focus, tab navigation

#### FE3

- [ ] **Màn hình Đặt chỗ trước** (FR-14.1):
  - Chọn loại xe → Chọn thời gian → Xem khu vực trống → Xác nhận
- [ ] Màn hình Quản lý đặt chỗ (FR-14.2): xem, hủy reservation
- [ ] Push notification setup (Expo Notifications / Firebase FCM)

### Tuần 7

#### BE1

- [ ] API Feedback (FR-17): create, list (by user / all), updateStatus
- [ ] Push notification service: đặt chỗ thành công, nhắc thanh toán, hết hạn giữ chỗ
- [ ] API Ngoại lệ nâng cao (FR-7): list exceptions for Manager, approve/reject
- [ ] Optimize MongoDB queries: indexes cho licensePlate, sessionCode, slotCode

#### BE2

- [ ] Socket.IO events hoàn chỉnh:
  - `slot:statusChanged` – cập nhật bản đồ slot
  - `session:created` / `session:completed` – dashboard
  - `reservation:expired` – thông báo
- [ ] API Backup config (FR-20.5): trigger backup, list backups
- [ ] Integration test cho các flow chính (check-in → check-out → payment)

#### FE1

- [ ] Trang Quản lý Ngoại lệ (FR-7): danh sách, filter, duyệt/từ chối
- [ ] Trang Xem phản hồi: danh sách feedback, trạng thái, trả lời
- [ ] Hoàn thiện Dashboard: widget ngoại lệ, feedback mới

#### FE2

- [ ] Realtime cập nhật bản đồ slot (Socket.IO)
- [ ] Cải thiện flow xe vào/ra: animation, sound feedback
- [ ] Responsive cho tablet: optimize layout

#### FE3

- [ ] Màn hình Gửi phản hồi (FR-17.1): chọn loại, mô tả, đính kèm ảnh
- [ ] Màn hình Theo dõi phản hồi (FR-17.2): trạng thái xử lý
- [ ] Màn hình Tài khoản: thông tin cá nhân, đổi mật khẩu, lịch sử
- [ ] Nhận push notification

**✅ Deliverable tuần 6–7:** Đặt chỗ trước, báo cáo thống kê, ngoại lệ nâng cao, phản hồi, realtime, push notification.

---

## 🔴 PHASE 5 – TUẦN 8: TÍCH HỢP & TESTING

### BE1

- [ ] Fix bugs từ integration testing
- [ ] Performance optimization: DB indexes, query optimization
- [ ] API rate limiting, input sanitization (chống NoSQL Injection)
- [ ] Stress test: 100 concurrent users
- [ ] Hoàn thiện Swagger documentation

### BE2

- [ ] Fix bugs từ integration testing
- [ ] Unit test coverage ≥ 70%
- [ ] Test MongoDB transactions (replica set)
- [ ] Test Socket.IO events dưới tải
- [ ] Security audit: JWT expiry, RBAC bypass, data leaks

### FE1

- [ ] Cross-browser testing: Chrome, Firefox, Edge, Safari
- [ ] Fix responsive issues
- [ ] Accessibility check (WCAG 2.1 AA)
- [ ] Integration test: Admin flows (tạo user → phân quyền → cấu hình)
- [ ] Fix bugs & UI polish

### FE2

- [ ] E2E test Staff flow: xe vào → tạo session → xe ra → thu phí
- [ ] Test trên tablet thực tế
- [ ] Test ngoại lệ flows: mất thẻ, sai biển số
- [ ] Fix bugs & UI polish

### FE3

- [ ] Test trên Android & iOS thực tế
- [ ] Fix platform-specific bugs
- [ ] Test flow: đăng ký → xem bãi → đặt chỗ → theo dõi → thanh toán → phản hồi
- [ ] Optimize performance: lazy loading, image optimization
- [ ] Fix bugs & UI polish

**✅ Deliverable tuần 8:** Hệ thống ổn định, test coverage đạt yêu cầu, không còn bug blocking.

---

## 🟣 PHASE 6 – TUẦN 9: HOÀN THIỆN & DEPLOY

### BE1

- [ ] Deploy backend lên server (VPS / cloud)
- [ ] Setup MongoDB replica set (production)
- [ ] Setup CI/CD pipeline
- [ ] Cấu hình environment: dev, staging, production
- [ ] Viết tài liệu API hoàn chỉnh

### BE2

- [ ] Setup monitoring & health check
- [ ] Setup automated backup (daily)
- [ ] Seed production data (admin account, default config)
- [ ] Viết tài liệu hướng dẫn triển khai

### FE1

- [ ] Build & deploy web lên hosting (Vercel / Nginx)
- [ ] Final UI polish: animations, transitions, loading states
- [ ] Viết User Guide cho Admin/Manager
- [ ] Chuẩn bị slide demo

### FE2

- [ ] Final UI polish cho Staff Portal
- [ ] Viết User Guide cho Staff
- [ ] Hỗ trợ chuẩn bị demo
- [ ] Fix last-minute bugs

### FE3

- [ ] Build APK/IPA cho testing
- [ ] Final UI polish cho Mobile App
- [ ] Viết User Guide cho Driver
- [ ] Hỗ trợ chuẩn bị demo

**✅ Deliverable tuần 9:** Hệ thống deploy hoàn chỉnh, tài liệu đầy đủ, sẵn sàng demo.

---

## 📊 BẢNG TỔNG HỢP MODULE ↔ NGƯỜI PHỤ TRÁCH

| Module                   | Backend | Frontend Web | Mobile |
| ------------------------ | :-----: | :----------: | :----: |
| Auth & User Management   |   BE1   |     FE1      |  FE3   |
| Tòa nhà / Tầng / Loại xe |   BE2   |     FE1      |   –    |
| Slot đỗ xe               |   BE1   |   FE1+FE2    |   –    |
| Bảng giá                 |   BE1   |   FE1+FE2    |  FE3   |
| Parking Session (vào/ra) | BE1+BE2 |     FE2      |  FE3   |
| Thanh toán               |   BE1   |     FE2      |  FE3   |
| Ngoại lệ                 |   BE2   |   FE1+FE2    |   –    |
| Đặt chỗ trước            |   BE1   |      –       |  FE3   |
| Báo cáo & Thống kê       |   BE2   |     FE1      |   –    |
| Phản hồi                 |   BE2   |     FE1      |  FE3   |
| Quản trị hệ thống        |   BE2   |     FE1      |   –    |
| Realtime (Socket.IO)     |   BE2   |   FE1+FE2    |  FE3   |

---

## 🔗 DEPENDENCIES & MILESTONES

```
Tuần 1: Setup ──────────────────────────────────────────────┐
                                                            │
Tuần 2-3: Auth + CRUD ────────┐                             │
  BE: API Auth, CRUD          │                             │
  FE1: Admin Panel            ├── Milestone 1: Core CRUD   │
  FE2: Staff Login            │                             │
  FE3: Mobile Auth + Xem bãi  │                             │
                              │                             │
Tuần 4-5: Operations ─────────┤                             │
  BE: Session, Payment API    │                             │
  FE2: Xe vào/ra Staff  ◄─────┤── Milestone 2: Operations  │
  FE3: Theo dõi + Thanh toán  │                             │
                              │                             │
Tuần 6-7: Advanced ───────────┤                             │
  BE: Reservation, Reports    │                             │
  FE1: Báo cáo, Ngoại lệ     ├── Milestone 3: Full Feature│
  FE3: Đặt chỗ, Feedback     │                             │
                              │                             │
Tuần 8: Testing ──────────────┤── Milestone 4: Stable      │
                              │                             │
Tuần 9: Deploy ───────────────┘── Milestone 5: Production  │
                                                            │
────────────────────────────────────────────────────────────┘
```

---

## ⚠️ QUY TẮC LÀM VIỆC

| #   | Quy tắc                      | Chi tiết                                               |
| --- | ---------------------------- | ------------------------------------------------------ |
| 1   | Daily standup                | Mỗi ngày 15 phút báo cáo: đã làm, sẽ làm, blocker      |
| 2   | Branch naming                | `feature/FR-xx-mô-tả`, `bugfix/issue-xx`, `hotfix/...` |
| 3   | Pull Request                 | Mỗi PR cần ≥ 1 reviewer approve trước khi merge        |
| 4   | API contract trước           | BE viết Swagger trước → FE mock data → Tích hợp sau    |
| 5   | Sprint review cuối mỗi phase | Demo deliverable, retrospective                        |
| 6   | Git commit convention        | `feat:`, `fix:`, `docs:`, `refactor:`, `test:`         |
| 7   | Shared types                 | Tạo package `shared/types` dùng chung BE + FE + Mobile |
