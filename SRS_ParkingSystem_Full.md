# SRS - PHẦN 1: CÁC TÁC NHÂN (ACTORS) VÀ PHÂN QUYỀN

## Hệ thống Quản lý Bãi Đỗ Xe Thông Minh (Smart Parking Management System)

**Phiên bản:** 1.0  
**Ngày tạo:** 13/05/2026  
**Công nghệ:** Node.js Express (Backend) | React (Web Frontend) | React Native (Mobile App)  

---

## 1. Tổng quan hệ thống

Hệ thống Quản lý Bãi Đỗ Xe Thông Minh là phần mềm hỗ trợ quản lý toàn diện hoạt động của bãi đỗ xe trong các tòa nhà, trung tâm thương mại, khu dân cư. Hệ thống cho phép quản lý slot đỗ xe, theo dõi phương tiện ra/vào, tính phí tự động, đặt chỗ trước và báo cáo thống kê.

### Kiến trúc hệ thống

| Thành phần | Công nghệ | Mô tả |
|---|---|---|
| **Backend API** | Node.js + Express.js | RESTful API server xử lý business logic, xác thực, phân quyền |
| **Web Frontend** | React.js | Giao diện web cho Manager, Staff và Admin (SPA) |
| **Mobile App** | React Native | Ứng dụng di động cho Driver (Android & iOS) |
| **Database** | MongoDB + Mongoose | Lưu trữ dữ liệu dạng document (NoSQL) |
| **Realtime** | Socket.IO | Cập nhật trạng thái slot, thông báo realtime |

### Phân bổ nền tảng theo Actor

| Actor | Web (React) | Mobile (React Native) |
|---|:---:|:---:|
| System Administrator | ✅ Admin Panel | ❌ |
| Parking Manager | ✅ Dashboard | ❌ |
| Parking Staff | ✅ Staff Portal / Tablet | ❌ |
| Parking User / Driver | ✅ Web App (tùy chọn) | ✅ Mobile App (chính) |

---

## 2. Danh sách các tác nhân (Actors)

### 2.1. Parking Facility Manager (Quản lý bãi xe)

| Thuộc tính | Mô tả |
|---|---|
| **Mã tác nhân** | ACT-01 |
| **Tên** | Parking Facility Manager |
| **Mô tả** | Người quản lý toàn bộ hoạt động vận hành bãi đỗ xe: cấu hình tòa nhà, tầng, slot, bảng giá, chính sách phí và theo dõi báo cáo |
| **Loại** | Người dùng chính (Primary Actor) |
| **Kênh truy cập** | Web Dashboard (React) |
| **Xác thực** | Tài khoản + mật khẩu, được cấp bởi System Administrator |

**Các hành động chính:**
- Quản lý thông tin tòa nhà gửi xe (CRUD)
- Quản lý loại phương tiện (xe máy, ô tô, xe đạp, xe điện…)
- Quản lý phân tầng theo loại xe
- Quản lý slot đỗ xe và trạng thái slot
- Quản lý bảng giá, chính sách tính phí
- Xem báo cáo doanh thu, lượt xe, tỷ lệ lấp đầy
- Theo dõi các trường hợp ngoại lệ (mất vé, sai biển số, quá giờ…)

---

### 2.2. Parking Staff (Nhân viên bãi xe)

| Thuộc tính | Mô tả |
|---|---|
| **Mã tác nhân** | ACT-02 |
| **Tên** | Parking Staff |
| **Mô tả** | Nhân viên trực tiếp vận hành tại bãi xe: xử lý xe vào/ra, tạo lượt gửi, thu phí, xử lý ngoại lệ |
| **Loại** | Người dùng chính (Primary Actor) |
| **Kênh truy cập** | Web App (React) / Tablet tại cổng bãi xe |
| **Xác thực** | Tài khoản + mật khẩu, được cấp bởi Manager hoặc Admin |

**Các hành động chính:**
- Kiểm tra điều kiện xe vào bãi
- Nhập/quét biển số xe
- Tạo lượt gửi xe (parking session)
- Hướng dẫn xe vào đúng tầng/khu vực
- Xử lý xe ra bãi: tìm lượt gửi, xác nhận thời gian, thu phí
- Xử lý ngoại lệ: mất thẻ, sai thông tin, quá hạn, gửi sai khu vực

---

### 2.3. Parking User / Driver (Người gửi xe)

| Thuộc tính | Mô tả |
|---|---|
| **Mã tác nhân** | ACT-03 |
| **Tên** | Parking User / Driver |
| **Mô tả** | Người sử dụng dịch vụ gửi xe: xem thông tin bãi, gửi xe theo lượt, đặt chỗ trước, theo dõi lượt gửi và thanh toán |
| **Loại** | Người dùng chính (Primary Actor) |
| **Kênh truy cập** | Mobile App (React Native - chính) / Web App (React - phụ) |
| **Xác thực** | Đăng ký tài khoản / Đăng nhập / Khách (guest – chỉ gửi theo lượt) |

**Các hành động chính:**
- Xem thông tin bãi xe (giờ hoạt động, bảng giá, slot trống)
- Gửi xe theo lượt (nhận thẻ/mã gửi xe)
- Đặt chỗ trước (nếu hệ thống hỗ trợ)
- Theo dõi lượt gửi xe hiện tại
- Thanh toán phí gửi xe
- Gửi phản hồi / báo cáo sự cố

---

### 2.4. System Administrator (Quản trị hệ thống)

| Thuộc tính | Mô tả |
|---|---|
| **Mã tác nhân** | ACT-04 |
| **Tên** | System Administrator |
| **Mô tả** | Quản trị viên hệ thống: quản lý tài khoản, phân quyền, cấu hình hệ thống |
| **Loại** | Người dùng hỗ trợ (Supporting Actor) |
| **Kênh truy cập** | Web Admin Panel (React) |
| **Xác thực** | Tài khoản đặc quyền (super admin) |

**Các hành động chính:**
- Quản lý tài khoản người dùng (CRUD)
- Phân quyền theo vai trò (Role-Based Access Control)
- Quản lý cấu hình hệ thống (thông số chung, kết nối, thông báo…)

---

## 3. Ma trận phân quyền (Permission Matrix)

### 3.1. Module Quản lý Tòa nhà & Cơ sở vật chất

| Chức năng | Admin | Manager | Staff | Driver |
|---|:---:|:---:|:---:|:---:|
| Tạo/Sửa/Xóa tòa nhà | ✅ | ✅ | ❌ | ❌ |
| Xem thông tin tòa nhà | ✅ | ✅ | ✅ | ✅ (giới hạn) |
| Quản lý tầng/khu vực | ✅ | ✅ | ❌ | ❌ |
| Quản lý loại phương tiện | ✅ | ✅ | ❌ | ❌ |
| Phân tầng theo loại xe | ✅ | ✅ | ❌ | ❌ |

### 3.2. Module Quản lý Slot đỗ xe

| Chức năng | Admin | Manager | Staff | Driver |
|---|:---:|:---:|:---:|:---:|
| Tạo/Sửa/Xóa slot | ✅ | ✅ | ❌ | ❌ |
| Xem trạng thái slot | ✅ | ✅ | ✅ | ✅ (số lượng trống) |
| Cập nhật trạng thái slot (bảo trì/khóa) | ✅ | ✅ | ✅ (giới hạn) | ❌ |
| Đặt chỗ trước slot | ❌ | ❌ | ❌ | ✅ |

### 3.3. Module Bảng giá & Chính sách phí

| Chức năng | Admin | Manager | Staff | Driver |
|---|:---:|:---:|:---:|:---:|
| Tạo/Sửa/Xóa bảng giá | ✅ | ✅ | ❌ | ❌ |
| Xem bảng giá | ✅ | ✅ | ✅ | ✅ |
| Cấu hình chính sách phí | ✅ | ✅ | ❌ | ❌ |

### 3.4. Module Lượt gửi xe (Parking Session)

| Chức năng | Admin | Manager | Staff | Driver |
|---|:---:|:---:|:---:|:---:|
| Tạo lượt gửi xe | ❌ | ❌ | ✅ | ❌ |
| Xem lượt gửi xe | ✅ | ✅ | ✅ | ✅ (của mình) |
| Kết thúc lượt gửi / thu phí | ❌ | ❌ | ✅ | ❌ |
| Xử lý ngoại lệ lượt gửi | ✅ | ✅ | ✅ | ❌ |

### 3.5. Module Thanh toán

| Chức năng | Admin | Manager | Staff | Driver |
|---|:---:|:---:|:---:|:---:|
| Thu phí tại bãi | ❌ | ❌ | ✅ | ❌ |
| Thanh toán online | ❌ | ❌ | ❌ | ✅ |
| Xem lịch sử thanh toán | ✅ | ✅ | ✅ (ca mình) | ✅ (của mình) |

### 3.6. Module Báo cáo & Thống kê

| Chức năng | Admin | Manager | Staff | Driver |
|---|:---:|:---:|:---:|:---:|
| Xem báo cáo doanh thu | ✅ | ✅ | ❌ | ❌ |
| Xem báo cáo lượt xe vào/ra | ✅ | ✅ | ❌ | ❌ |
| Xem báo cáo tỷ lệ lấp đầy | ✅ | ✅ | ❌ | ❌ |
| Xem báo cáo khung giờ cao điểm | ✅ | ✅ | ❌ | ❌ |
| Xem báo cáo ngoại lệ | ✅ | ✅ | ❌ | ❌ |

### 3.7. Module Quản trị hệ thống

