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
  - `Floor` (facilityId, name, allowedVehicleTypes, status, **distanceToGate** ← _RQ-ready_)
  - `VehicleType` (name, code, slotSize, icon)
  - `ParkingSlot` (code, floorId, facilityId, vehicleType, status, currentSessionId)
  - `PricingPlan` (name, vehicleType, facilityId, feeType, rates, surcharges, status)
  - `ParkingSession` (code, licensePlate, vehicleType, checkInTime, checkOutTime, slotId, staffIn, staffOut, fee, status, paymentStatus, **assignmentMode** ← _RQ-ready_)
  - `Reservation` (userId, vehicleType, facilityId, slotId, startTime, endTime, status)
  - `Payment` (sessionId, amount, method, staffId, status, transactionCode)
  - `Exception` (sessionId, type, description, staffId, status, managerNote)
  - `Feedback` (userId, sessionId, type, description, images, status)
  - `SystemConfig` / `AuditLog`
- [x] Setup ESLint + Prettier cho backend
- [x] Viết seed data cơ bản (bao gồm `distanceToGate` cho mỗi Floor — cần thiết cho WSM scoring tuần 6)

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
- [x] API Assign Facility (FR-18.6): phân công bãi xe (Two-way Reference, Scope Guard)
- [x] API Role & Permission (FR-19): getAll roles, assignRole, updatePermissions

#### BE2

- [x] API ParkingFacility CRUD (FR-1): create, update, deactivate, list
- [x] API VehicleType CRUD (FR-2): create, update, delete (soft), list
- [x] API Floor CRUD + gán loại xe (FR-3): create, assignVehicleTypes, getFloorMap
- [x] Validation middleware cho tất cả API trên

#### FE1

- [x] Trang Login / Quên mật khẩu
- [x] Layout Admin Panel hoàn chỉnh
- [x] Trang Quản lý Tài khoản (FR-18): danh sách, tạo/sửa/khóa, filter
- [x] Trang Phân quyền (FR-19): gán vai trò, xem quyền

#### FE2

- [x] Trang Login cho Staff
- [x] Layout Staff Portal (tối ưu cho tablet)
- [x] Tích hợp Auth flow (login, logout, token refresh)

#### FE3

- [x] Màn hình Login / Đăng ký Driver
- [x] Auth flow mobile (JWT + AsyncStorage)
- [x] Màn hình Home skeleton (tab bar: Trang chủ, Lượt gửi, Đặt chỗ, Tài khoản)

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

- [x] Trang Quản lý Tòa nhà (FR-1): CRUD + trạng thái
- [x] Trang Quản lý Loại xe (FR-2): CRUD
- [x] Trang Phân tầng (FR-3): gán loại xe cho tầng, sơ đồ tầng
- [x] Trang Cấu hình Hệ thống (FR-20): form cấu hình chung

#### FE2

- [x] Trang Quản lý Slot (FR-4): bản đồ slot theo tầng, mã màu trạng thái
- [x] Trang Bảng giá (FR-5): xem danh sách, tạo/sửa bảng giá
- [x] Component SlotStatusBadge, SlotGrid

#### FE3

- [x] Màn hình Xem thông tin bãi xe (FR-12.1): tên, địa chỉ, giờ hoạt động
- [x] Màn hình Xem bảng giá (FR-12.2): hiển thị theo loại xe
- [x] Màn hình Xem slot trống (FR-12.3): số lượng theo loại xe
- [x] Pull-to-refresh, loading states

**✅ Deliverable tuần 2–3:** Auth hoạt động, CRUD quản lý hoàn chỉnh, Admin Panel + Staff Portal cơ bản, Mobile xem được thông tin bãi xe.

---

## 🟡 PHASE 3 – TUẦN 4–5: PARKING OPERATIONS (XE VÀO/RA)

### Tuần 4

#### BE1

- [x] API Check-in xe (FR-8 + FR-9): checkConditions, createSession
  - Validate: loại xe, slot trống, giờ hoạt động, blacklist (BR-5.1)
  - Tạo session + cập nhật slot → Occupied
  - Sinh mã thẻ xe / QR code
- [x] API gợi ý tầng/khu vực (FR-8.3): dựa trên loại xe + slot trống
- [x] API tìm session (FR-10.1): theo mã thẻ, biển số, mã session

