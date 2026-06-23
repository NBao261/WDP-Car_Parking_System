import { test, expect } from '@playwright/test';

const MOCK_FACILITY_ID = 'mock-facility-123';

test.describe('Booking Registration (Đăng ký Đặt Chỗ)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API facilities and pricing
    await page.route('**/api/v1/public/facilities', async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: [
            {
              _id: MOCK_FACILITY_ID,
              name: 'Bãi Xe Test',
              address: '123 Test Street'
            }
          ]
        }
      });
    });

    await page.route(`**/api/v1/public/facilities/${MOCK_FACILITY_ID}/pricing`, async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: [
            {
              _id: 'plan1',
              vehicleTypeId: { _id: 'vt-moto', name: 'Xe Máy' },
              firstBlockHours: 1,
              rates: [{ label: 'Block đầu', amount: 5000, unit: 'VNĐ' }],
              overtimeFeePerHour: 2000,
              maxDailyFee: 20000
            },
            {
              _id: 'plan2',
              vehicleTypeId: { _id: 'vt-car', name: 'Ô tô' },
              firstBlockHours: 1,
              rates: [{ label: 'Block đầu', amount: 20000, unit: 'VNĐ' }],
              overtimeFeePerHour: 10000,
              maxDailyFee: 100000
            }
          ]
        }
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: 'u1', name: 'Test Driver', email: 'driver@test.com', role: 'driver', assignedFacilities: [] },
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          isAuthenticated: true
        },
        version: 0
      }));
    });

    await page.goto(`/driver/book/${MOCK_FACILITY_ID}`);
  });

  test('TC_UI_01: Kiểm tra trạng thái Default', async ({ page }) => {
    // Nút Xe máy chọn sẵn
    const motoBtn = page.locator('text="Xe Máy"').locator('..');
    await expect(motoBtn).toHaveClass(/border-brand/);

    // Thời gian 'Trong 30p' chọn sẵn
    const timeBtn = page.getByRole('button', { name: 'Trong 30p' });
    await expect(timeBtn).toHaveClass(/bg-brand/); 

    // Biển số trống, có placeholder
    const input = page.getByTestId('license-plate-input');
    await expect(input).toBeEmpty();
    await expect(input).toHaveAttribute('placeholder', 'VD: 51H-12345');

    // Nút Xác nhận disabled
    const submitBtn = page.getByTestId('submit-booking-btn');
    await expect(submitBtn).toBeDisabled();
  });

  test('TC_UI_02: Biển số tự động viết hoa (Auto-uppercase)', async ({ page }) => {
    const input = page.getByTestId('license-plate-input');
    await input.fill('51h-12345');
    await expect(input).toHaveValue('51H-12345');
  });

  test('TC_UI_03: Realtime Update Bảng giá', async ({ page }) => {
    const submitBtn = page.getByTestId('submit-booking-btn');
    // Mặc định là Xe máy -> 5.000đ
    await expect(page.locator('text="5.000đ"').first()).toBeVisible();
    await expect(submitBtn).toContainText('5.000đ');

    // Click chọn Ô tô
    const carBtn = page.locator('text="Ô tô"').locator('..');
    await carBtn.click();
    
    // Giá đổi thành 20.000đ
    await expect(page.locator('text="20.000đ"').first()).toBeVisible();
    await expect(submitBtn).toContainText('20.000đ');
  });

  test('TC_FUNC_01: Đặt chỗ Happy Path', async ({ page }) => {
    // Mock POST reservation
    await page.route('**/api/v1/reservations', async route => {
      await route.fulfill({
        status: 201,
        json: {
          success: true,
          data: { ticketId: 'TICKET-123' }
        }
      });
    });

    const input = page.getByTestId('license-plate-input');
    await input.fill('59A-12345');

    const submitBtn = page.getByTestId('submit-booking-btn');
    await expect(submitBtn).toBeEnabled();
    
    await submitBtn.click();

    // Toast success
    await expect(page.locator('text="Đặt chỗ thành công!"').first()).toBeVisible();
  });

  test('TC_VAL_01: Validation sai định dạng biển số', async ({ page }) => {
    const input = page.getByTestId('license-plate-input');
    await input.fill('ABC'); // Độ dài < 5, không đúng định dạng
    await input.blur();
    
    const submitBtn = page.getByTestId('submit-booking-btn');
    
    // Chú ý: Theo Test Case thì ô nhập biển số nếu gõ sai sẽ báo lỗi viền đỏ và disable nút. 
    // Nếu source code hiện tại chưa xử lý logic validation regex này thì test case này có thể fail.
    await expect(submitBtn).toBeDisabled();
  });

  test('TC_ERR_01: Xử lý lỗi API (Hết chỗ)', async ({ page }) => {
    // Mock POST reservation error
    await page.route('**/api/v1/reservations', async route => {
      await route.fulfill({
        status: 400,
        json: {
          success: false,
          message: 'Rất tiếc, bãi xe đã hết chỗ trống'
        }
      });
    });

    const input = page.getByTestId('license-plate-input');
    await input.fill('59A-12345');

    const submitBtn = page.getByTestId('submit-booking-btn');
    await submitBtn.click();

    // Toast error
    await expect(page.locator('text="Rất tiếc, bãi xe đã hết chỗ trống"').first()).toBeVisible();
  });
});