| Chức năng | Admin | Manager | Staff | Driver |
|---|:---:|:---:|:---:|:---:|
| Quản lý tài khoản người dùng | ✅ | ❌ | ❌ | ❌ |
| Phân quyền vai trò | ✅ | ❌ | ❌ | ❌ |
| Cấu hình hệ thống | ✅ | ❌ | ❌ | ❌ |
| Xem log hệ thống | ✅ | ❌ | ❌ | ❌ |

### 3.8. Module Phản hồi & Sự cố

| Chức năng | Admin | Manager | Staff | Driver |
|---|:---:|:---:|:---:|:---:|
| Gửi phản hồi / báo cáo sự cố | ❌ | ❌ | ❌ | ✅ |
| Xem phản hồi | ✅ | ✅ | ✅ (liên quan) | ✅ (của mình) |
| Xử lý phản hồi | ✅ | ✅ | ❌ | ❌ |

---

## 4. Sơ đồ phân quyền theo vai trò (RBAC)

```
System Administrator (ACT-04)
│
├── Quản lý tất cả tài khoản
├── Phân quyền vai trò cho từng user
├── Cấu hình hệ thống toàn cục
│
└── Parking Facility Manager (ACT-01)
    │
    ├── Quản lý tòa nhà, tầng, khu vực
    ├── Quản lý loại xe, slot, bảng giá
    ├── Xem toàn bộ báo cáo
    ├── Theo dõi ngoại lệ
    │
    └── Parking Staff (ACT-02)
        │
        ├── Tạo / kết thúc lượt gửi xe
        ├── Thu phí tại bãi
        ├── Xử lý ngoại lệ (giới hạn)
        └── Cập nhật trạng thái slot (giới hạn)

Parking User / Driver (ACT-03)
│
├── Xem thông tin bãi xe (public)
├── Gửi xe / Đặt chỗ trước
├── Theo dõi lượt gửi của mình
├── Thanh toán online
└── Gửi phản hồi
```

---

## 5. Quy tắc phân quyền

| # | Quy tắc | Mô tả |
|---|---|---|
| PQ-01 | Nguyên tắc đặc quyền tối thiểu | Mỗi vai trò chỉ được cấp quyền tối thiểu cần thiết để thực hiện công việc |
| PQ-02 | Kế thừa quyền | Admin kế thừa toàn bộ quyền của Manager; Manager KHÔNG kế thừa quyền của Staff (tách biệt chức năng vận hành) |
| PQ-03 | Phạm vi dữ liệu | Driver chỉ xem dữ liệu của chính mình; Staff xem dữ liệu trong ca/cổng mình phụ trách |
| PQ-04 | Xác thực bắt buộc | Mọi thao tác (trừ xem thông tin bãi xe công khai) đều yêu cầu đăng nhập |
| PQ-05 | Phân quyền động | Admin có thể tùy chỉnh quyền cho từng tài khoản cụ thể ngoài quyền mặc định của vai trò |
| PQ-06 | Ghi log truy cập | Mọi thao tác thay đổi dữ liệu đều được ghi log kèm user, thời gian, hành động |

---

*Kết thúc Phần 1 – Tiếp theo: Phần 2 – Yêu cầu Chức năng (Functional Requirements)*
# SRS - PHẦN 2A: YÊU CẦU CHỨC NĂNG – PARKING FACILITY MANAGER

**Phiên bản:** 1.0 | **Ngày:** 13/05/2026

---

## FR-1: Quản lý thông tin tòa nhà gửi xe

### FR-1.1: Thêm tòa nhà mới
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-1.1 |
| **Actor** | Parking Manager |
| **Mô tả** | Cho phép Manager tạo mới một tòa nhà / cơ sở bãi đỗ xe trong hệ thống |
| **Điều kiện tiên quyết** | Manager đã đăng nhập thành công |
| **Dữ liệu đầu vào** | Tên tòa nhà, địa chỉ, số tầng đỗ xe, giờ hoạt động (mở/đóng), mô tả, hình ảnh (tùy chọn) |
| **Luồng chính** | 1. Manager chọn "Thêm tòa nhà" → 2. Nhập thông tin → 3. Hệ thống validate → 4. Lưu và hiển thị thông báo thành công |
| **Luồng ngoại lệ** | Tên tòa nhà trùng → Thông báo lỗi; Thiếu trường bắt buộc → Highlight trường lỗi |
| **Kết quả** | Tòa nhà mới được tạo với trạng thái "Hoạt động" |

### FR-1.2: Sửa thông tin tòa nhà
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-1.2 |
| **Actor** | Parking Manager |
| **Mô tả** | Cho phép Manager cập nhật thông tin tòa nhà đã tồn tại |
| **Điều kiện tiên quyết** | Tòa nhà đã tồn tại trong hệ thống |
| **Dữ liệu đầu vào** | Các trường cần cập nhật (tên, địa chỉ, giờ hoạt động…) |
| **Luồng chính** | 1. Manager chọn tòa nhà → 2. Chọn "Sửa" → 3. Cập nhật thông tin → 4. Hệ thống validate → 5. Lưu thay đổi |
| **Kết quả** | Thông tin tòa nhà được cập nhật |

### FR-1.3: Vô hiệu hóa / Xóa tòa nhà
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-1.3 |
| **Actor** | Parking Manager |
| **Mô tả** | Cho phép Manager vô hiệu hóa hoặc xóa mềm tòa nhà không còn sử dụng |
| **Điều kiện tiên quyết** | Không còn lượt gửi xe đang hoạt động trong tòa nhà |
| **Luồng chính** | 1. Manager chọn tòa nhà → 2. Chọn "Vô hiệu hóa" → 3. Hệ thống kiểm tra ràng buộc → 4. Xác nhận → 5. Cập nhật trạng thái |
| **Luồng ngoại lệ** | Còn xe đang gửi → Không cho phép, thông báo lỗi |
| **Kết quả** | Tòa nhà chuyển trạng thái "Ngừng hoạt động" |

### FR-1.4: Xem danh sách tòa nhà
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-1.4 |
| **Actor** | Parking Manager |
| **Mô tả** | Hiển thị danh sách tất cả tòa nhà với bộ lọc và tìm kiếm |
| **Kết quả** | Danh sách tòa nhà kèm thông tin tóm tắt: tên, địa chỉ, trạng thái, tổng slot, slot trống |

---

## FR-2: Quản lý loại phương tiện

### FR-2.1: Thêm loại phương tiện
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-2.1 |
| **Actor** | Parking Manager |
| **Mô tả** | Tạo loại phương tiện mới (xe máy, ô tô, xe đạp, xe điện, xe tải nhỏ…) |
| **Dữ liệu đầu vào** | Tên loại xe, mã loại xe, kích thước slot yêu cầu (nhỏ/vừa/lớn), mô tả, icon |
| **Luồng chính** | 1. Chọn "Thêm loại xe" → 2. Nhập thông tin → 3. Validate → 4. Lưu |
| **Kết quả** | Loại phương tiện mới sẵn sàng để gán cho tầng/khu vực |

### FR-2.2: Sửa / Xóa loại phương tiện
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-2.2 |
| **Actor** | Parking Manager |
| **Mô tả** | Cập nhật hoặc xóa mềm loại phương tiện |
| **Ràng buộc** | Không xóa loại xe đang được gán cho tầng/slot đang hoạt động |

### FR-2.3: Xem danh sách loại phương tiện
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-2.3 |
| **Actor** | Parking Manager |
| **Mô tả** | Hiển thị tất cả loại phương tiện trong hệ thống kèm số lượng slot tương ứng |

---

## FR-3: Quản lý phân tầng theo loại xe

### FR-3.1: Gán loại xe cho tầng / khu vực
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-3.1 |
| **Actor** | Parking Manager |
| **Mô tả** | Quy định tầng/khu vực nào phục vụ loại phương tiện nào |
| **Dữ liệu đầu vào** | Tòa nhà, tầng/khu vực, danh sách loại xe được phép |
| **Luồng chính** | 1. Chọn tòa nhà → 2. Chọn tầng → 3. Gán loại xe → 4. Lưu cấu hình |
| **Ràng buộc** | Một tầng có thể phục vụ nhiều loại xe; một loại xe có thể được gán cho nhiều tầng |
| **Kết quả** | Hệ thống biết chính xác tầng nào nhận loại xe nào để hướng dẫn Staff và Driver |

### FR-3.2: Xem sơ đồ phân tầng
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-3.2 |
| **Actor** | Parking Manager |
| **Mô tả** | Hiển thị sơ đồ tổng quan các tầng/khu vực kèm loại xe được phục vụ và tình trạng slot |

---

## FR-4: Quản lý slot đỗ xe và trạng thái slot

### FR-4.1: Tạo slot đỗ xe
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-4.1 |
| **Actor** | Parking Manager |
| **Dữ liệu đầu vào** | Mã slot, tầng/khu vực, loại xe phục vụ, vị trí (hàng/cột – tùy chọn) |
| **Hỗ trợ** | Tạo hàng loạt (bulk create) theo pattern mã slot |
| **Kết quả** | Slot mới với trạng thái mặc định "Trống" (Available) |

### FR-4.2: Cập nhật trạng thái slot
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-4.2 |
| **Actor** | Parking Manager, Parking Staff (giới hạn) |
| **Các trạng thái** | `Available` (Trống) → `Occupied` (Đang sử dụng) → `Available`; `Available` → `Reserved` (Đã đặt trước); `Available/Occupied` → `Maintenance` (Bảo trì); `Available` → `Locked` (Tạm khóa) |
| **Luồng chính** | 1. Chọn slot → 2. Chọn trạng thái mới → 3. Nhập lý do (nếu Maintenance/Locked) → 4. Xác nhận |
| **Ràng buộc** | Không chuyển slot đang Occupied sang Maintenance/Locked khi chưa kết thúc lượt gửi |