#### BE2

- [x] API Check-out xe (FR-10.2 + FR-10.3):
  - Tính phí tự động theo bảng giá (BR-4.3, BR-4.4, BR-4.5)
  - Logic: làm tròn giờ, phí qua đêm, phí quá giờ
  - Thu phí + cập nhật session → Completed, slot → Available
- [x] API lấy danh sách session đang active (FR-9.2): filter, sort
- [x] Socket.IO: emit event khi slot thay đổi trạng thái

#### FE1

- [ ] Trang Quản lý Bảng giá nâng cao: nhiều mức giá, phí qua đêm, phí quá giờ
- [ ] Dashboard Manager: tổng quan bãi xe (tổng slot, đang dùng, trống, bảo trì)
- [ ] Realtime: nhận Socket.IO event cập nhật dashboard

#### FE2

- [x] **Màn hình Xe VÀO bãi** (FR-8 + FR-9):
  - Chọn cổng vào → Chọn loại xe → Nhập biển số
  - Hiển thị kết quả kiểm tra điều kiện
  - Gợi ý tầng/khu vực → Xác nhận tạo session
  - Hiển thị mã thẻ/QR để in
- [x] Component: LicensePlateInput, SessionCard, QRDisplay

#### FE3

- [x] Màn hình Lượt gửi hiện tại (FR-15.1): giờ vào, loại xe, khu vực, phí tạm tính
- [x] Màn hình Lịch sử gửi xe (FR-15.2): danh sách, chi tiết
- [x] Component: SessionDetailCard, FeeEstimate

### Tuần 5

#### BE1

- [x] API Payment (FR-16): create payment, confirm payment
  - Ghi nhận: mã giao dịch, session, số tiền, phương thức, Staff
- [x] Logic thanh toán online: tạo payment intent, webhook callback
- [x] MongoDB Transaction cho flow: tạo payment + update session + update slot

#### BE2

- [x] API Exception CRUD (FR-11):
  - Mất thẻ (FR-11.1): tìm session theo biển số, phụ phí mất thẻ
  - Sai biển số (FR-11.2): tạo exception, cần Manager duyệt
  - Quá hạn (FR-11.3): auto-detect, cảnh báo
  - Sai khu vực (FR-11.4): cập nhật slot thực tế
- [x] API cập nhật trạng thái slot bởi Staff (FR-11.5): giới hạn quyền

#### FE1

- [x] Trang Quản lý Bảng giá: gán bảng giá cho tòa nhà (FR-5.2)
- [ ] Trang Log hệ thống (FR-20.4): filter, phân trang
- [ ] Nâng cao Dashboard: biểu đồ slot realtime

#### FE2

- [x] **Màn hình Xe RA bãi** (FR-10):
  - Quét/nhập mã thẻ → Hiển thị session
  - Hiển thị chi tiết phí → Chọn phương thức thanh toán → Xác nhận
  - In biên lai
- [x] **Màn hình Xử lý Ngoại lệ** (FR-11):
  - Form báo mất thẻ, sai biển số, quá hạn
  - Cập nhật trạng thái slot
- [x] Component: PaymentSummary, ExceptionForm, ReceiptPreview

#### FE3

- [ ] Màn hình Thanh toán tại bãi (FR-13.2): xem phí, QR thanh toán
- [ ] Màn hình Thanh toán online (FR-16.2): chọn phương thức, xác nhận
- [ ] Tích hợp hiển thị phí tạm tính realtime

**✅ Deliverable tuần 4–5:** Flow xe vào/ra hoạt động E2E, tính phí tự động, thu phí, xử lý ngoại lệ cơ bản, Mobile xem/theo dõi lượt gửi.

---

## 🟠 PHASE 4 – TUẦN 6–7: TÍNH NĂNG NÂNG CAO

### Tuần 6

#### BE1

- [x] API Reservation (FR-14): create, cancel, list, autoExpire
  - Logic: kiểm tra slot trống theo khung giờ (BR-6.1)
  - Auto-cancel sau 30 phút (BR-6.4) – sử dụng cron job / agenda
  - Chuyển reservation → session khi Driver đến (BR-6.6)
