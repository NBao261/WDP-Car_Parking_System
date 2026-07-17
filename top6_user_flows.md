# 6 Luồng User Flow Quan Trọng Nhất — WDP Smart Parking

---

## Luồng 1: Check-in Walk-in (Gửi xe vãng lai)

> **Actor chính:** `Staff` · **Hệ thống liên quan:** Web Portal, ALPR Service, Socket.IO

```
[Staff] Chọn bãi xe đang được phân công (Facility)
  │
  ▼
[Staff] Chọn loại xe (VehicleType: xe máy / ô tô / xe đạp điện…) (Chỉ chọn loại xe nếu nhận diện sai, xe đạp bắt buộc chọn)
  │
  ▼
[Staff]
  ├── (Bắt buộc) Chụp ảnh xe → Gọi ALPR Service nhận diện tự động biển số và loại xe -> Nếu sai staff nhập tay lại biển số
  └── Xe không biển số (xe đạp…) → Hệ thống tự sinh mã NOPLATE-xxx
  │
  ▼
[Hệ thống] Kiểm tra điều kiện vào bãi:
  ├── Bãi xe đang hoạt động (status = active)?
  ├── Đang trong giờ hoạt động (openTime – closeTime)?
  ├── Loại xe có được phục vụ tại bãi này?
  ├── Còn slot trống cho loại xe này?
  └── Xe có đang gửi chưa ra (session ACTIVE/EXCEPTION)?
  │
  ├── [Không đạt] → Hiển thị lý do từ chối → Dừng
  │
  ▼ [Đạt tất cả]
[Hệ thống] Gợi ý danh sách tầng có slot trống (sắp xếp theo số slot giảm dần)
  │
  ▼
[Hệ thống] Chọn tầng + slot (auto-assign slot đầu tiên)
  │
  ▼
[Hệ thống] Tìm bảng giá active (PricingPlan) cho bãi xe + loại xe
  │
  ▼
[Hệ thống] Sinh mã lượt gửi (Session Code) + mã thẻ xe (Card Code)
  │
  ▼
[Hệ thống] Tạo ParkingSession (status: ACTIVE, ghi checkInTime)
  │
  ▼
[Hệ thống] Cập nhật ParkingSlot → status: OCCUPIED
  │
  ▼
[Hệ thống] Emit Socket.IO "slot:statusChanged" → cập nhật realtime
  │
  ▼
[Staff] In thẻ xe / Đưa thẻ cho khách → Mở barrier → Xe vào bãi ✅
```

---

## Luồng 2: Check-out + Tính phí + Thanh toán tiền mặt

> **Actor chính:** `Staff` · **Hệ thống liên quan:** Web Portal, Payment, Socket.IO

```
[Staff] Tìm lượt gửi xe bằng 1 trong 3 cách:
  ├── Quét mã thẻ xe (cardCode)
  ├── Nhập biển số xe (licensePlate)
  └── Nhập mã session (code)
  └── Chụp ảnh xe so sánh biển số xe lúc ra và lúc vào
  │
  ▼
[Hệ thống] Tìm ParkingSession (status: ACTIVE hoặc EXCEPTION)
  ├── [Không tìm thấy] → Báo lỗi → Dừng
  └── [Status = EXCEPTION] → Báo "Cần xử lý ngoại lệ trước" → Dừng
  │
  ▼ [Tìm thấy, ACTIVE]
[Hệ thống] Tính phí tự động theo PricingPlan:
  │
  ├── Kiểm tra Grace Period (miễn phí nếu gửi ≤ N phút)
  │
  ├── Tính baseFee theo feeMethod:
  │   ├── flat_rate     → Đồng giá 1 lượt
  │   ├── duration_based → Giờ đầu X đ + mỗi giờ tiếp Y đ
  │   └── time_window    → Theo khung giờ (VD: 6h-12h: 5k/h, 12h-22h: 10k/h)
  │
  ├── + overnightFee (nếu gửi qua đêm — tính theo số đêm)
  ├── + overtimeFee (nếu gửi ngoài giờ hoạt động bãi — tính theo giờ)
  ├── + exceptionSurcharge (phụ phí ngoại lệ đã resolved)
  └── + lostCardFee (phí mất thẻ, nếu có)
  │
  ▼
[Staff] Xem chi tiết phí → Xác nhận thu tiền mặt từ khách
  │
  ▼
[Hệ thống] BEGIN TRANSACTION:
  ├── Tạo Payment (method: CASH, status: COMPLETED)
  ├── Cập nhật Session → status: COMPLETED, ghi checkOutTime + totalFee
  └── Cập nhật Slot → status: AVAILABLE
  │
  ▼
[Hệ thống] COMMIT TRANSACTION
  │
  ▼
[Hệ thống] Emit Socket.IO "slot:statusChanged"
  │
  ▼
[Hệ thống] Background: Upload ảnh check-in/check-out lên Cloudinary
  │
  ▼
[Staff] Mở barrier → Xe ra bãi ✅
```