### FR-4.3: Xem bản đồ slot theo tầng
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-4.3 |
| **Actor** | Parking Manager |
| **Mô tả** | Hiển thị bản đồ trực quan các slot theo tầng, mã màu theo trạng thái |
| **Bộ lọc** | Theo tòa nhà, tầng, loại xe, trạng thái |

### FR-4.4: Xóa / Vô hiệu hóa slot
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-4.4 |
| **Actor** | Parking Manager |
| **Ràng buộc** | Không xóa slot đang Occupied hoặc Reserved |

---

## FR-5: Quản lý bảng giá và chính sách tính phí

### FR-5.1: Tạo bảng giá
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-5.1 |
| **Actor** | Parking Manager |
| **Dữ liệu đầu vào** | Tên bảng giá, loại xe áp dụng, loại phí (theo lượt / theo giờ / theo ngày / theo tháng), đơn giá, phí ban đêm (nếu có), phí quá giờ |
| **Hỗ trợ** | Tạo nhiều mức giá theo khung giờ (giờ đầu, giờ tiếp theo, qua đêm…) |
| **Kết quả** | Bảng giá mới sẵn sàng áp dụng cho bãi xe |

### FR-5.2: Gán bảng giá cho tòa nhà / khu vực
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-5.2 |
| **Actor** | Parking Manager |
| **Mô tả** | Liên kết bảng giá với tòa nhà hoặc khu vực cụ thể |
| **Ràng buộc** | Mỗi tổ hợp (tòa nhà + loại xe) chỉ có một bảng giá active tại một thời điểm |

### FR-5.3: Sửa / Vô hiệu hóa bảng giá
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-5.3 |
| **Actor** | Parking Manager |
| **Ràng buộc** | Bảng giá cũ được lưu lịch sử; các lượt gửi đang diễn ra giữ bảng giá tại thời điểm bắt đầu |

### FR-5.4: Xem danh sách bảng giá
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-5.4 |
| **Actor** | Parking Manager |
| **Mô tả** | Hiển thị tất cả bảng giá kèm trạng thái (Active/Inactive), loại xe, tòa nhà áp dụng |

---

## FR-6: Xem báo cáo thống kê

### FR-6.1: Báo cáo lượt xe vào/ra
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-6.1 |
| **Actor** | Parking Manager |
| **Mô tả** | Thống kê số lượt xe vào/ra theo ngày, tuần, tháng |
| **Bộ lọc** | Tòa nhà, tầng, loại xe, khoảng thời gian, cổng vào/ra |
| **Hiển thị** | Bảng số liệu + biểu đồ đường/cột |

### FR-6.2: Báo cáo doanh thu
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-6.2 |
| **Actor** | Parking Manager |
| **Mô tả** | Thống kê doanh thu gửi xe theo ngày, tuần, tháng |
| **Bộ lọc** | Tòa nhà, loại xe, phương thức thanh toán, khoảng thời gian |
| **Hiển thị** | Tổng doanh thu, doanh thu trung bình/ngày, biểu đồ xu hướng |

### FR-6.3: Báo cáo tỷ lệ lấp đầy
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-6.3 |
| **Actor** | Parking Manager |
| **Mô tả** | Tỷ lệ % slot đang sử dụng / tổng slot theo từng tầng, loại xe |
| **Hiển thị** | Heatmap theo tầng, biểu đồ tròn theo loại xe |

### FR-6.4: Báo cáo khung giờ cao điểm
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-6.4 |
| **Actor** | Parking Manager |
| **Mô tả** | Xác định các khung giờ có lượng xe vào/ra nhiều nhất |
| **Hiển thị** | Biểu đồ phân bố theo giờ trong ngày |

---

## FR-7: Theo dõi trường hợp ngoại lệ (Optional)

### FR-7.1: Xem danh sách ngoại lệ
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-7.1 |
| **Actor** | Parking Manager |
| **Các loại ngoại lệ** | Mất vé/thẻ xe, Sai biển số, Quá giờ quy định, Gửi sai khu vực, Xe chưa thanh toán |
| **Mô tả** | Hiển thị danh sách các trường hợp ngoại lệ được Staff ghi nhận |
| **Bộ lọc** | Loại ngoại lệ, trạng thái xử lý, ngày, nhân viên xử lý |

### FR-7.2: Xử lý / Duyệt ngoại lệ
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-7.2 |
| **Actor** | Parking Manager |
| **Mô tả** | Xem chi tiết, thêm ghi chú, duyệt xử lý hoặc chuyển trạng thái ngoại lệ |
| **Trạng thái** | Mới → Đang xử lý → Đã giải quyết / Từ chối |

---

*Kết thúc Phần 2A – Tiếp theo: Phần 2B – Yêu cầu Chức năng: Parking Staff*
# SRS - PHẦN 2B: YÊU CẦU CHỨC NĂNG – PARKING STAFF

**Phiên bản:** 1.0 | **Ngày:** 13/05/2026

---

## FR-8: Xử lý xe vào bãi

### FR-8.1: Kiểm tra điều kiện xe vào bãi
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-8.1 |
| **Actor** | Parking Staff |
| **Mô tả** | Kiểm tra xe có đủ điều kiện vào bãi hay không trước khi cho phép vào |
| **Điều kiện tiên quyết** | Staff đã đăng nhập, đã được gán ca trực và cổng làm việc |
| **Các điều kiện kiểm tra** | (1) Loại xe có được bãi phục vụ không; (2) Còn slot trống cho loại xe này không; (3) Bãi xe có đang trong giờ hoạt động không; (4) Xe có đang trong danh sách cấm/blacklist không |
| **Luồng chính** | 1. Staff chọn cổng vào → 2. Chọn loại xe → 3. Hệ thống kiểm tra tự động → 4. Hiển thị kết quả: ĐỦ ĐIỀU KIỆN / KHÔNG ĐỦ ĐIỀU KIỆN |
| **Luồng ngoại lệ** | Hết slot → Thông báo "Bãi đầy cho loại xe [X]"; Ngoài giờ → Thông báo "Bãi xe đang đóng" |
| **Kết quả** | Xác nhận xe đủ/không đủ điều kiện vào bãi |

### FR-8.2: Nhập / Quét biển số xe
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-8.2 |
| **Actor** | Parking Staff |
| **Mô tả** | Ghi nhận biển số xe khi vào bãi bằng cách nhập tay hoặc quét camera |
| **Dữ liệu đầu vào** | Biển số xe (nhập tay hoặc quét tự động qua camera/OCR) |
| **Luồng chính** | 1. Staff nhập biển số hoặc chọn "Quét biển số" → 2. Hệ thống nhận diện/xác nhận biển số → 3. Hiển thị biển số để Staff xác nhận |
| **Luồng ngoại lệ** | OCR không nhận diện được → Staff nhập tay; Biển số trùng với xe đang gửi → Cảnh báo |
| **Kết quả** | Biển số xe được ghi nhận chính xác |

### FR-8.3: Hướng dẫn xe vào đúng tầng / khu vực
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-8.3 |
| **Actor** | Parking Staff |
| **Mô tả** | Hệ thống gợi ý tầng/khu vực phù hợp dựa trên loại xe và slot còn trống |
| **Luồng chính** | 1. Sau khi xác nhận loại xe → 2. Hệ thống hiển thị danh sách tầng/khu vực có slot trống → 3. Staff chọn hoặc hệ thống tự gán tầng/khu vực → 4. Thông tin hiển thị trên thẻ xe/vé xe |
| **Kết quả** | Driver được hướng dẫn đến đúng khu vực đỗ xe |

---

## FR-9: Tạo lượt gửi xe (Parking Session)

### FR-9.1: Tạo parking session mới
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-9.1 |
| **Actor** | Parking Staff |
| **Mô tả** | Tạo một lượt gửi xe mới khi xe vào bãi |
| **Điều kiện tiên quyết** | Xe đã qua kiểm tra điều kiện (FR-8.1), biển số đã được ghi nhận (FR-8.2) |
| **Dữ liệu ghi nhận** | Mã lượt gửi (tự sinh), biển số xe, loại xe, thời gian vào (timestamp), cổng vào, tầng/khu vực gợi ý, mã thẻ xe/QR code, Staff tạo lượt gửi |
| **Luồng chính** | 1. Hệ thống tổng hợp thông tin từ FR-8 → 2. Staff xác nhận tạo lượt gửi → 3. Hệ thống tạo session + sinh mã thẻ xe/QR → 4. In thẻ xe / hiển thị QR cho Driver → 5. Cập nhật slot tương ứng sang "Occupied" |
| **Kết quả** | Parking session được tạo; thẻ xe/QR được cấp; slot được đánh dấu "Đang sử dụng" |

### FR-9.2: Xem danh sách lượt gửi đang hoạt động
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-9.2 |
| **Actor** | Parking Staff |
| **Mô tả** | Xem danh sách tất cả các lượt gửi xe đang hoạt động (xe chưa ra) |
| **Bộ lọc** | Biển số, loại xe, tầng/khu vực, thời gian vào, cổng vào |
| **Hiển thị** | Mã lượt gửi, biển số, loại xe, giờ vào, thời gian gửi tạm tính, khu vực, phí tạm tính |

---

## FR-10: Xử lý xe ra bãi

