# Quản lý học sinh — triển khai

1. Giải nén và mở đúng thư mục chứa `package.json` bằng VS Code.
2. Mở Cline.
3. Yêu cầu Cline đọc `CLINE_BUILD_PROMPT.md` và thực hiện toàn bộ.
4. Khi Cline hỏi GitHub URL, tạo repository **Private** và đưa URL.
5. Khi Cline yêu cầu đăng nhập GitHub/Render, tự đăng nhập.
6. Tạo Render PostgreSQL và nối `DATABASE_URL` vào Web Service.
7. Đặt `SUPER_ADMIN_USERNAME` và `SUPER_ADMIN_PASSWORD` trong Render Environment.
8. Sau deploy kiểm tra `/api/health`, đăng nhập admin, tạo giáo viên, tạo lớp và test học sinh.

Bootstrap development account trong source: `admin` / `admin@123456`.
Đổi ngay password khi triển khai production.


## Initial data
- Teacher list must start empty.
- Do not seed demo teachers.
- Initial admin: `admin` / `admin@123456`.
- For production, set `SUPER_ADMIN_USERNAME` and `SUPER_ADMIN_PASSWORD` in Render Environment Variables.