---

## Luồng 3: Đặt chỗ trước + Check-in với Reservation

> **Actor chính:** `Driver` (đặt chỗ) → `Staff` (check-in) · **Hệ thống liên quan:** Mobile App, Web Portal

### Phần A — Driver đặt chỗ (Mobile App)

```
[Driver] Mở App → Xem danh sách bãi xe (Public API, không cần đăng nhập)
  │
  ▼
[Driver] Chọn bãi xe → Xem bảng giá + số slot trống theo loại xe
  │
  ▼
[Driver] Chọn loại xe → Chọn loại xe của mình (đã có sẵn biển số) → Chọn thời gian bắt đầu gửi
  │
  ▼
[Hệ thống] Validate:
  ├── Bãi xe active + trong giờ hoạt động?
  ├── Có bảng giá active cho loại xe?
  ├── Đặt trước ≥ 30 phút so với startTime? (BR-6.2)
  ├── Driver đã có 2 đặt chỗ active? (BR-6.3 — tối đa 2)
  ├── Biển số đã có đặt chỗ chưa dùng? (chống trùng)
  └── Còn slot trống cho loại xe? (BR-6.1)
  │
  ├── [Không đạt] → Hiển thị lý do → Dừng
  │
  ▼ [Đạt tất cả]
[Hệ thống] Sinh mã đặt chỗ (RSV-YYYYMMDD-XXXX)
  │
  ▼
[Hệ thống] Tạo Reservation (status: CONFIRMED) + Lock slot → RESERVED
  │
  ▼
[Driver] Nhận mã đặt chỗ → Lưu lại để dùng khi đến bãi ✅
```

### Phần B — Staff check-in xe có Reservation (Web Portal)

```
[Staff] Nhập mã đặt chỗ (reservationCode) từ Driver
  │  (Hoặc hệ thống auto-match biển số với Reservation đang CONFIRMED)
  │
  ▼
[Hệ thống] Tìm Reservation (status: CONFIRMED)
  ├── [Không tìm thấy] → Báo lỗi → Dừng
  │
  ▼ [Tìm thấy]
[Hệ thống] Validate thời gian check-in:
  ├── Sớm hơn 15 phút trước startTime? → Báo "Chưa đến giờ, chờ X phút"
  └── Muộn hơn 15 phút sau startTime?  → Báo "Đã hết hạn"
  │
  ▼ [Trong khoảng cho phép]
[Hệ thống] Chụp ảnh xe vào bằng ALPR và Validate:
  ├── Biển số xe thực tế khớp biển số đặt chỗ?
  ├── Loại xe khớp?
  └── Có ảnh check-in? (bắt buộc với Reservation)
  │
  ├── [Không khớp] → Từ chối → Dừng
  │
  ▼ [Khớp tất cả]
[Hệ thống] Dùng slot đã Reserved → Tạo ParkingSession (gắn reservationId, driverId)
  │
  ▼
[Hệ thống] Cập nhật Reservation → status: USED
  │
  ▼
[Hệ thống] Cập nhật Slot → OCCUPIED → Emit Socket.IO
  │
  ▼
[Staff] Xe vào bãi (không cần phát thẻ vật lý — dùng mã đặt chỗ làm thẻ ảo) ✅
```

### Phần C — Tự động hết hạn (Cron Job — mỗi 5 phút)

```
[Hệ thống] Tìm Reservation CONFIRMED có startTime quá hạn > 30 phút
  │
  ▼
[Hệ thống] Cập nhật Reservation → status: EXPIRED
  │
  ▼
[Hệ thống] Trả slot → status: AVAILABLE ✅
```

---

## Luồng 4: Nhận diện Biển số Tự động (ALPR)

> **Actor chính:** `Staff` (trigger) · `AI System` (xử lý) · **Hệ thống:** ALPR Service (Python/FastAPI), YOLOv8, PaddleOCR