### FR-10.1: Tìm lượt gửi xe
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-10.1 |
| **Actor** | Parking Staff |
| **Mô tả** | Tìm parking session của xe đang muốn ra bãi |
| **Cách tìm** | (1) Quét/nhập mã thẻ xe/QR; (2) Nhập/quét biển số xe; (3) Tìm theo mã lượt gửi |
| **Luồng chính** | 1. Staff quét thẻ/nhập biển số → 2. Hệ thống tìm session tương ứng → 3. Hiển thị thông tin lượt gửi |
| **Luồng ngoại lệ** | Không tìm thấy session → Chuyển sang xử lý ngoại lệ (FR-11) |
| **Kết quả** | Hiển thị chi tiết parking session: biển số, loại xe, giờ vào, khu vực, thời gian gửi |

### FR-10.2: Xác nhận thời gian ra và tính phí
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-10.2 |
| **Actor** | Parking Staff |
| **Mô tả** | Xác nhận thời gian xe ra bãi, hệ thống tự động tính phí dựa trên bảng giá áp dụng |
| **Dữ liệu tính phí** | Thời gian vào, thời gian ra, loại xe, bảng giá áp dụng, phụ phí (nếu có: qua đêm, quá giờ…) |
| **Luồng chính** | 1. Hệ thống ghi nhận thời gian ra → 2. Tính phí tự động theo bảng giá → 3. Hiển thị chi tiết phí cho Staff xác nhận |
| **Hiển thị** | Tổng thời gian gửi, đơn giá áp dụng, phụ phí, tổng phí cần thanh toán |

### FR-10.3: Thu phí gửi xe
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-10.3 |
| **Actor** | Parking Staff |
| **Mô tả** | Thu phí từ Driver và hoàn tất lượt gửi xe |
| **Phương thức thanh toán** | Tiền mặt, chuyển khoản/QR Pay, ví điện tử (nếu tích hợp) |
| **Luồng chính** | 1. Staff chọn phương thức thanh toán → 2. Nhận tiền/xác nhận thanh toán → 3. Hệ thống cập nhật session sang "Completed" → 4. Cập nhật slot sang "Available" → 5. In biên lai (tùy chọn) |
| **Kết quả** | Lượt gửi xe kết thúc; slot được giải phóng; doanh thu được ghi nhận |

---

## FR-11: Xử lý trường hợp ngoại lệ

### FR-11.1: Xử lý mất thẻ xe
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-11.1 |
| **Actor** | Parking Staff |
| **Mô tả** | Xử lý khi Driver báo mất thẻ xe / mã gửi xe |
| **Luồng chính** | 1. Driver báo mất thẻ → 2. Staff tìm session theo biển số xe → 3. Xác minh thông tin (biển số, loại xe, thời gian vào ước tính) → 4. Tạo bản ghi ngoại lệ loại "Mất thẻ" → 5. Tính phí (có thể áp dụng phụ phí mất thẻ) → 6. Thu phí và kết thúc session |
| **Dữ liệu ghi nhận** | Loại ngoại lệ, mô tả, giấy tờ xác minh (nếu có), Staff xử lý, thời gian xử lý |

### FR-11.2: Xử lý sai thông tin xe
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-11.2 |
| **Actor** | Parking Staff |
| **Mô tả** | Xử lý khi biển số xe thực tế không khớp với biển số trong session |
| **Luồng chính** | 1. Staff phát hiện sai lệch → 2. Tạo bản ghi ngoại lệ loại "Sai biển số" → 3. Xác minh bổ sung (giấy tờ xe, CMND/CCCD) → 4. Cập nhật biển số đúng hoặc từ chối cho xe ra → 5. Ghi chú lý do |

### FR-11.3: Xử lý xe quá hạn gửi
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-11.3 |
| **Actor** | Parking Staff |
| **Mô tả** | Xử lý xe gửi quá thời gian quy định (nếu bãi có giới hạn thời gian tối đa) |
| **Luồng chính** | 1. Hệ thống tự động phát hiện session quá hạn → 2. Đánh dấu cảnh báo → 3. Staff tạo bản ghi ngoại lệ → 4. Áp dụng phụ phí quá hạn theo chính sách → 5. Thông báo cho Manager (nếu cần) |

### FR-11.4: Xử lý xe gửi sai khu vực
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-11.4 |
| **Actor** | Parking Staff |
| **Mô tả** | Xử lý khi xe đỗ sai tầng/khu vực so với hướng dẫn |
| **Luồng chính** | 1. Staff phát hiện xe sai khu vực → 2. Tạo bản ghi ngoại lệ → 3. Cập nhật vị trí thực tế của xe trong session → 4. Cập nhật trạng thái slot (giải phóng slot cũ, đánh dấu slot thực tế) |

### FR-11.5: Cập nhật trạng thái slot (giới hạn)
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-11.5 |
| **Actor** | Parking Staff |
| **Mô tả** | Staff có thể cập nhật trạng thái slot trong phạm vi giới hạn |
| **Quyền cho phép** | Chuyển slot sang "Maintenance" khi phát hiện hư hỏng; Báo cáo slot bất thường lên Manager |
| **Quyền KHÔNG cho phép** | Xóa slot, tạo slot mới, thay đổi loại xe của slot |

---

*Kết thúc Phần 2B – Tiếp theo: Phần 2C – Yêu cầu Chức năng: Parking User / Driver*
# SRS - PHẦN 2C: YÊU CẦU CHỨC NĂNG – PARKING USER / DRIVER

**Phiên bản:** 1.0 | **Ngày:** 13/05/2026

---

## FR-12: Xem thông tin bãi xe

### FR-12.1: Xem thông tin chung bãi xe
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-12.1 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Xem thông tin công khai của bãi xe mà không cần đăng nhập |
| **Thông tin hiển thị** | Tên bãi xe, địa chỉ, giờ hoạt động (mở/đóng), các loại xe được phục vụ, số điện thoại liên hệ |
| **Kết quả** | Driver nắm được thông tin cơ bản để quyết định gửi xe |

### FR-12.2: Xem bảng giá và quy định
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-12.2 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Xem bảng giá gửi xe theo từng loại phương tiện và quy định bãi xe |
| **Thông tin hiển thị** | Bảng giá theo loại xe (lượt/giờ/ngày/tháng), phụ phí (qua đêm, quá giờ, mất thẻ), quy định gửi xe (thời gian tối đa, vật phẩm cấm mang theo…) |

### FR-12.3: Xem số slot trống theo loại xe
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-12.3 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Xem số lượng slot còn trống cho từng loại xe (realtime hoặc cập nhật định kỳ) |
| **Hiển thị** | Loại xe → Số slot trống / Tổng slot; Trạng thái: "Còn chỗ" / "Sắp hết" / "Hết chỗ" |

---

## FR-13: Gửi xe theo lượt

### FR-13.1: Nhận thẻ xe / mã gửi xe khi vào bãi
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-13.1 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Driver nhận thẻ xe vật lý hoặc mã QR điện tử khi xe vào bãi |
| **Luồng chính** | 1. Driver đến cổng vào → 2. Staff xử lý xe vào (FR-8, FR-9) → 3. Driver nhận thẻ xe/QR → 4. Driver gửi xe tại khu vực được hướng dẫn |
| **Thông tin trên thẻ/QR** | Mã lượt gửi, biển số xe, loại xe, giờ vào, tầng/khu vực gợi ý |

### FR-13.2: Thanh toán phí khi ra bãi
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-13.2 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Driver thanh toán phí gửi xe khi ra bãi |
| **Luồng chính** | 1. Driver đến cổng ra → 2. Đưa thẻ xe / quét QR → 3. Staff xử lý xe ra (FR-10) → 4. Driver xem chi tiết phí → 5. Thanh toán → 6. Nhận biên lai (tùy chọn) → 7. Ra bãi |
| **Phương thức thanh toán** | Tiền mặt, QR Pay, ví điện tử |

---

## FR-14: Đặt chỗ trước (Reservation)

### FR-14.1: Tạo đặt chỗ trước
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-14.1 |
| **Actor** | Parking User / Driver |
| **Điều kiện tiên quyết** | Driver đã đăng nhập; Hệ thống hỗ trợ tính năng đặt chỗ |
| **Dữ liệu đầu vào** | Loại phương tiện, thời gian bắt đầu gửi (dự kiến), thời gian kết thúc (dự kiến), khu vực ưu tiên (tùy chọn) |
| **Luồng chính** | 1. Driver chọn "Đặt chỗ trước" → 2. Chọn loại xe → 3. Chọn thời gian → 4. Hệ thống kiểm tra slot trống → 5. Hiển thị khu vực/slot có sẵn → 6. Driver xác nhận đặt chỗ → 7. Hệ thống tạo reservation + cập nhật slot sang "Reserved" |
| **Luồng ngoại lệ** | Không còn slot trống trong khung giờ → Gợi ý khung giờ/khu vực khác; Driver không đến trong thời gian quy định → Tự động hủy reservation |
| **Kết quả** | Reservation được tạo; Driver nhận mã đặt chỗ; Slot được giữ chỗ |

### FR-14.2: Xem / Hủy đặt chỗ
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-14.2 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Xem chi tiết và hủy đặt chỗ đã tạo |
| **Luồng chính** | 1. Driver vào "Đặt chỗ của tôi" → 2. Xem danh sách reservation → 3. Chọn hủy (nếu muốn) → 4. Hệ thống cập nhật slot sang "Available" |
| **Ràng buộc** | Chỉ hủy được reservation chưa bắt đầu; Áp dụng chính sách hủy (miễn phí/có phí tùy thời điểm hủy) |

