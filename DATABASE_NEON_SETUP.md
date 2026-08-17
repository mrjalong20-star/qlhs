# Database online miễn phí: Neon PostgreSQL + Vercel

Dự án này dùng PostgreSQL qua biến `DATABASE_URL`. Neon có Free Plan và tích hợp trực tiếp với Vercel.

## 1. Tạo database

Trong Vercel: Project → Storage/Marketplace → Neon → Add/Connect.

Sau khi kết nối, Vercel sẽ cung cấp biến môi trường database. Nếu dùng Neon trực tiếp, lấy connection string PostgreSQL và đặt tên biến là `DATABASE_URL`.

## 2. Environment Variables

Trong Vercel → Project → Settings → Environment Variables:

- `DATABASE_URL` = connection string PostgreSQL
- `SUPER_ADMIN_USERNAME` = tài khoản quản trị
- `SUPER_ADMIN_PASSWORD` = mật khẩu quản trị

Chọn Production (và Preview nếu muốn).

## 3. Deploy lại

Sau khi lưu biến môi trường, Redeploy project. Ứng dụng tự tạo các bảng:

- `app_teachers`
- `app_classes`
- `app_submissions`
- `app_presence`
- `app_sessions`

Không cần chạy SQL thủ công.

## 4. Kiểm tra

Mở:

`https://TEN-MIEN.vercel.app/api/health`

Kết quả đúng sẽ có:

`{"status":"ok","database":"postgres"...}`

Nếu hiện `database: memory`, `DATABASE_URL` chưa được cấu hình.