```
[Staff] Chụp ảnh xe tại cổng vào/ra → Gửi ảnh lên ALPR Service
  │
  ▼
[ALPR] Nhận ảnh → Decode image
  │
  ▼
[ALPR] ── Stage 1: YOLO Plate Detection ──
  │  Dùng YOLOv8 (model đã train cho biển số)
  │  → Detect vùng biển số trong ảnh (conf_threshold = 0.35)
  │  → Crop + proportional padding (6% ngang, 10% dọc)
  │
  ├── [Không detect được biển số] → Chuyển sang Stage 2 (Fallback)
  │
  ▼ [Detect thành công]
[ALPR] ── Multi-pass OCR (PaddleOCR) với Early-Exit ──
  │  Thử lần lượt 5 phương pháp tiền xử lý:
  │    Pass 1: Ảnh gốc (original)
  │    Pass 2: CLAHE + Sharpen (bình thường)
  │    Pass 3: Morphological ops (nhòe nhẹ)
  │    Pass 4: LAB color + adaptive threshold (chói sáng)
  │    Pass 5: Gamma correction 2.0 (thiếu sáng)
  │  → Mỗi pass: OCR → assemble text theo hàng → fix VN plate
  │  → Early-exit nếu confidence ≥ 80%
  │
  ▼
[ALPR] ── VN Plate Normalization ──
  │  Fix ký tự hay nhầm:  O→0, I→1, B→8, S→5, Z→2, G→6
  │  Chuẩn hóa format:    30K-555.55 (xe máy) / 30-A12345 (ô tô)
  │  Validate format VN:  regex check
  │
  ▼
[ALPR] ── Stage 2 (nếu Stage 1 fail): Full-image OCR ──
  │  OCR toàn bộ ảnh gốc (không crop)
  │
  ▼
[ALPR] Trả kết quả:
  │  { text: "30K-555.55", confidence: 0.87, valid: true, source: "yolo+ocr" }
  │
  ▼
[Staff] Xem kết quả nhận diện → Xác nhận hoặc sửa biển số
  │
  ▼
[Staff] Tiếp tục luồng Check-in / Check-out ✅
```

---

## Luồng 5: Xử lý Ngoại lệ

> **Actor chính:** `Staff` (tạo + giải quyết) · `Manager` (review) · **Hệ thống:** Cron Job (tự phát hiện)

### Phần A — Tạo Ngoại lệ (Staff)

```
[Staff] Phát hiện vấn đề trong quá trình vận hành
  │
  ▼
[Staff] Chọn ParkingSession liên quan → Tạo Exception:
  │  Chọn loại:
  │    ├── LOST_CARD   → Khách mất thẻ xe
  │    ├── WRONG_PLATE → Biển số không khớp (vào ≠ ra)
  │    ├── WRONG_ZONE  → Xe đậu sai khu vực / slot
  │    ├── OVERTIME    → Xe gửi quá 24h
  │    └── UNPAID      → Chưa thanh toán
  │  Nhập mô tả + phụ phí (surcharge) nếu cần
  │
  ▼
[Hệ thống] Tạo Exception (status: NEW)
  │
  ▼
[Hệ thống] Nếu loại = LOST_CARD / WRONG_PLATE / WRONG_ZONE:
  │  → Khóa Session → status: EXCEPTION (chặn checkout cho đến khi resolved)
  │
  ▼
[Staff / Manager] Nhận thông báo có ngoại lệ mới ✅
```

### Phần B — Giải quyết Ngoại lệ (Staff)

```
[Staff] Xem danh sách Exception (status: NEW) → Chọn exception cần xử lý
  │
  ▼
[Staff] Xử lý theo từng loại:
  │
  ├── WRONG_PLATE:
  │   [Staff] Nhập biển số đúng
  │   → [Hệ thống] Cập nhật session.licensePlate
  │   → [Hệ thống] Mở khóa session → ACTIVE
  │
  ├── WRONG_ZONE:
  │   [Staff] Chọn slot mới (đúng vị trí thực tế)
  │   → [Hệ thống] Validate: cùng facility + cùng loại xe + slot trống/locked
  │   → [Hệ thống] Cập nhật session → slot mới, floor mới
  │   → [Hệ thống] Slot mới → OCCUPIED
  │   → [Hệ thống] Slot cũ:
  │       ├── [Slot mới đang Locked] → Slot cũ → AVAILABLE (xe đậu nhầm được hợp lệ hóa)
  │       └── [Slot mới đang Available] → Slot cũ → LOCKED (có xe lạ chiếm, chờ xác minh)
  │   → [Hệ thống] Mở khóa session → ACTIVE
  │
  └── LOST_CARD:
      [Staff] Xác nhận danh tính khách + ghi nhận
      → [Hệ thống] Mở khóa session → ACTIVE
  │
  ▼
[Hệ thống] Cập nhật Exception → status: RESOLVED
  │
  ▼
[Staff] Session đã mở khóa → Có thể tiếp tục checkout bình thường ✅
```

### Phần C — Manager Review

```
[Manager] Xem danh sách Exception (đã resolved)
  │
  ▼
[Manager] Thêm ghi chú đánh giá (managerNote)
  │  (Không thay đổi status hay session — chỉ ghi nhận review)
  │
  ▼
[Hệ thống] Lưu managerNote ✅
```