- [x] API chính sách hủy (BR-6.5): tính phí hủy nếu < 2 giờ
- [ ] 🔬 **[RQ3]** Implement Weighted Scoring Model cho API `suggest-floor` (FR-8.3):
  - Thuật toán gốc: **TOPSIS + CRITIC** [P5] (Amari et al., _Sustainability_ 2023), **COA** [P6] (Shirazi & Farzaneh, _JAIDM_ 2025)
  - Ràng buộc cứng (hard constraints) từ MARL framework [P7] (Zhang et al., _TRC_ 2022): vehicleType match + slot.status == 'Available'
  - Phiên bản áp dụng: **WSM (Weighted Scoring Model)** — đơn giản hóa TOPSIS
  - `Score(slot) = W1×Distance + W2×FloorFillBalance + W3×DurationMatch + W4×FloorPreference`
  - Zone Filtering (từ Contract Net Protocol [P1] + Differentiated Parking [P2])
  - Greedy Matching (từ Hungarian Algorithm [P3] + Centralized Assignment [P4])
  - Trọng số mặc định: W1=0.25, W2=0.30, W3=0.25, W4=0.20 (cấu hình qua SystemConfig)
  - **Service files tạo mới:**
    - `server/services/algorithms/zoneFilter.service.js` ← RQ1: Zone Differentiation [P2]
    - `server/services/algorithms/wsmScoring.service.js` ← RQ3: TOPSIS/CRITIC → WSM [P5]
    - `server/services/algorithms/greedyMatching.service.js` ← RQ2: Hungarian → Greedy [P3]
    - `server/services/algorithms/slotAssignment.service.js` ← Orchestrator
  - **Schema changes:**
    - `Floor.js`: thêm `distanceToGate` (Number) cho WSM scoring
    - `ParkingSession.js`: thêm `assignmentMode` (enum: 'auto'/'manual'), `suggestedSlotId`
    - `SystemConfig.js`: thêm `algorithmWeights` ({W1, W2, W3, W4})
  - **API mới:** `PUT /api/system-config/algorithm-weights` cho Manager điều chỉnh W1–W4
  - **Unit test:** test WSM scoring logic, test zone filtering, test greedy matching

#### BE2

- [x] API Báo cáo (FR-6):
  - Lượt xe vào/ra (FR-6.1): aggregate theo ngày/tuần/tháng, filter
  - Doanh thu (FR-6.2): aggregate payments, group by method/vehicleType
  - Tỷ lệ lấp đầy (FR-6.3): calculate occupied/total per floor
  - Khung giờ cao điểm (FR-6.4): aggregate by hour
- [x] API Export báo cáo: xuất Excel (xlsx) / PDF
- [x] 🔬 **[RQ1]** API occupancy heatmap theo tầng + loại xe (FR-6.3 mở rộng)
  - Thuật toán gốc: **Macroscopic Fundamental Diagram (MFD)** [P2] — tính Optimal Occupancy
- [ ] 🔬 **[RQ1]** Tạo seed data 2 cấu hình: (A) phân tầng chuyên biệt, (B) tầng hỗn hợp
  - Dựa trên mô hình Zone Differentiation [P2] và CNP Agent-based Zoning [P1]

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

- [x] **Màn hình Đặt chỗ trước** (FR-14.1):
  - Chọn loại xe → Chọn thời gian → Xem khu vực trống → Xác nhận
- [x] Màn hình Quản lý đặt chỗ (FR-14.2): xem, hủy reservation
- [x] Push notification setup (Expo Notifications / Firebase FCM)

### Tuần 7

#### BE1

- [x] API Feedback (FR-17): create, list (by user / all), updateStatus
- [x] Push notification service: đặt chỗ thành công, nhắc thanh toán, hết hạn giữ chỗ
- [x] API Ngoại lệ nâng cao (FR-7): list exceptions for Manager, approve/reject
- [x] Optimize MongoDB queries: indexes cho licensePlate, sessionCode, slotCode
- [ ] 🔬 **[RQ4]** Implement Load Balancing cho giờ cao điểm:
  - Thuật toán gốc: **NSGA-II** (multi-objective demand allocation) [P8] (Zhang et al., _Systems_ 2024), **DQN** [P9] (Chen et al., 2024)
  - Phiên bản áp dụng: **Threshold-based Load Balancing** — phát hiện tầng sắp đầy (occupancy ≥ 85%) → chuyển hướng xe đến tầng occupancy thấp nhất
  - Tích hợp **Reservation-Aware Capacity** [P10] (Wang, Li & Xie, _TRC_ 2022): `effective_occupancy = (occupied + reserved) / total`
  - Conflict Resolution: khi 2 xe hướng cùng slot → ưu tiên xe gần hơn
