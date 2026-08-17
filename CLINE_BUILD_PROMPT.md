# CLINE — QUẢN LÝ HỌC SINH: BUILD + GITHUB + RENDER + POSTGRESQL

Mục tiêu: biến project hiện tại thành website production "Quản lý học sinh", chạy Internet, source ở GitHub Private và deploy trên Render.

## Mô hình quyền

SUPER_ADMIN:
- Chỉ quản lý giáo viên.
- Tạo/sửa/khóa/mở tài khoản giáo viên.
- Không quản lý lớp/học sinh/kết quả.
- Tài khoản bootstrap hiện có: `admin` / `admin@123456`.
- Production ưu tiên `SUPER_ADMIN_USERNAME` và `SUPER_ADMIN_PASSWORD`; password phải được hash, không gửi ra frontend.

TEACHER:
- Đăng nhập bằng tài khoản do SUPER_ADMIN cấp.
- Chỉ quản lý lớp do chính mình tạo.
- Tạo lớp và link tham gia lớp.
- Quản lý học sinh trong lớp của mình.
- Xem online/offline, last seen, thời gian học, thời gian kiểm tra, kết quả.
- Không truy cập dữ liệu của giáo viên khác.

STUDENT:
- Không cần tài khoản/mật khẩu.
- Vào bằng link lớp của giáo viên.
- Nhập họ tên + ngày sinh + lớp để vào lớp.
- Tạo student session.
- Chỉ xem/làm nội dung và kết quả của chính mình.

## Phiên góc phải
Luôn hiển thị người đang dùng:
- Student: tên + lớp + giáo viên + Đăng xuất.
- Teacher: tên + vai trò + Đăng xuất.
- Admin: tài khoản + SUPER_ADMIN + Đăng xuất.
Khi chưa đăng nhập: nút Đăng nhập.

## Theo dõi học sinh
- heartbeat khoảng 30 giây.
- online/offline và last_seen.
- learning sessions và exam sessions.
- duration phải tính ở backend, không tin duration do frontend gửi.

## PostgreSQL — bắt buộc cho production
Không để dữ liệu quan trọng trong RAM hoặc filesystem của Render.

Dùng `DATABASE_URL`.

Tạo migration/schema cho tối thiểu:
- teachers
- classes
- students
- student_sessions
- learning_sessions
- exam_sessions
- và các bảng hiện có của project nếu cần.

Quan hệ:
teacher -> classes -> students
student -> sessions/learning/exam

Teacher chỉ được truy cập class có `teacher_id` của mình.
Student không được tự chọn class_id để vượt quyền; class phải xác định từ join link.

`GET /api/health` phải kiểm tra cả server và database; database lỗi trả HTTP 503.

## Bảo mật
- Không commit `.env`, secrets, passwords, API keys, `node_modules`.
- Tạo/cập nhật `.env.example`.
- Không hard-code production secrets.
- Không tin role từ frontend.
- API phải kiểm tra role + ownership ở backend.
- Student sai quyền -> 403; chưa xác thực -> 401.

## Build local
Chạy:
1. `npm install`
2. `npm run lint`
3. `npm run build`
4. chạy app local và test các flow chính.
Nếu lỗi thì tự sửa và chạy lại. Không báo hoàn thành khi build còn lỗi.

## GitHub
- GitHub repository phải là Private.
- Không push secrets.
- Nếu chưa có remote, DỪNG và yêu cầu tôi cung cấp URL repo GitHub; không tự đoán.
- Sau khi có URL:
  `git remote add origin <URL>`
  `git branch -M main`
  `git add .`
  `git commit -m "Production: Quản lý học sinh"`
  `git push -u origin main`
- Nếu GitHub yêu cầu đăng nhập/2FA, DỪNG để tôi thực hiện.

## Render
Chuẩn bị project để deploy:
- Build command đúng theo project, thường `npm run build`.
- Start command đúng theo project, thường `npm start`.
- Bind `0.0.0.0`.
- Dùng `process.env.PORT`.
- Có thể tạo `render.yaml`, nhưng tuyệt đối không ghi secret thật.
- Cần Render Web Service + PostgreSQL.
- Web Service nhận `DATABASE_URL` từ PostgreSQL.
- Không dùng localhost cho production DB.

Environment tối thiểu:
- NODE_ENV=production
- DATABASE_URL= (Render cung cấp)
- SUPER_ADMIN_USERNAME=
- SUPER_ADMIN_PASSWORD=
- các secret/API/OAuth hiện có của project nếu project sử dụng.

Nếu cần Google OAuth, callback phải dùng domain production; không dùng localhost.

Nếu Render/GitHub yêu cầu đăng nhập hoặc thao tác trên UI mà Cline không thể tự làm, DỪNG đúng bước đó và yêu cầu tôi đăng nhập/thao tác; sau đó tiếp tục.

## Test production
Sau deploy kiểm tra:
- `/api/health`
- admin login
- tạo/khóa giáo viên
- teacher login
- teacher tạo lớp/link
- student vào link
- student login bằng tên + DOB + lớp
- session góc phải + logout
- heartbeat/online/offline
- learning time
- exam time
- teacher chỉ thấy dữ liệu của mình
- student không gọi được admin API
- restart Web Service và xác nhận dữ liệu vẫn còn trong PostgreSQL.

Cuối cùng báo cáo:
- GitHub URL
- Website URL
- Admin username
- nơi cấu hình admin password
- Build/Start command
- Database/migrations
- Environment variables cần nhập
- file đã thay đổi
- lỗi đã sửa
- test đã chạy

KHÔNG dừng giữa chừng trừ khi cần tôi:
- đăng nhập GitHub
- đăng nhập Render
- cung cấp GitHub repository URL
- cung cấp secret/credential chỉ tôi biết.


## Bootstrap data reset — IMPORTANT
Before production deployment, ensure there are NO pre-existing teacher accounts or teacher demo records in the seed/demo data.

The only initial privileged account is:
- username: admin
- password: admin@123456

Do not create demo teachers automatically.
Do not seed demo students/classes unless explicitly required for development.
If a local/dev database is initialized, teachers must start empty.

For production, `SUPER_ADMIN_USERNAME` and `SUPER_ADMIN_PASSWORD` take precedence over source defaults.