---

## FR-15: Theo dõi lượt gửi xe

### FR-15.1: Xem thông tin lượt gửi hiện tại
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-15.1 |
| **Actor** | Parking User / Driver |
| **Điều kiện tiên quyết** | Driver đã đăng nhập và có lượt gửi xe đang hoạt động |
| **Thông tin hiển thị** | Mã lượt gửi, biển số xe, loại xe, thời gian vào, khu vực gửi, thời gian gửi hiện tại, phí tạm tính (cập nhật realtime hoặc định kỳ) |
| **Kết quả** | Driver biết chi phí ước tính và vị trí xe |

### FR-15.2: Xem lịch sử gửi xe
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-15.2 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Xem danh sách các lượt gửi xe đã hoàn thành |
| **Thông tin** | Ngày gửi, thời gian gửi, loại xe, bãi xe, phí đã thanh toán |

---

## FR-16: Thanh toán phí gửi xe

### FR-16.1: Thanh toán tại bãi
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-16.1 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Thanh toán trực tiếp tại cổng ra bãi qua Staff |
| **Chi tiết** | Xem mô tả tại FR-13.2 |

### FR-16.2: Thanh toán online (nếu hỗ trợ)
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-16.2 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Thanh toán phí gửi xe qua ứng dụng trước khi đến cổng ra |
| **Luồng chính** | 1. Driver mở lượt gửi hiện tại → 2. Chọn "Thanh toán" → 3. Chọn phương thức (QR Pay, ví điện tử, thẻ ngân hàng) → 4. Xác nhận thanh toán → 5. Hệ thống ghi nhận đã thanh toán → 6. Khi ra cổng, Staff xác nhận đã thanh toán online |

### FR-16.3: Thanh toán dịch vụ bổ sung
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-16.3 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Thanh toán các phí bổ sung nếu có: phụ phí mất thẻ, phí quá giờ, phí đặt chỗ trước |
| **Luồng chính** | Phí bổ sung được cộng vào tổng phí khi kết thúc lượt gửi |

---

## FR-17: Gửi phản hồi / Báo cáo sự cố (Optional)

### FR-17.1: Gửi phản hồi
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-17.1 |
| **Actor** | Parking User / Driver |
| **Điều kiện tiên quyết** | Driver đã đăng nhập |
| **Dữ liệu đầu vào** | Loại phản hồi (mất thẻ, sai phí, khó tìm xe, slot bị chiếm, vấn đề khác), mô tả chi tiết, hình ảnh đính kèm (tùy chọn), lượt gửi liên quan (tùy chọn) |
| **Luồng chính** | 1. Driver chọn "Gửi phản hồi" → 2. Chọn loại phản hồi → 3. Nhập mô tả → 4. Đính kèm ảnh (tùy chọn) → 5. Gửi → 6. Nhận xác nhận đã gửi |
| **Kết quả** | Phản hồi được tạo và chuyển cho Manager/Staff xử lý |

### FR-17.2: Theo dõi trạng thái phản hồi
| Thuộc tính | Mô tả |
|---|---|
| **Mã** | FR-17.2 |
| **Actor** | Parking User / Driver |
| **Mô tả** | Xem danh sách phản hồi đã gửi và trạng thái xử lý |
| **Trạng thái** | Đã gửi → Đang xử lý → Đã giải quyết / Từ chối |

---

*Kết thúc Phần 2C – Tiếp theo: Phần 2D – Yêu cầu Chức năng: System Administrator*
# SRS - PHẦN 2D: YÊU CẦU CHỨC NĂNG – SYSTEM ADMINISTRATOR

**Phiên bản:** 1.0 | **Ngày:** 13/05/2026

---

## FR-18: Quản lý tài khoản người dùng

### FR-18.1: Tạo tài khoản mới

| Thuộc tính          | Mô tả                                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã**              | FR-18.1                                                                                                                                                                          |
| **Actor**           | System Administrator                                                                                                                                                             |
| **Mô tả**           | Tạo tài khoản cho Manager, Staff hoặc Driver                                                                                                                                     |
| **Dữ liệu đầu vào** | Họ tên, email, số điện thoại, vai trò (Manager/Staff/Driver), mật khẩu tạm, bãi xe được gán (nếu Manager/Staff)                                                                  |
| **Luồng chính**     | 1. Admin chọn "Tạo tài khoản" → 2. Nhập thông tin → 3. Chọn vai trò → 4. Hệ thống validate (email/SĐT không trùng) → 5. Tạo tài khoản → 6. Gửi thông tin đăng nhập qua email/SMS |
| **Luồng ngoại lệ**  | Email/SĐT đã tồn tại → Thông báo lỗi                                                                                                                                             |
| **Kết quả**         | Tài khoản mới được tạo với vai trò và quyền tương ứng                                                                                                                            |

### FR-18.2: Sửa thông tin tài khoản

| Thuộc tính      | Mô tả                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| **Mã**          | FR-18.2                                                                 |
| **Actor**       | System Administrator                                                    |
| **Mô tả**       | Cập nhật thông tin cá nhân, vai trò, trạng thái tài khoản               |
| **Luồng chính** | 1. Admin tìm tài khoản → 2. Chọn "Sửa" → 3. Cập nhật thông tin → 4. Lưu |

### FR-18.3: Khóa / Mở khóa tài khoản

| Thuộc tính    | Mô tả                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------- |
| **Mã**        | FR-18.3                                                                                             |
| **Actor**     | System Administrator                                                                                |
| **Mô tả**     | Khóa tài khoản vi phạm hoặc không còn sử dụng; mở khóa khi cần                                      |
| **Ràng buộc** | Tài khoản bị khóa không thể đăng nhập; Staff bị khóa → các session đang xử lý chuyển cho Staff khác |

### FR-18.4: Reset mật khẩu

| Thuộc tính      | Mô tả                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| **Mã**          | FR-18.4                                                                                                   |
| **Actor**       | System Administrator                                                                                      |
| **Mô tả**       | Đặt lại mật khẩu cho tài khoản khi người dùng yêu cầu                                                     |
| **Luồng chính** | 1. Admin chọn tài khoản → 2. Chọn "Reset mật khẩu" → 3. Hệ thống sinh mật khẩu tạm → 4. Gửi qua email/SMS |

### FR-18.5: Xem danh sách tài khoản

| Thuộc tính   | Mô tả                                                            |
| ------------ | ---------------------------------------------------------------- |
| **Mã**       | FR-18.5                                                          |
| **Actor**    | System Administrator                                             |
| **Mô tả**    | Hiển thị danh sách tất cả tài khoản trong hệ thống               |
| **Bộ lọc**   | Vai trò, trạng thái (Active/Locked), bãi xe, từ khóa tìm kiếm    |
| **Hiển thị** | Họ tên, email, vai trò, trạng thái, ngày tạo, lần đăng nhập cuối |

---

## FR-19: Phân quyền (Role-Based Access Control)

### FR-19.1: Quản lý vai trò (Roles)

| Thuộc tính           | Mô tả                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| **Mã**               | FR-19.1                                                                   |
| **Actor**            | System Administrator                                                      |
| **Mô tả**            | Xem, tạo, sửa, xóa các vai trò trong hệ thống                             |
| **Vai trò mặc định** | System Administrator, Parking Manager, Parking Staff, Parking User/Driver |
| **Dữ liệu vai trò**  | Tên vai trò, mô tả, danh sách quyền (permissions)                         |
| **Ràng buộc**        | Không xóa vai trò mặc định; Không xóa vai trò đang được gán cho user      |

### FR-19.2: Quản lý quyền (Permissions)

| Thuộc tính         | Mô tả                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Mã**             | FR-19.2                                                                                                                    |
| **Actor**          | System Administrator                                                                                                       |
| **Mô tả**          | Gán/thu hồi quyền cho từng vai trò                                                                                         |
| **Nhóm quyền**     | Quản lý tòa nhà, Quản lý slot, Quản lý bảng giá, Quản lý parking session, Thanh toán, Báo cáo, Quản trị hệ thống, Phản hồi |
| **Mỗi nhóm quyền** | Xem (Read), Tạo (Create), Sửa (Update), Xóa (Delete), Xuất (Export)                                                        |

### FR-19.3: Gán vai trò cho người dùng

| Thuộc tính      | Mô tả                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------- |
| **Mã**          | FR-19.3                                                                                         |
| **Actor**       | System Administrator                                                                            |
| **Mô tả**       | Gán hoặc thay đổi vai trò cho tài khoản cụ thể                                                  |
| **Ràng buộc**   | Một tài khoản chỉ có một vai trò chính; Có thể bổ sung quyền ngoài vai trò (custom permissions) |
| **Luồng chính** | 1. Admin chọn tài khoản → 2. Chọn vai trò → 3. Tùy chỉnh quyền bổ sung (nếu cần) → 4. Lưu       |

---

## FR-20: Quản lý cấu hình hệ thống

### FR-20.1: Cấu hình thông số chung

| Thuộc tính   | Mô tả                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã**       | FR-20.1                                                                                                                                  |
| **Actor**    | System Administrator                                                                                                                     |
| **Mô tả**    | Cấu hình các thông số vận hành chung của hệ thống                                                                                        |
| **Thông số** | Tên hệ thống, logo, múi giờ, đơn vị tiền tệ, ngôn ngữ mặc định, số lượng bản ghi/trang (phân trang), thời gian timeout session đăng nhập |

### FR-20.2: Cấu hình thông báo