- [ ] 🔬 **[RQ4]** Peak Hour Detection: xác định giờ cao điểm tự động từ dữ liệu lịch sử
  - Hướng nâng cấp tương lai: **MARL (Multi-Agent Deep RL)** [P7] (Zhang et al., _TRC_ 2022) và **DRL (Deep Q-Network)** [P9]
  - **Service files tạo mới:**
    - `server/services/algorithms/loadBalancer.service.js` ← RQ4: Threshold LB [P8]
    - `server/services/algorithms/peakDetection.service.js` ← RQ4: Peak detection [P8]
  - **Schema changes:**
    - `SystemConfig.js`: thêm `loadBalancingThreshold` (default: 0.85), `peakHourMultiplier` (default: 1.5)
  - **API mới:** `GET /api/reports/load-imbalance`, `GET /api/reports/peak-hours`
  - **Tích hợp:** Kết nối loadBalancer + peakDetection vào slotAssignment orchestrator
- [ ] 🤖 **[AI]** Implement Peak Hour Prediction:
  - Thư viện: `ml-regression` / `ml-random-forest` (JavaScript native, không cần Python)
  - Input: hour, weekday, month, isHoliday, recentCheckInRate
  - Output: isPeakHour (boolean) + confidence (0-1)
  - Training: cron job chạy 1 lần/tuần trên lịch sử check-in (≥ 30 ngày)
  - Fallback: nếu model chưa train hoặc accuracy < 70% → rule-based `rate > avg × 1.5`
  - **Service files:**
    - `server/services/ai/peakHourPredictor.service.js`
    - `server/services/ai/modelTrainer.service.js`
  - **Schema:** `SystemConfig.aiPredictionEnabled` (Boolean), `AIModelMeta.peakHourModel`
  - **API:** `POST /api/ai/train-models`, `GET /api/ai/model-status`, `GET /api/ai/predict-peak`
- [ ] 🤖 **[AI]** Implement Parking Duration Prediction:
  - Input: vehicleType, checkInHour, weekday, month
  - Output: estimatedDuration (phút) → feed vào WSM scoring W3
  - Training: cron job trên lịch sử sessions hoàn thành (≥ 200 records)
  - Fallback: `AVG(duration)` theo loại xe
  - **Service file:** `server/services/ai/durationPredictor.service.js`
  - **API:** `GET /api/ai/predict-duration`
- [ ] 🤖 **[RQ5]** Implement AI Chatbot Query cho Manager/Admin (FR-6.5):
  - Tham khảo: **NLI survey** [P11] (Quamar et al., _FnTDB_ 2022), **Chatbot FM** [P12] (Chen & Tsai, _Sensors_ 2021)
  - Đánh giá acceptance: **TAM** [P13] (Alhammadi, _AJSTS_ 2023), **SLR** [P14] (Delgado et al., _JISEM_ 2025)
  - Phương pháp: **Intent-based NLQ** — keyword matching + entity extraction + template MongoDB query
  - Kiến trúc 4-module [P12]: Intent Analysis, Parking Dataset, Decision Mechanism, Response Generation
  - Intents hỗ trợ: revenue_report, traffic_report, occupancy_report, peak_hours, facility_info, exception_summary
  - Entity extraction: timeRange, facilityName, floorName, vehicleType
  - Fallback: intent không nhận diện → trả danh sách câu hỏi gợi ý
  - **Service files tạo mới:**
    - `server/services/ai/chatbotQuery.service.js` ← RQ5: Intent-based NLQ orchestrator
    - `server/services/ai/intentClassifier.service.js` ← RQ5: Intent classification [P12]
    - `server/services/ai/entityExtractor.service.js` ← RQ5: Entity extraction [P11]
  - **Schema:** `SystemConfig.chatbotEnabled` (Boolean), `ChatHistory` collection
  - **API:** `POST /api/ai/chat-query`, `GET /api/ai/chat-history`
  - **Nâng cấp tương lai:** LLM-based Text-to-SQL [P11], multi-turn conversation context [P11]
