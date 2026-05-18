PHẦN 2B: YÊU CẦU CHỨC NĂNG – PARKING STAFF**

**Phiên bản:** 1.0 | **Ngày:** 13/05/2026

## **FR-8: Xử lý xe vào bãi**

### **FR-8.1: Kiểm tra điều kiện xe vào bãi**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-8.1 |
| **Actor** | Parking Staff |
| **Mô tả** | Kiểm tra xe có đủ điều kiện vào bãi hay không trước khi cho phép vào |
| **Điều kiện tiên quyết** | Staff đã đăng nhập, đã được gán ca trực và cổng làm việc |
| **Các điều kiện kiểm tra** | (1) Loại xe có được bãi phục vụ không; (2) Còn slot trống cho loại xe này không; (3) Bãi xe có đang trong giờ hoạt động không; (4) Xe có đang trong danh sách cấm/blacklist không |
| **Luồng chính** | 1\. Staff chọn cổng vào → 2\. Chọn loại xe → 3\. Hệ thống kiểm tra tự động → 4\. Hiển thị kết quả: ĐỦ ĐIỀU KIỆN / KHÔNG ĐỦ ĐIỀU KIỆN |
| **Luồng ngoại lệ** | Hết slot → Thông báo "Bãi đầy cho loại xe \[X\]"; Ngoài giờ → Thông báo "Bãi xe đang đóng" |
| **Kết quả** | Xác nhận xe đủ/không đủ điều kiện vào bãi |

### **FR-8.2: Nhập / Quét biển số xe**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-8.2 |
| **Actor** | Parking Staff |
| **Mô tả** | Ghi nhận biển số xe khi vào bãi bằng cách nhập tay hoặc quét camera |
| **Dữ liệu đầu vào** | Biển số xe (nhập tay hoặc quét tự động qua camera/OCR) |
| **Luồng chính** | 1\. Staff nhập biển số hoặc chọn "Quét biển số" → 2\. Hệ thống nhận diện/xác nhận biển số → 3\. Hiển thị biển số để Staff xác nhận |
| **Luồng ngoại lệ** | OCR không nhận diện được → Staff nhập tay; Biển số trùng với xe đang gửi → Cảnh báo |
| **Kết quả** | Biển số xe được ghi nhận chính xác |

### **FR-8.3: Hướng dẫn xe vào đúng tầng / khu vực**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-8.3 |
| **Actor** | Parking Staff |
| **Mô tả** | Hệ thống gợi ý tầng/khu vực phù hợp dựa trên loại xe và slot còn trống |
| **Luồng chính** | 1\. Sau khi xác nhận loại xe → 2\. Hệ thống hiển thị danh sách tầng/khu vực có slot trống → 3\. Staff chọn hoặc hệ thống tự gán tầng/khu vực → 4\. Thông tin hiển thị trên thẻ xe/vé xe |
| **Kết quả** | Driver được hướng dẫn đến đúng khu vực đỗ xe |

## **FR-9: Tạo lượt gửi xe (Parking Session)**

### **FR-9.1: Tạo parking session mới**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-9.1 |
| **Actor** | Parking Staff |
| **Mô tả** | Tạo một lượt gửi xe mới khi xe vào bãi |
| **Điều kiện tiên quyết** | Xe đã qua kiểm tra điều kiện (FR-8.1), biển số đã được ghi nhận (FR-8.2) |
| **Dữ liệu ghi nhận** | Mã lượt gửi (tự sinh), biển số xe, loại xe, thời gian vào (timestamp), cổng vào, tầng/khu vực gợi ý, mã thẻ xe/QR code, Staff tạo lượt gửi |
| **Luồng chính** | 1\. Hệ thống tổng hợp thông tin từ FR-8 → 2\. Staff xác nhận tạo lượt gửi → 3\. Hệ thống tạo session \+ sinh mã thẻ xe/QR → 4\. In thẻ xe / hiển thị QR cho Driver → 5\. Cập nhật slot tương ứng sang "Occupied" |
| **Kết quả** | Parking session được tạo; thẻ xe/QR được cấp; slot được đánh dấu "Đang sử dụng" |

### **FR-9.2: Xem danh sách lượt gửi đang hoạt động**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-9.2 |
| **Actor** | Parking Staff |
| **Mô tả** | Xem danh sách tất cả các lượt gửi xe đang hoạt động (xe chưa ra) |
| **Bộ lọc** | Biển số, loại xe, tầng/khu vực, thời gian vào, cổng vào |
| **Hiển thị** | Mã lượt gửi, biển số, loại xe, giờ vào, thời gian gửi tạm tính, khu vực, phí tạm tính |

## **FR-10: Xử lý xe ra bãi**