| Thuộc tính   | Mô tả                                                                           |
| ------------ | ------------------------------------------------------------------------------- |
| **Mã**       | FR-20.2                                                                         |
| **Actor**    | System Administrator                                                            |
| **Mô tả**    | Cấu hình email/SMS thông báo cho các sự kiện hệ thống                           |
| **Sự kiện**  | Tạo tài khoản, reset mật khẩu, đặt chỗ thành công/hủy, xe quá hạn, phản hồi mới |
| **Cấu hình** | Bật/tắt từng loại thông báo, template email/SMS, thông tin SMTP/SMS gateway     |

### FR-20.3: Cấu hình chính sách bảo mật

| Thuộc tính   | Mô tả                                                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mã**       | FR-20.3                                                                                                                                               |
| **Actor**    | System Administrator                                                                                                                                  |
| **Mô tả**    | Thiết lập các chính sách bảo mật tài khoản                                                                                                            |
| **Thông số** | Độ dài mật khẩu tối thiểu, yêu cầu ký tự đặc biệt, số lần đăng nhập sai tối đa trước khi khóa, thời gian khóa tài khoản, yêu cầu đổi mật khẩu định kỳ |

### FR-20.4: Xem log hệ thống

| Thuộc tính   | Mô tả                                                                                  |
| ------------ | -------------------------------------------------------------------------------------- |
| **Mã**       | FR-20.4                                                                                |
| **Actor**    | System Administrator                                                                   |
| **Mô tả**    | Xem nhật ký hoạt động hệ thống để giám sát và audit                                    |
| **Loại log** | Log đăng nhập/đăng xuất, Log thao tác dữ liệu (CRUD), Log lỗi hệ thống, Log thanh toán |
| **Bộ lọc**   | User, loại hành động, khoảng thời gian, mức độ (info/warning/error)                    |
| **Hiển thị** | Thời gian, User, Hành động, Đối tượng, IP address, Kết quả (thành công/thất bại)       |

### FR-20.5: Sao lưu và phục hồi dữ liệu

| Thuộc tính   | Mô tả                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| **Mã**       | FR-20.5                                                                    |
| **Actor**    | System Administrator                                                       |
| **Mô tả**    | Cấu hình sao lưu tự động và phục hồi dữ liệu khi cần                       |
| **Cấu hình** | Lịch sao lưu (hàng ngày/hàng tuần), vị trí lưu trữ, số bản sao lưu giữ lại |
| **Phục hồi** | Chọn bản sao lưu → Xác nhận → Phục hồi dữ liệu                             |

---

_Kết thúc Phần 2D – Tiếp theo: Phần 3 – Yêu cầu Phi chức năng (Non-Functional Requirements)_
# SRS - PHẦN 3: YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

**Phiên bản:** 1.0 | **Ngày:** 13/05/2026  
**Tech Stack:** Node.js Express (Backend) | React (Web) | React Native (Mobile)

---

## NFR-1: Hiệu năng (Performance)

| Mã      | Yêu cầu                        | Chỉ tiêu                                                               |
| ------- | ------------------------------ | ---------------------------------------------------------------------- |
| NFR-1.1 | Thời gian phản hồi trang web   | ≤ 2 giây cho trang thông thường; ≤ 3 giây cho trang có báo cáo/biểu đồ |
| NFR-1.2 | Thời gian tạo parking session  | ≤ 1 giây từ lúc Staff nhấn xác nhận                                    |
| NFR-1.3 | Thời gian tìm kiếm lượt gửi xe | ≤ 1 giây khi tìm theo mã thẻ/biển số                                   |
| NFR-1.4 | Thời gian tính phí tự động     | ≤ 0.5 giây sau khi xác nhận thời gian ra                               |
| NFR-1.5 | Cập nhật trạng thái slot       | Realtime hoặc ≤ 5 giây delay                                           |
| NFR-1.6 | Số người dùng đồng thời        | Hỗ trợ tối thiểu 100 người dùng đồng thời                              |
| NFR-1.7 | Tải báo cáo                    | ≤ 5 giây cho báo cáo dữ liệu 1 tháng                                   |

---

## NFR-2: Khả năng mở rộng (Scalability)

| Mã      | Yêu cầu            | Mô tả                                                    |
| ------- | ------------------ | -------------------------------------------------------- |
| NFR-2.1 | Mở rộng dữ liệu    | Hỗ trợ tối thiểu 10 tòa nhà, 100 tầng, 10.000 slot đỗ xe |
| NFR-2.2 | Mở rộng lượt gửi   | Lưu trữ tối thiểu 1 triệu parking session/năm            |
| NFR-2.3 | Mở rộng người dùng | Hỗ trợ tối thiểu 50.000 tài khoản Driver                 |
| NFR-2.4 | Kiến trúc mở rộng  | Hệ thống có thể scale horizontal khi tăng tải            |

---

## NFR-3: Tính sẵn sàng (Availability)

| Mã      | Yêu cầu                  | Chỉ tiêu                                                                         |
| ------- | ------------------------ | -------------------------------------------------------------------------------- |
| NFR-3.1 | Uptime                   | ≥ 99.5% (tương đương ≤ 43.8 giờ downtime/năm)                                    |
| NFR-3.2 | Bảo trì hệ thống         | Lên lịch bảo trì ngoài giờ cao điểm; thông báo trước ≥ 24 giờ                    |
| NFR-3.3 | Phục hồi sự cố           | RTO (Recovery Time Objective) ≤ 4 giờ; RPO (Recovery Point Objective) ≤ 1 giờ    |
| NFR-3.4 | Hoạt động offline cơ bản | Staff có thể tạo/kết thúc lượt gửi tạm khi mất kết nối → đồng bộ khi có lại mạng |

---

## NFR-4: Bảo mật (Security)

| Mã      | Yêu cầu                | Mô tả                                                                     |
| ------- | ---------------------- | ------------------------------------------------------------------------- |
| NFR-4.1 | Xác thực               | Sử dụng JWT token hoặc session-based authentication; hỗ trợ refresh token |
| NFR-4.2 | Mã hóa mật khẩu        | Mật khẩu được hash bằng bcrypt/argon2 (không lưu plaintext)               |
| NFR-4.3 | Truyền tải dữ liệu     | Toàn bộ giao tiếp qua HTTPS (TLS 1.2+)                                    |
| NFR-4.4 | Phân quyền             | RBAC (Role-Based Access Control); kiểm tra quyền ở cả frontend và backend |
| NFR-4.5 | Chống tấn công         | Bảo vệ chống NoSQL Injection, XSS, CSRF, Brute-force login                |
| NFR-4.6 | Khóa tài khoản         | Tự động khóa sau 5 lần đăng nhập sai liên tiếp; thời gian khóa: 15 phút   |
| NFR-4.7 | Audit log              | Ghi log tất cả thao tác thay đổi dữ liệu quan trọng                       |
| NFR-4.8 | Bảo vệ dữ liệu cá nhân | Tuân thủ quy định bảo vệ dữ liệu cá nhân (PDPA/GDPR nếu áp dụng)          |

---

## NFR-5: Tính khả dụng / Trải nghiệm người dùng (Usability)

| Mã      | Yêu cầu                    | Mô tả                                                                                                 |
| ------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| NFR-5.1 | Giao diện thân thiện       | UI trực quan, dễ sử dụng; Staff không cần đào tạo quá 2 giờ                                           |
| NFR-5.2 | Responsive Design (Web)    | Giao diện React web tương thích: Desktop (Manager/Admin), Tablet (Staff)                              |
| NFR-5.3 | Native Mobile UX           | Ứng dụng React Native cung cấp trải nghiệm native cho Driver trên cả Android & iOS                    |
| NFR-5.4 | Ngôn ngữ                   | Hỗ trợ tiếng Việt; có thể mở rộng đa ngôn ngữ (i18n – sử dụng react-i18next)                          |
| NFR-5.5 | Phản hồi trực quan         | Hiển thị loading indicator, thông báo thành công/lỗi rõ ràng, xác nhận trước thao tác quan trọng      |
| NFR-5.6 | Tìm kiếm nhanh             | Hỗ trợ tìm kiếm nhanh theo biển số, mã lượt gửi, tên tòa nhà từ thanh tìm kiếm chung                  |
| NFR-5.7 | Hỗ trợ bàn phím            | Staff có thể thao tác nhanh bằng phím tắt tại cổng bãi xe (web)                                       |
| NFR-5.8 | Push Notification (Mobile) | Ứng dụng React Native hỗ trợ push notification cho Driver (đặt chỗ, nhắc thanh toán, hết hạn giữ chỗ) |
| NFR-5.9 | Accessibility              | Tuân thủ WCAG 2.1 mức AA cơ bản (contrast, font size, alt text)                                       |

---

## NFR-6: Tính tương thích (Compatibility)

| Mã      | Yêu cầu                 | Mô tả                                                                         |
| ------- | ----------------------- | ----------------------------------------------------------------------------- |
| NFR-6.1 | Trình duyệt (Web React) | Hỗ trợ Chrome, Firefox, Edge, Safari phiên bản 2 năm gần nhất                 |
| NFR-6.2 | Android (React Native)  | Android 10+ (API level 29+)                                                   |
| NFR-6.3 | iOS (React Native)      | iOS 14+                                                                       |
| NFR-6.4 | Node.js runtime         | Node.js 18 LTS trở lên                                                        |
| NFR-6.5 | Thiết bị ngoại vi       | Tương thích máy in thẻ xe/biên lai (POS printer), camera/scanner quét biển số |
| NFR-6.6 | Tích hợp thanh toán     | Hỗ trợ tích hợp cổng thanh toán (VNPay, MoMo, ZaloPay) cho cả web và mobile   |

