# Quản lý học sinh

Hệ thống quản lý lớp học, học sinh, bài học và kiểm tra.

- SUPER_ADMIN: chỉ quản lý tài khoản giáo viên.
- TEACHER: tạo lớp, gửi link lớp, quản lý học sinh thuộc lớp của mình, theo dõi online/thời gian học/kiểm tra.
- STUDENT: vào lớp bằng link giáo viên, nhập họ tên + ngày sinh + lớp; không cần tài khoản/mật khẩu.

Tài khoản SUPER_ADMIN mặc định khi chạy local: `admin` / `leloi@geo2026`. Khi deploy, đặt lại bằng `SUPER_ADMIN_USERNAME` và `SUPER_ADMIN_PASSWORD`.

## Chạy

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```