### **FR-10.1: Tìm lượt gửi xe**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-10.1 |
| **Actor** | Parking Staff |
| **Mô tả** | Tìm parking session của xe đang muốn ra bãi |
| **Cách tìm** | (1) Quét/nhập mã thẻ xe/QR; (2) Nhập/quét biển số xe; (3) Tìm theo mã lượt gửi |
| **Luồng chính** | 1\. Staff quét thẻ/nhập biển số → 2\. Hệ thống tìm session tương ứng → 3\. Hiển thị thông tin lượt gửi |
| **Luồng ngoại lệ** | Không tìm thấy session → Chuyển sang xử lý ngoại lệ (FR-11) |
| **Kết quả** | Hiển thị chi tiết parking session: biển số, loại xe, giờ vào, khu vực, thời gian gửi |

### **FR-10.2: Xác nhận thời gian ra và tính phí**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-10.2 |
| **Actor** | Parking Staff |
| **Mô tả** | Xác nhận thời gian xe ra bãi, hệ thống tự động tính phí dựa trên bảng giá áp dụng |
| **Dữ liệu tính phí** | Thời gian vào, thời gian ra, loại xe, bảng giá áp dụng, phụ phí (nếu có: qua đêm, quá giờ…) |
| **Luồng chính** | 1\. Hệ thống ghi nhận thời gian ra → 2\. Tính phí tự động theo bảng giá → 3\. Hiển thị chi tiết phí cho Staff xác nhận |
| **Hiển thị** | Tổng thời gian gửi, đơn giá áp dụng, phụ phí, tổng phí cần thanh toán |

### **FR-10.3: Thu phí gửi xe**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-10.3 |
| **Actor** | Parking Staff |
| **Mô tả** | Thu phí từ Driver và hoàn tất lượt gửi xe |
| **Phương thức thanh toán** | Tiền mặt, chuyển khoản/QR Pay, ví điện tử (nếu tích hợp) |
| **Luồng chính** | 1\. Staff chọn phương thức thanh toán → 2\. Nhận tiền/xác nhận thanh toán → 3\. Hệ thống cập nhật session sang "Completed" → 4\. Cập nhật slot sang "Available" → 5\. In biên lai (tùy chọn) |
| **Kết quả** | Lượt gửi xe kết thúc; slot được giải phóng; doanh thu được ghi nhận |

## **FR-11: Xử lý trường hợp ngoại lệ**

### **FR-11.1: Xử lý mất thẻ xe**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-11.1 |
| **Actor** | Parking Staff |
| **Mô tả** | Xử lý khi Driver báo mất thẻ xe / mã gửi xe |
| **Luồng chính** | 1\. Driver báo mất thẻ → 2\. Staff tìm session theo biển số xe → 3\. Xác minh thông tin (biển số, loại xe, thời gian vào ước tính) → 4\. Tạo bản ghi ngoại lệ loại "Mất thẻ" → 5\. Tính phí (có thể áp dụng phụ phí mất thẻ) → 6\. Thu phí và kết thúc session |
| **Dữ liệu ghi nhận** | Loại ngoại lệ, mô tả, giấy tờ xác minh (nếu có), Staff xử lý, thời gian xử lý |

### **FR-11.2: Xử lý sai thông tin xe**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-11.2 |
| **Actor** | Parking Staff |
| **Mô tả** | Xử lý khi biển số xe thực tế không khớp với biển số trong session |
| **Luồng chính** | 1\. Staff phát hiện sai lệch → 2\. Tạo bản ghi ngoại lệ loại "Sai biển số" → 3\. Xác minh bổ sung (giấy tờ xe, CMND/CCCD) → 4\. Cập nhật biển số đúng hoặc từ chối cho xe ra → 5\. Ghi chú lý do |

### **FR-11.3: Xử lý xe quá hạn gửi**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-11.3 |
| **Actor** | Parking Staff |
| **Mô tả** | Xử lý xe gửi quá thời gian quy định (nếu bãi có giới hạn thời gian tối đa) |
| **Luồng chính** | 1\. Hệ thống tự động phát hiện session quá hạn → 2\. Đánh dấu cảnh báo → 3\. Staff tạo bản ghi ngoại lệ → 4\. Áp dụng phụ phí quá hạn theo chính sách → 5\. Thông báo cho Manager (nếu cần) |

### **FR-11.4: Xử lý xe gửi sai khu vực**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-11.4 |
| **Actor** | Parking Staff |
| **Mô tả** | Xử lý khi xe đỗ sai tầng/khu vực so với hướng dẫn |
| **Luồng chính** | 1\. Staff phát hiện xe sai khu vực → 2\. Tạo bản ghi ngoại lệ → 3\. Cập nhật vị trí thực tế của xe trong session → 4\. Cập nhật trạng thái slot (giải phóng slot cũ, đánh dấu slot thực tế) |

### **FR-11.5: Cập nhật trạng thái slot (giới hạn)**

| Thuộc tính | Mô tả |
| :---- | :---- |
| **Mã** | FR-11.5 |
| **Actor** | Parking Staff |
| **Mô tả** | Staff có thể cập nhật trạng thái slot trong phạm vi giới hạn |
| **Quyền cho phép** | Chuyển slot sang "Maintenance" khi phát hiện hư hỏng; Báo cáo slot bất thường lên Manager |
| **Quyền KHÔNG cho phép** | Xóa slot, tạo slot mới, thay đổi loại xe của slot |