---

## NFR-7: Tính bảo trì (Maintainability)

| Mã       | Yêu cầu                | Mô tả                                                                                                           |
| -------- | ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| NFR-7.1  | Kiến trúc Backend      | Node.js Express sử dụng kiến trúc phân tầng: Routes → Controllers → Services → Repositories → Mongoose Models   |
| NFR-7.2  | Kiến trúc Web Frontend | React sử dụng component-based architecture; state management với Redux Toolkit hoặc Zustand                     |
| NFR-7.3  | Kiến trúc Mobile       | React Native chia sẻ business logic với web khi có thể; sử dụng React Navigation                                |
| NFR-7.4  | Shared Code            | Sử dụng monorepo (Nx/Turborepo) hoặc shared packages cho types, validation, utils dùng chung giữa web và mobile |
| NFR-7.5  | Coding standards       | Tuân thủ ESLint + Prettier thống nhất cho cả backend, web, mobile; có code review                               |
| NFR-7.6  | Tài liệu API           | Mọi API endpoint được document bằng Swagger/OpenAPI; web và mobile dùng chung API                               |
| NFR-7.7  | Version control        | Sử dụng Git với branching strategy rõ ràng (GitFlow hoặc trunk-based)                                           |
| NFR-7.8  | Testing                | Backend: Jest (unit + integration) coverage ≥ 70%. Web: React Testing Library. Mobile: Jest + Detox (E2E)       |
| NFR-7.9  | Logging                | Backend structured logging (Winston/Pino) với các mức: DEBUG, INFO, WARN, ERROR                                 |
| NFR-7.10 | Monitoring             | Health check endpoint; hỗ trợ monitoring (uptime, response time, error rate)                                    |

---

## NFR-8: Tính di động / Triển khai (Portability & Deployment)

| Mã      | Yêu cầu          | Mô tả                                                                                  |
| ------- | ---------------- | -------------------------------------------------------------------------------------- |
| NFR-8.1 | Containerization | Backend Node.js Express và Web React được đóng gói Docker container                    |
| NFR-8.2 | Môi trường       | Hỗ trợ tối thiểu 3 môi trường: Development, Staging, Production                        |
| NFR-8.3 | CI/CD            | Tích hợp pipeline CI/CD tự động (build, test, deploy) cho backend, web và mobile       |
| NFR-8.4 | Cơ sở dữ liệu    | Sử dụng MongoDB (NoSQL); ORM: Mongoose; quản lý schema bằng Mongoose Schema + migrate-mongo |
| NFR-8.5 | Cloud-ready      | Có thể triển khai trên cloud (AWS, GCP, Azure) hoặc on-premise                         |
| NFR-8.6 | Mobile App Store | React Native app phải đáp ứng yêu cầu publish lên Google Play Store và Apple App Store |
| NFR-8.7 | OTA Updates      | Hỗ trợ cập nhật OTA (Over-The-Air) cho React Native qua CodePush hoặc EAS Update       |

---

## NFR-9: Ràng buộc về dữ liệu (Data Requirements)

| Mã      | Yêu cầu          | Mô tả                                                                              |
| ------- | ---------------- | ---------------------------------------------------------------------------------- |
| NFR-9.1 | Sao lưu dữ liệu  | Sao lưu tự động hàng ngày; giữ tối thiểu 30 bản sao lưu                            |
| NFR-9.2 | Lưu trữ lịch sử  | Dữ liệu parking session lưu tối thiểu 3 năm                                        |
| NFR-9.3 | Toàn vẹn dữ liệu | Sử dụng MongoDB transaction (replica set) cho các thao tác quan trọng (tạo session, thanh toán) |
| NFR-9.4 | Xóa mềm          | Dữ liệu quan trọng sử dụng soft delete thay vì hard delete                         |
| NFR-9.5 | Đồng bộ dữ liệu  | Trạng thái slot phải đồng bộ giữa các client trong ≤ 5 giây                        |

---

_Kết thúc Phần 3 – Tiếp theo: Phần 4 – Luật Nghiệp vụ (Business Rules)_
# SRS - PHẦN 4: LUẬT NGHIỆP VỤ (BUSINESS RULES)

**Phiên bản:** 1.0 | **Ngày:** 13/05/2026

---

## BR-1: Luật nghiệp vụ về Tòa nhà & Cơ sở vật chất

| Mã     | Luật nghiệp vụ                   | Mô tả chi tiết                                                                                                             |
| ------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| BR-1.1 | Tòa nhà phải có thông tin đầy đủ | Mỗi tòa nhà bắt buộc có: tên (duy nhất), địa chỉ, giờ mở cửa, giờ đóng cửa. Không thể tạo tòa nhà thiếu thông tin bắt buộc |
| BR-1.2 | Tòa nhà có trạng thái hoạt động  | Trạng thái: `Hoạt động` / `Ngừng hoạt động`. Chỉ tòa nhà "Hoạt động" mới nhận xe gửi                                       |
| BR-1.3 | Không xóa tòa nhà có xe đang gửi | Tòa nhà có parking session đang active không thể bị vô hiệu hóa hoặc xóa                                                   |
| BR-1.4 | Tòa nhà phải có ít nhất 1 tầng   | Tòa nhà mới tạo phải được cấu hình ít nhất 1 tầng/khu vực trước khi hoạt động                                              |

---

## BR-2: Luật nghiệp vụ về Phương tiện & Phân tầng

| Mã     | Luật nghiệp vụ                        | Mô tả chi tiết                                                                                                       |
| ------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| BR-2.1 | Loại xe phải được định nghĩa trước    | Hệ thống chỉ chấp nhận các loại phương tiện đã được Manager định nghĩa. Không nhận xe loại chưa có trong danh mục    |
| BR-2.2 | Mỗi tầng phải được gán loại xe        | Mỗi tầng/khu vực phải được gán ít nhất 1 loại xe được phép đỗ. Tầng chưa gán loại xe không hiển thị cho Staff/Driver |
| BR-2.3 | Xe chỉ được gửi đúng tầng             | Xe chỉ được gửi vào tầng/khu vực cho phép loại xe tương ứng. Gửi sai → tạo ngoại lệ                                  |
| BR-2.4 | Một tầng có thể phục vụ nhiều loại xe | Ví dụ: Tầng B1 phục vụ cả xe máy và xe đạp điện                                                                      |
| BR-2.5 | Không xóa loại xe đang sử dụng        | Loại xe đang được gán cho tầng có xe đang gửi không thể bị xóa                                                       |

---

## BR-3: Luật nghiệp vụ về Slot đỗ xe

| Mã     | Luật nghiệp vụ                        | Mô tả chi tiết                                                                                                                                                                   |
| ------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-3.1 | Mã slot là duy nhất                   | Mã slot phải duy nhất trong phạm vi tòa nhà (VD: B1-A001, B2-C015)                                                                                                               |
| BR-3.2 | Trạng thái slot hợp lệ                | Slot chỉ có 5 trạng thái: `Available`, `Occupied`, `Reserved`, `Maintenance`, `Locked`                                                                                           |
| BR-3.3 | Chuyển trạng thái slot có ràng buộc   | `Occupied` → không thể chuyển sang `Maintenance`/`Locked` khi chưa kết thúc session. `Reserved` → chỉ chuyển sang `Occupied` khi Driver đến hoặc `Available` khi hết hạn giữ chỗ |
| BR-3.4 | Slot Occupied phải có session         | Mỗi slot ở trạng thái `Occupied` phải liên kết với đúng 1 parking session đang active                                                                                            |
| BR-3.5 | Slot Reserved có thời hạn             | Slot giữ chỗ tự động hủy nếu Driver không đến trong thời gian quy định (mặc định: 30 phút)                                                                                       |
| BR-3.6 | Không xóa slot đang Occupied/Reserved | Chỉ xóa slot ở trạng thái `Available`, `Maintenance`, hoặc `Locked`                                                                                                              |

---

## BR-4: Luật nghiệp vụ về Bảng giá & Tính phí

| Mã      | Luật nghiệp vụ                      | Mô tả chi tiết                                                                                                                                                 |
| ------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-4.1  | Mỗi loại xe phải có bảng giá        | Không cho phép tạo lượt gửi cho loại xe chưa có bảng giá active tại tòa nhà tương ứng                                                                          |
| BR-4.2  | Chỉ 1 bảng giá active / tổ hợp      | Mỗi tổ hợp (tòa nhà + loại xe) chỉ có tối đa 1 bảng giá ở trạng thái Active tại một thời điểm                                                                  |
| BR-4.3  | Bảng giá áp dụng theo thời điểm vào | Lượt gửi xe áp dụng bảng giá active tại thời điểm xe VÀO bãi. Thay đổi bảng giá sau đó không ảnh hưởng đến session đang diễn ra                                |
| BR-4.4  | Phí tính theo thời gian thực tế     | Phí = f(thời gian gửi thực tế, loại xe, bảng giá). Hệ thống hỗ trợ các công thức: theo lượt (flat), theo giờ (hourly), theo ngày (daily), theo tháng (monthly) |
| BR-4.5  | Làm tròn thời gian tính phí         | Thời gian gửi được làm tròn lên đơn vị tính phí nhỏ nhất (VD: theo giờ → 1h01 tính 2 giờ)                                                                      |
| BR-4.6  | Phí qua đêm                         | Nếu bảng giá quy định phí qua đêm: xe gửi qua 00:00 sẽ bị tính thêm phí qua đêm                                                                                |
| BR-4.7  | Phí quá giờ                         | Xe gửi quá thời gian tối đa cho phép (nếu quy định) → áp dụng phí phạt quá giờ theo chính sách                                                                 |
| BR-4.8  | Phí mất thẻ                         | Mất thẻ xe → phí cố định theo quy định (VD: 50.000 VND) cộng thêm vào tổng phí gửi xe                                                                          |
| BR-4.9  | Phí không âm                        | Tổng phí gửi xe luôn ≥ 0. Không có trường hợp phí âm                                                                                                           |
| BR-4.10 | Lưu lịch sử bảng giá                | Bảng giá cũ được lưu lịch sử, không xóa vĩnh viễn, phục vụ đối soát và báo cáo                                                                                 |

