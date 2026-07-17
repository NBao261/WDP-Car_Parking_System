import { test, expect } from '@playwright/test';

test.describe('Active Parking (Đang Gửi) Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Inject mock authentication state to bypass login screen
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: 'mock-driver', name: 'Test Driver', email: 'driver@test.com', role: 'driver', assignedFacilities: [] },
          token: 'mock-token',
          isAuthenticated: true
        },
        version: 0
      }));
    });
  });

  test('UI-01: Hiển thị Empty State khi không có xe', async ({ page }) => {
    // 1. Mock API trả về danh sách rỗng (Không có chuyến xe nào)
    await page.route('**/api/v1/sessions/my-sessions', async route => {
      const json = { success: true, data: [] };
      await route.fulfill({ json });
    });

    // 2. Đi tới trang Bảng điều khiển (Active Parking)
    await page.goto('/driver/dashboard');

    // 3. Kiểm tra các thành phần của Empty State xuất hiện
    await expect(page.getByText('Chưa có chuyến đỗ xe nào!')).toBeVisible();
    await expect(page.getByText('Bạn chưa gửi chiếc xe nào tại hệ thống')).toBeVisible();
    
    const findButton = page.getByRole('button', { name: 'Tìm Bãi Xe Ngay' });
    await expect(findButton).toBeVisible();
    
    // 4. Kiểm tra điều hướng khi click nút CTA
    await findButton.click();
    await expect(page).toHaveURL(/.*facilities/);
  });

  test('ACT-01 & ACT-02: Hiển thị xe tức thì và đếm giờ (Live Timer)', async ({ page }) => {
    // 1. Cài đặt thời gian Check-in là đúng 10 giây trước
    const checkInTime = new Date(Date.now() - 10000).toISOString();
    
    // 2. Mock API trả về 1 xe đang gửi
    await page.route('**/api/v1/sessions/my-sessions', async route => {
      const json = { 
        success: true, 
        data: [{
          _id: 'session_mock_123',
          code: 'PK-VIP999',
          licensePlate: '51G99999',
          status: 'active',
          checkInTime: checkInTime,
          totalFee: 25000,
          gateIn: 'Cổng Số 1 (VIP)',
          facilityId: { name: 'Vincom Landmark 81' }
        }] 
      };
      await route.fulfill({ json });
    });

    await page.goto('/driver/dashboard');

    // 3. Kiểm tra Header và Trạng thái Thẻ xe
    await expect(page.getByText('ĐANG GỬI XE')).toBeVisible();
    await expect(page.getByText('PK-VIP999')).toBeVisible();
    
    // 4. Kiểm tra Biển số xe được render đúng format
    await expect(page.getByText('51G')).toBeVisible();
    await expect(page.getByText('99999')).toBeVisible(); 
    
    // 5. Kiểm tra Vị trí bãi đỗ
    await expect(page.getByText('Vincom Landmark 81')).toBeVisible();
    await expect(page.getByText('Cổng Số 1 (VIP)')).toBeVisible();
    
    // 6. Kiểm tra Live Cost (Ước tính phí) có format đúng tiền tệ không
    await expect(page.getByText('Ước Tính Phí')).toBeVisible();
    await expect(page.getByText('25.000')).toBeVisible();

    // 7. Kiểm tra sự tồn tại của Live Timer
    await expect(page.getByText('Thời Gian Đã Đỗ')).toBeVisible();
    // Do Playwright chạy cực nhanh, ta có thể assert số 10 (10 giây) hoặc 11 xuất hiện
    const timerContainer = page.locator('.tabular-nums').first();
    await expect(timerContainer).toBeVisible();
  });

  test('ACT-05: Chuyển đổi trạng thái khi xe Check-out thành công', async ({ page }) => {
    // Bước 1: Mock có xe đang đỗ
    await page.route('**/api/v1/sessions/my-sessions', async route => {
      const json = { 
        success: true, 
        data: [{
          _id: 'session_mock_777',
          status: 'active',
          checkInTime: new Date().toISOString(),
          totalFee: 50000,
          code: 'PK-DONE777'
        }] 
      };
      await route.fulfill({ json });
    });

    await page.goto('/driver/dashboard');
    await expect(page.getByText('PK-DONE777')).toBeVisible();

    // Bước 2: Giả lập user (hoặc WebSocket) update dữ liệu thành rỗng (Check-out)
    await page.route('**/api/v1/sessions/my-sessions', async route => {
      const json = { success: true, data: [] };
      await route.fulfill({ json });
    });

    // Bước 3: Reload trang để trigger fetch lại (Mô phỏng thay cho trigger event socket nội bộ)
    await page.reload();
    
    // Bước 4: Kiểm tra xe đã biến mất và Empty State quay trở lại
    await expect(page.getByText('PK-DONE777')).not.toBeVisible();
    await expect(page.getByText('Chưa có chuyến đỗ xe nào!')).toBeVisible();
  });
});