- [ ] 🤖 **[RQ6]** Implement AI Pricing Suggestion cho Manager (FR-5.5):
  - Tham khảo: **Prediction-based Pricing** [P15] (Hong et al., _CIKM_ 2022), **DRL-DP** [P16] (Poh et al., _Algorithms_ 2023)
  - Framework: **ML Pricing 3 tầng** [P17] (Saharan et al., _FGCS_ 2020), **Review** [P18] (Bayih & Tilahun, _ORD_ 2024)
  - Phương pháp: **Demand-based Pricing Suggestion** — phân tích tần suất gửi xe, occupancy rate, peak demand → gợi ý điều chỉnh giá
  - Pipeline: Data Collection → Demand Analysis → Price Suggestion Engine → Cross-Facility Comparison
  - Demand levels: high_demand (≥85%), normal_demand (50-85%), low_demand (<50%)
  - Max adjustment: +20% (high demand), -15% (low demand)
  - Confidence scoring: dựa trên sample_size, data_recency, demand_stability
  - Ghi chú: Manager chỉ xem suggestion, tự quyết định (không auto-apply)
  - **Service file tạo mới:**
    - `server/services/ai/pricingSuggestion.service.js` ← RQ6: Demand-based Pricing [P15][P17]
  - **Schema:** `SystemConfig.pricingSuggestionEnabled` (Boolean), `PricingSuggestion` collection
  - **API:** `GET /api/ai/pricing-suggestion/:facilityId`, `GET /api/ai/pricing-suggestion/compare`
  - **Nâng cấp tương lai:** Full DRL-DP agent [P16], Neural ODE prediction [P15]

#### BE2

- [ ] Socket.IO events hoàn chỉnh:
  - `slot:statusChanged` – cập nhật bản đồ slot
  - `session:created` / `session:completed` – dashboard
  - `reservation:expired` – thông báo
- [ ] API Backup config (FR-20.5): trigger backup, list backups
- [ ] Integration test cho các flow chính (check-in → check-out → payment)
- [ ] 🔬 **[RQ4]** API Load Imbalance Index: `(max - min) / avg` occupancy giữa các tầng
- [ ] 🔬 **[RQ3]** API cho phép Manager điều chỉnh trọng số thuật toán (W1–W4) qua SystemConfig

#### FE1

- [ ] Trang Quản lý Ngoại lệ (FR-7): danh sách, filter, duyệt/từ chối
- [ ] Trang Xem phản hồi: danh sách feedback, trạng thái, trả lời
- [ ] Hoàn thiện Dashboard: widget ngoại lệ, feedback mới

#### FE2

- [ ] Realtime cập nhật bản đồ slot (Socket.IO)
- [ ] Cải thiện flow xe vào/ra: animation, sound feedback
- [ ] Responsive cho tablet: optimize layout

#### FE3

- [x] xMàn hình Gửi phản hồi (FR-17.1): chọn loại, mô tả, đính kèm ảnh
- [x] Màn hình Theo dõi phản hồi (FR-17.2): trạng thái xử lý
- [x] Màn hình Tài khoản: thông tin cá nhân, đổi mật khẩu, lịch sử
- [x] Nhận push notification

**✅ Deliverable tuần 6–7:** Đặt chỗ trước, báo cáo thống kê, ngoại lệ nâng cao, phản hồi, realtime, push notification. **+ WSM scoring [P5 Amari 2023, P6 Shirazi 2025], Threshold Load Balancing [P8 Zhang 2024, P9 Chen 2024, P10 Wang 2022], AI Chatbot Query [P11 Quamar 2022, P12 Chen & Tsai 2021], và AI Pricing Suggestion [P15 Hong 2022, P17 Saharan 2020].**

---

## 🔴 PHASE 5 – TUẦN 8: TÍCH HỢP & TESTING

### BE1