---

## BR-5: Luật nghiệp vụ về Lượt gửi xe (Parking Session)

| Mã     | Luật nghiệp vụ                             | Mô tả chi tiết                                                                                                                   |
| ------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| BR-5.1 | Mỗi xe chỉ có 1 session active             | Một biển số xe chỉ có tối đa 1 parking session ở trạng thái active tại một thời điểm trong cùng hệ thống                         |
| BR-5.2 | Session phải có thông tin đầy đủ           | Bắt buộc: mã session (tự sinh), biển số xe, loại xe, thời gian vào, cổng vào, Staff tạo                                          |
| BR-5.3 | Thời gian ra ≥ thời gian vào               | Thời gian ra bãi phải sau thời gian vào bãi                                                                                      |
| BR-5.4 | Session phải thanh toán trước khi kết thúc | Session chỉ chuyển sang `Completed` khi đã thanh toán đầy đủ (hoặc được Manager miễn phí)                                        |
| BR-5.5 | Không sửa session đã Completed             | Session ở trạng thái `Completed` không thể bị sửa đổi. Chỉ Manager có quyền tạo bản ghi điều chỉnh (adjustment)                  |
| BR-5.6 | Trạng thái session                         | `Active` (xe đang gửi) → `PendingPayment` (chờ thanh toán) → `Completed` (hoàn tất). Ngoại lệ: `Exception` (đang xử lý ngoại lệ) |
| BR-5.7 | Mã thẻ xe là duy nhất                      | Mỗi mã thẻ xe / QR code chỉ liên kết với 1 session active                                                                        |

---

## BR-6: Luật nghiệp vụ về Đặt chỗ trước (Reservation)

| Mã     | Luật nghiệp vụ              | Mô tả chi tiết                                                                                                               |
| ------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| BR-6.1 | Chỉ đặt chỗ khi còn slot    | Hệ thống chỉ cho phép đặt chỗ khi có slot Available cho loại xe và khung giờ yêu cầu                                         |
| BR-6.2 | Thời gian đặt chỗ tối thiểu | Phải đặt trước ít nhất 30 phút so với thời gian bắt đầu gửi dự kiến                                                          |
| BR-6.3 | Giới hạn reservation / user | Mỗi Driver chỉ có tối đa 2 reservation đang active (chưa sử dụng) tại cùng thời điểm                                         |
| BR-6.4 | Tự động hủy khi quá hạn     | Reservation tự động hủy nếu Driver không đến trong vòng 30 phút kể từ thời gian bắt đầu dự kiến. Slot chuyển lại `Available` |
| BR-6.5 | Chính sách hủy              | Hủy trước ≥ 2 giờ: miễn phí. Hủy trong vòng 2 giờ: có thể áp dụng phí hủy (tùy cấu hình)                                     |
| BR-6.6 | Reservation → Session       | Khi Driver đến, reservation được chuyển thành parking session. Slot chuyển từ `Reserved` → `Occupied`                        |

---

## BR-7: Luật nghiệp vụ về Thanh toán

| Mã     | Luật nghiệp vụ                | Mô tả chi tiết                                                                                                               |
| ------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| BR-7.1 | Thanh toán bắt buộc           | Xe không được ra bãi khi chưa thanh toán đầy đủ (trừ trường hợp Manager miễn phí)                                            |
| BR-7.2 | Phương thức thanh toán hợp lệ | Hệ thống chấp nhận: Tiền mặt, QR Pay/Chuyển khoản, Ví điện tử (nếu tích hợp)                                                 |
| BR-7.3 | Không hoàn tiền tự động       | Sau khi thanh toán thành công, không có hoàn tiền tự động. Hoàn tiền phải qua quy trình Manager duyệt                        |
| BR-7.4 | Ghi nhận thanh toán           | Mỗi giao dịch thanh toán phải ghi: mã giao dịch, session liên quan, số tiền, phương thức, thời gian, Staff thu (nếu tại bãi) |
| BR-7.5 | Đối soát doanh thu            | Tổng doanh thu = Σ các giao dịch thanh toán thành công. Staff chịu trách nhiệm tiền mặt thu trong ca                         |

---

## BR-8: Luật nghiệp vụ về Ngoại lệ

| Mã     | Luật nghiệp vụ                    | Mô tả chi tiết                                                                                                 |
| ------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| BR-8.1 | Ngoại lệ phải được ghi nhận       | Mọi trường hợp ngoại lệ phải tạo bản ghi trong hệ thống kèm: loại, mô tả, Staff xử lý, thời gian               |
| BR-8.2 | Mất thẻ phải xác minh             | Trường hợp mất thẻ: bắt buộc xác minh biển số, loại xe. Có thể yêu cầu giấy tờ tùy thân                        |
| BR-8.3 | Sai biển số phải có Manager duyệt | Biển số thực tế khác biển số trong session → Staff tạo ngoại lệ, Manager quyết định cho phép/từ chối cho xe ra |
| BR-8.4 | Ngoại lệ có trạng thái            | `Mới` → `Đang xử lý` → `Đã giải quyết` / `Từ chối`                                                             |
| BR-8.5 | Phụ phí ngoại lệ                  | Một số ngoại lệ phát sinh phụ phí (mất thẻ, quá giờ) theo chính sách bảng giá                                  |

---

## BR-9: Luật nghiệp vụ về Tài khoản & Phân quyền

| Mã     | Luật nghiệp vụ        | Mô tả chi tiết                                                                                          |
| ------ | --------------------- | ------------------------------------------------------------------------------------------------------- |
| BR-9.1 | Tài khoản duy nhất    | Mỗi email/SĐT chỉ đăng ký 1 tài khoản. Không cho phép trùng                                             |
| BR-9.2 | Vai trò bắt buộc      | Mỗi tài khoản phải có đúng 1 vai trò chính                                                              |
| BR-9.3 | Admin không bị xóa    | Hệ thống luôn có ít nhất 1 tài khoản System Administrator. Không thể xóa/khóa tài khoản Admin cuối cùng |
| BR-9.4 | Staff phải gán bãi xe | Tài khoản Staff phải được gán cho ít nhất 1 tòa nhà/bãi xe cụ thể                                       |
| BR-9.5 | Đổi vai trò phải log  | Mọi thay đổi vai trò/quyền phải được ghi log audit                                                      |
| BR-9.6 | Password policy       | Mật khẩu ≥ 8 ký tự, chứa chữ hoa, chữ thường, số. Đổi mật khẩu lần đầu đăng nhập                        |

---

## BR-10: Luật nghiệp vụ về Báo cáo

| Mã      | Luật nghiệp vụ                                | Mô tả chi tiết                                                                                |
| ------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| BR-10.1 | Dữ liệu báo cáo theo thời gian thực           | Báo cáo tỷ lệ lấp đầy và slot trống phản ánh dữ liệu realtime hoặc gần realtime (≤ 5 phút)    |
| BR-10.2 | Báo cáo doanh thu chỉ tính giao dịch hoàn tất | Doanh thu chỉ bao gồm các giao dịch thanh toán ở trạng thái thành công                        |
| BR-10.3 | Báo cáo có thể xuất file                      | Manager có thể xuất báo cáo ra Excel/PDF                                                      |
| BR-10.4 | Phân quyền xem báo cáo                        | Chỉ Manager và Admin được xem báo cáo. Staff và Driver không có quyền truy cập module báo cáo |

---

## Tổng hợp tham chiếu chéo: Business Rules ↔ Functional Requirements

| Business Rule                  | Functional Requirements liên quan                  |
| ------------------------------ | -------------------------------------------------- |
| BR-1 (Tòa nhà)                 | FR-1.1, FR-1.2, FR-1.3                             |
| BR-2 (Phương tiện & Phân tầng) | FR-2.1, FR-2.2, FR-3.1, FR-8.1                     |
| BR-3 (Slot đỗ xe)              | FR-4.1, FR-4.2, FR-4.3, FR-4.4                     |
| BR-4 (Bảng giá & Tính phí)     | FR-5.1, FR-5.2, FR-5.3, FR-10.2                    |
| BR-5 (Parking Session)         | FR-9.1, FR-10.1, FR-10.2, FR-10.3                  |
| BR-6 (Reservation)             | FR-14.1, FR-14.2                                   |
| BR-7 (Thanh toán)              | FR-10.3, FR-16.1, FR-16.2, FR-16.3                 |
| BR-8 (Ngoại lệ)                | FR-11.1, FR-11.2, FR-11.3, FR-11.4, FR-7.1, FR-7.2 |
| BR-9 (Tài khoản & Phân quyền)  | FR-18.1–FR-18.5, FR-19.1–FR-19.3                   |
| BR-10 (Báo cáo)                | FR-6.1, FR-6.2, FR-6.3, FR-6.4                     |

---

_Kết thúc Phần 4 – Hoàn thành tài liệu SRS_