### Phần D — Tự động phát hiện xe quá hạn (Cron Job)

```
[Hệ thống] Cron job chạy định kỳ
  │
  ▼
[Hệ thống] Tìm ParkingSession ACTIVE có checkInTime > 24h trước
  │
  ├── [Đã có Exception OVERTIME chưa xử lý] → Bỏ qua
  │
  ▼ [Chưa có]
[Hệ thống] Tự động tạo Exception (type: OVERTIME, status: NEW) ✅
```

---

## Luồng 6: AI Chatbot — Phân tích & Báo cáo

> **Actor chính:** `Manager` · **Hệ thống:** Web Portal, Google Gemini AI (Function Calling), MongoDB

```
[Manager] Mở giao diện Chatbot trên Web Dashboard
  │
  ▼
[Manager] Nhập câu hỏi bằng ngôn ngữ tự nhiên
  │  VD: "Doanh thu hôm nay bao nhiêu?"
  │      "So sánh lượt xe tuần này với tuần trước"
  │      "Tỷ lệ lấp đầy bãi xe hiện tại?"
  │      "Có vấn đề gì cần chú ý không?"
  │
  ▼
[Hệ thống] Load 10 tin nhắn gần nhất của conversation (context)
  │
  ▼
[Hệ thống] Xây dựng System Prompt động:
  │  ├── Inject danh sách Facility thuộc scope quản lý của Manager
  │  └── Thêm quy tắc bảo mật: chỉ cho truy vấn data trong scope
  │
  ▼
[Hệ thống] Gửi message + history + tools tới Google Gemini AI
  │
  ▼
[Gemini AI] Phân tích ý định → Quyết định gọi Function(s):
  │  ├── get_revenue_report      → Doanh thu theo khoảng thời gian
  │  ├── get_traffic_report      → Lượt xe vào/ra
  │  ├── get_occupancy_report    → Tỷ lệ lấp đầy realtime
  │  ├── get_peak_hours_report   → Khung giờ cao điểm
  │  ├── get_exception_summary   → Thống kê ngoại lệ
  │  ├── get_active_sessions     → Số xe đang gửi
  │  ├── get_feedback_report     → Phản hồi khách hàng
  │  └── get_facility_info       → Thông tin bãi xe
  │
  ▼
[Hệ thống] Thực thi Function → Query MongoDB (có scope filtering)
  │  ├── Nếu Manager quản lý nhiều bãi → Query tất cả + merge kết quả
  │  └── Nếu hỏi về bãi ngoài scope → Từ chối truy cập
  │
  ▼
[Hệ thống] Trả kết quả Function về cho Gemini AI
  │  (Hỗ trợ multi-turn: AI có thể gọi thêm function, tối đa 3 lượt)
  │
  ▼
[Gemini AI] Tổng hợp dữ liệu → Sinh câu trả lời:
  │  ├── Trình bày số liệu bằng bảng Markdown / bullet points
  │  ├── Phân tích xu hướng, phát hiện bất thường
  │  ├── Cảnh báo (doanh thu giảm > 20%, lấp đầy > 85%, ngoại lệ tăng đột biến)
  │  ├── Khuyến nghị hành động cụ thể
  │  └── Gợi ý chartType: bar / line / pie / table
  │
  ▼
[Hệ thống] Lưu lịch sử chat (ChatHistory) + sinh tiêu đề conversation
  │
  ▼
[Manager] Xem câu trả lời + biểu đồ trực quan trên Dashboard ✅
```

---

## 📋 Bảng tổng hợp

| STT | Tên luồng                      | Actor chính                     | Platform           | Ghi chú                              |
| :-: | ------------------------------ | ------------------------------- | ------------------ | ------------------------------------ |
|  1  | Check-in Walk-in               | **Staff**                       | Web                | Luồng core — xe vãng lai vào bãi     |
|  2  | Check-out + Thanh toán         | **Staff**                       | Web                | Luồng core — tính phí + thu tiền mặt |
|  3  | Đặt chỗ + Check-in Reservation | **Driver** → **Staff**          | Mobile → Web       | Luồng cross-platform                 |
|  4  | ALPR — Nhận diện biển số       | **Staff** trigger, **AI** xử lý | Web + ALPR Service | Tích hợp YOLOv8 + PaddleOCR          |
|  5  | Xử lý Ngoại lệ                 | **Staff** + **Manager**         | Web                | Mất thẻ, sai biển, sai chỗ, quá hạn  |
|  6  | AI Chatbot — Báo cáo           | **Manager**                     | Web                | Gemini AI + Function Calling         |