- [ ] Fix bugs từ integration testing
- [ ] Performance optimization: DB indexes, query optimization
- [ ] API rate limiting, input sanitization (chống NoSQL Injection)
- [ ] Stress test: 100 concurrent users
- [ ] Hoàn thiện Swagger documentation
- [ ] 🔬 **[RQ1–RQ4]** Chạy simulation A/B testing:
  - Scenario 1: 500 sessions phân tầng chuyên biệt vs. hỗn hợp (RQ1) — đo MFD [P2]
  - Scenario 2: 500 sessions auto-assign (Greedy [P3]) vs. manual (RQ2) — đo search time
  - Scenario 3: 500 sessions single-criteria vs. WSM multi-criteria [P5] (RQ3)
  - Scenario 4: 200 sessions giờ cao điểm với/không Threshold Load Balancing [P8] (RQ4)
  - **Scenario 5: 🤖 AI vs Rule-based** — so sánh peak prediction accuracy (AI model vs threshold cứng)
  - **Scenario 6: 🤖 Duration Prediction** — so sánh WSM với AI duration vs manual/avg duration
- [ ] 🔬 Thu thập và phân tích metrics theo bảng chỉ số SRS Phần 5
- [ ] 🤖 **[AI]** Đánh giá AI model performance: Accuracy/Precision/Recall (peak), MAE/RMSE (duration)

### BE2

- [ ] Fix bugs từ integration testing
- [ ] Unit test coverage ≥ 70%
- [ ] Test MongoDB transactions (replica set)
- [ ] Test Socket.IO events dưới tải
- [ ] Security audit: JWT expiry, RBAC bypass, data leaks
- [ ] 🔬 Script tự động tạo simulation data cho giờ cao điểm (50–100 sessions/2 giờ)
- [ ] 🔬 Export báo cáo RQ: bảng metrics + biểu đồ so sánh (Excel/PDF)
- [ ] 🔬 Đánh giá giả thuyết H1–H4: so sánh kết quả với mục tiêu đề ra

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

**✅ Deliverable tuần 8:** Hệ thống ổn định, test coverage đạt yêu cầu, không còn bug blocking. **+ Kết quả simulation RQ1–RQ4 với metrics.**

---

## 🟣 PHASE 6 – TUẦN 9: HOÀN THIỆN & DEPLOY

### BE1

- [ ] Deploy backend lên server (VPS / cloud)
- [ ] Setup MongoDB replica set (production)
- [ ] Setup CI/CD pipeline
- [ ] Cấu hình environment: dev, staging, production
- [ ] Viết tài liệu API hoàn chỉnh
- [ ] 🔬 Tổng hợp Research Report:
  - Kết quả từng RQ: dữ liệu, phân tích, so sánh với giả thuyết
  - Mapping thuật toán gốc → phiên bản đơn giản hóa:
    - TOPSIS/CRITIC [P5 Amari 2023] + COA [P6 Shirazi 2025] → WSM
    - Hungarian [P3] → Greedy Matching
    - MARL hard constraints [P7 Zhang 2022] → Zone Filtering rules
    - NSGA-II [P8] → Threshold Load Balancing
    - Chance-constrained reservation [P10 Wang 2022] → Reservation-Aware Occupancy
  - **🤖 AI Accuracy Report:**
    - Peak Hour Prediction: Accuracy, Precision, Recall, Confusion Matrix
    - Duration Prediction: MAE, RMSE, R² score
    - So sánh AI-enhanced vs Rule-based: cải thiện bao nhiêu %
  - Đề xuất cải tiến: nâng cấp lên TOPSIS đầy đủ [P5], COA [P6], MARL [P7], DQN [P9]
  - Hạn chế nghiên cứu và đối chiếu với papers [P1]–[P10]

### BE2

- [ ] Setup monitoring & health check
- [ ] Setup automated backup (daily)
- [ ] Seed production data (admin account, default config)
- [ ] Viết tài liệu hướng dẫn triển khai
- [ ] 🔬 Chuẩn bị slide trình bày kết quả nghiên cứu RQ trong buổi demo

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

**✅ Deliverable tuần 9:** Hệ thống deploy hoàn chỉnh, tài liệu đầy đủ, sẵn sàng demo. **+ Research Report RQ1–RQ4.**

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

## 📊 BẢNG TỔNG HỢP MODULE ↔ NGƯỜI PHỤ TRÁCH

| Module                   |   Backend   | Frontend Web | Mobile |
| ------------------------ | :---------: | :----------: | :----: |
| Auth & User Management   |     BE1     |     FE1      |  FE3   |
| Tòa nhà / Tầng / Loại xe |     BE2     |     FE1      |   –    |
| Slot đỗ xe               |     BE1     |   FE1+FE2    |   –    |
| Bảng giá                 |     BE1     |   FE1+FE2    |  FE3   |
| Parking Session (vào/ra) |   BE1+BE2   |     FE2      |  FE3   |
| Thanh toán               |     BE1     |     FE2      |  FE3   |
| Ngoại lệ                 |     BE2     |   FE1+FE2    |   –    |
| Đặt chỗ trước            |     BE1     |      –       |  FE3   |
| Báo cáo & Thống kê       |     BE2     |     FE1      |   –    |
| Phản hồi                 |     BE2     |     FE1      |  FE3   |
| Quản trị hệ thống        |     BE2     |     FE1      |   –    |
| Realtime (Socket.IO)     |     BE2     |   FE1+FE2    |  FE3   |
| **Research Questions**   | **BE1+BE2** |      –       |   –    |

---

## 🔬 KIẾN TRÚC THUẬT TOÁN PHÂN BỔ SLOT

### Cấu trúc service files

```
server/services/algorithms/
├── zoneFilter.service.js       ← RQ1: Zone Differentiation [P2]
├── wsmScoring.service.js       ← RQ3: TOPSIS/CRITIC → WSM [P5]
├── greedyMatching.service.js   ← RQ2: Hungarian → Greedy [P3]
├── loadBalancer.service.js     ← RQ4: NSGA-II → Threshold LB [P8]
├── peakDetection.service.js    ← RQ4: Peak detection [P8]
├── slotAssignment.service.js   ← Orchestrator (tích hợp tất cả)
│
server/services/ai/
├── peakHourPredictor.service.js    ← 🤖 AI: Peak Hour Prediction
├── durationPredictor.service.js    ← 🤖 AI: Duration Prediction
├── modelTrainer.service.js         ← 🤖 AI: Training pipeline (cron weekly)
├── chatbotQuery.service.js         ← 🤖 RQ5: Intent-based NLQ [P11][P12]
├── intentClassifier.service.js     ← 🤖 RQ5: Intent classification [P12]
├── entityExtractor.service.js      ← 🤖 RQ5: Entity extraction [P11]
├── pricingSuggestion.service.js    ← 🤖 RQ6: Demand-based Pricing [P15][P17]
└── models/                         ← Trained model files (.json)
```

### Pipeline xử lý khi xe vào bãi (FR-8.3)

```
Xe vào → Zone Filter [P2] → 🤖 AI Peak Prediction
                                    │
                         ┌──── isPeak ────┐
                         ▼                ▼
                   Load Balancer  🤖 AI Duration
                    [P8]+[P10]     Prediction
                         │           │
                         │      WSM Scoring [P5]
                         │           │
                         └──── Greedy ────┘
                              Match [P3]
                                │
                         Slot Assigned
                     (auto | manual mode)

Fallback: AI model chưa train → rule-based (rate > avg × 1.5) + AVG(duration)
```

### Schema changes tổng hợp

| Collection     | Field                               | Type        | Default | RQ             |
| -------------- | ----------------------------------- | ----------- | ------- | -------------- |
| Floor          | distanceToGate                      | Number      | 0       | RQ1, RQ3       |
| ParkingSession | assignmentMode                      | String enum | 'auto'  | RQ2            |
| ParkingSession | suggestedSlotId                     | ObjectId    | null    | RQ2, RQ3       |
| SystemConfig   | algorithmWeights.W1_distance        | Number      | 0.25    | RQ3            |
| SystemConfig   | algorithmWeights.W2_floorBalance    | Number      | 0.30    | RQ3            |
| SystemConfig   | algorithmWeights.W3_durationMatch   | Number      | 0.25    | RQ3            |
| SystemConfig   | algorithmWeights.W4_floorPreference | Number      | 0.20    | RQ3            |
| SystemConfig   | loadBalancingThreshold              | Number      | 0.85    | RQ4            |
| SystemConfig   | peakHourMultiplier                  | Number      | 1.5     | RQ4 (fallback) |
| SystemConfig   | aiPredictionEnabled                 | Boolean     | false   | AI             |
| AIModelMeta    | peakHourModel                       | Object      | null    | AI             |
| AIModelMeta    | durationModel                       | Object      | null    | AI             |

### API endpoints cho thuật toán

| Method | Endpoint                                       | Mô tả                                   | RQ       |
| ------ | ---------------------------------------------- | --------------------------------------- | -------- |
| GET    | `/api/parking/suggest-floor?mode=auto\|manual` | Gợi ý tầng/slot tối ưu                  | RQ2, RQ3 |
| GET    | `/api/reports/occupancy-heatmap`               | Heatmap occupancy theo tầng             | RQ1      |
| GET    | `/api/reports/peak-hours`                      | Phân tích giờ cao điểm                  | RQ4      |
| GET    | `/api/reports/load-imbalance`                  | Load Imbalance Index                    | RQ4      |
| PUT    | `/api/system-config/algorithm-weights`         | Điều chỉnh W1–W4                        | RQ3      |
| POST   | `/api/ai/train-models`                         | Trigger re-train AI models              | AI       |
| GET    | `/api/ai/model-status`                         | Trạng thái model: accuracy, lastTrained | AI       |
| GET    | `/api/ai/predict-peak`                         | Dự đoán giờ cao điểm (test)             | AI       |
| GET    | `/api/ai/predict-duration`                     | Dự đoán thời gian gửi (test)            | AI       |
| POST   | `/api/ai/chat-query`                           | Chatbot truy vấn báo cáo bằng NL        | RQ5      |
| GET    | `/api/ai/chat-history`                         | Lịch sử hội thoại chatbot               | RQ5      |
| GET    | `/api/ai/pricing-suggestion/:facilityId`       | Gợi ý điều chỉnh bảng giá               | RQ6      |
| GET    | `/api/ai/pricing-suggestion/compare`           | So sánh giá giữa các tòa nhà            | RQ6      |

### Thuật toán đã chọn — tóm tắt

| RQ  | Paper chính                                | Ranking                     | Phiên bản áp dụng               | Nâng cấp tương lai      |
| --- | ------------------------------------------ | --------------------------- | ------------------------------- | ----------------------- |
| RQ1 | [P2] Jakob & Menendez 2021                 | Q2, IF=3.3                  | Rule-based Zone Filtering       | Adaptive ML Zoning      |
| RQ2 | [P3] arXiv 2025 + [P4] Wang 2021           | Preprint + Q1/IF=7.9        | Greedy Matching                 | Full Hungarian O(n³)    |
| RQ3 | [P5] Amari 2023 + [P7] Zhang 2022          | Q2 + Q1/IF=7.9              | WSM 4-criteria                  | Full TOPSIS + COA [P6]  |
| RQ4 | [P8] Zhang 2024 + [P10] Wang 2022          | Q1-JCR + Q1/IF=7.9          | Threshold Load Balancing        | DQN [P9] / MARL [P7]    |
| RQ5 | [P12] Chen & Tsai 2021 + [P11] Quamar 2022 | Q1/IF=3.4 + Top-tier survey | Intent-based NLQ                | LLM Text-to-SQL [P11]   |
| RQ6 | [P15] Hong 2022 + [P17] Saharan 2020       | CIKM-A + Q1/IF=7.5          | Demand-based Pricing Suggestion | Full DRL-DP agent [P16] |

---

## ⚠️ QUY TẮC LÀM VIỆC

| #   | Quy tắc                      | Chi tiết                                                           |
| --- | ---------------------------- | ------------------------------------------------------------------ |
| 1   | Daily standup                | Mỗi ngày 15 phút báo cáo: đã làm, sẽ làm, blocker                  |
| 2   | Branch naming                | `feature/FR-xx-mô-tả`, `bugfix/issue-xx`, `hotfix/...`             |
| 3   | Pull Request                 | Mỗi PR cần ≥ 1 reviewer approve trước khi merge                    |
| 4   | API contract trước           | BE viết Swagger trước → FE mock data → Tích hợp sau                |
| 5   | Sprint review cuối mỗi phase | Demo deliverable, retrospective                                    |
| 6   | Git commit convention        | `feat:`, `fix:`, `docs:`, `refactor:`, `test:`                     |
| 7   | Shared types                 | Tạo package `shared/types` dùng chung BE + FE + Mobile             |
| 8   | Research tracking            | Mỗi session phải ghi nhận `assignmentMode` để phục vụ phân tích RQ |
