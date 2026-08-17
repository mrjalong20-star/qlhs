# HƯỚNG DẪN DEPLOY — QUẢN LÝ HỌC SINH

Project đã build thành công và sẵn sàng deploy. File ZIP: `Desktop\quanlyhocsinh1.zip`

Nguồn code sẵn sàng đẩy lên GitHub rồi triển khai lên Render.

---

## PHẦN 1 — PUSH LÊN GITHUB (tự thao tác)

### ⚠️ QUAN TRỌNG — CẤU TRÚC THƯ MỤC ĐÚNG

Render build lỗi `Failed to resolve /src/main.tsx from .../src/index.html` là do **các file bị đẩy lên nằm trong thư mục `src/`** (lồng thêm 1 cấp). Cấu trúc repo trên GitHub **PHẢI** như sau:

```
quanlyhocsinh2/            ← repo root
├── index.html             ← ở root (KHÔNG nằm trong src/)
├── package.json           ← ở root
├── server.ts              ← ở root
├── vite.config.ts         ← ở root
├── tsconfig.json          ← ở root
├── render.yaml            ← ở root
├── .env.example           ← ở root
├── .gitignore             ← ở root
├── README.md              ← ở root
├── assets/                ← thư mục
└── src/                   ← thư mục (chứa code React)
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    └── components/
```

**SAI (gây lỗi build):** các file `index.html`, `package.json`, `server.ts` bị đặt trong `src/`:
```
quanlyhocsinh2/
└── src/                    ← SAI: lồng thêm 1 cấp
    ├── index.html
    ├── package.json
    ├── server.ts
    └── src/
        └── main.tsx
```

### 1. Tạo GitHub repository (Private)

1. Truy cập https://github.com/new (đã đăng nhập)
2. **Repository name:** `quanlyhocsinh`
3. Chọn **Private**
4. **Không** tạo README/.gitignore mới (tránh xung đột)
5. Bấm **Create repository**

### 2. Upload code lên GitHub

Có 2 cách:

**Cách A — GitHub Desktop (dễ nhất nếu đã cài):**
1. Mở GitHub Desktop → File → Clone repository → chọn repo vừa tạo (hoặc Add existing repository)
2. Giải nén `quanlyhocsinh1.zip` vào thư mục repo (đảm bảo `index.html`, `package.json` nằm ở root, không nằm trong `src/`)
3. Commit "Production: Quản lý học sinh" → Push origin

**Cách B — Upload qua trình duyệt (không cần Git):**
1. Trong repo trên GitHub, bấm **Add file → Upload files**
2. Giải nén `quanlyhocsinh1.zip` ra thư mục
3. Kéo-thả tất cả file **vào root của repo** (CẨN THẬN loại 3 thư mục: `node_modules`, `dist`, `.git`)
4. Chỉ upload: `src/`, `assets/`, `server.ts`, `package.json`, `package-lock.json`, `render.yaml`, `.env.example`, `.gitignore`, `index.html`, `vite.config.ts`, `tsconfig.json`, `README.md`, `metadata.json`, `bun.lock`
5. **KHÔNG** tạo thư mục `src` bên ngoài để bỏ các file vào — `index.html`, `package.json`, `server.ts` phải nằm ngay root

### 3. Sửa nếu đã đẩy sai cấu trúc (đang lỗi build)

Nếu repo hiện tại đang có cấu trúc lồng `src/` (gây lỗi), sửa như sau:
1. Vào repo trên GitHub → mở thư mục `src/` bên ngoài
2. Xóa các file trùng: `index.html`, `package.json`, `server.ts`, `vite.config.ts`, `tsconfig.json`, `render.yaml`, `.env.example`, `.gitignore`, `README.md`, `metadata.json`, `bun.lock`, `package-lock.json` (nếu chúng nằm trong `src/`)
3. Upload lại các file đó **vào root** của repo
4. Đảm bảo chỉ có **một** thư mục `src/` (chứa `main.tsx`, `App.tsx`, `components/`...)
5. Render sẽ tự build lại khi có commit mới

---

## PHẦN 2 — TẠO WEB SERVICE + DATABASE TRÊN RENDER

### Bước 1: Tạo PostgreSQL (nội dung được tạo tự động qua render.yaml hoặc thủ công)

**Nếu dùng Blueprint `render.yaml`:** Khi kết nối repo, Render tự nhận và tạo cả Web Service + PostgreSQL.

**Thủ công:**

1. Dashboard Render → **New → PostgreSQL**
2. Đặt tên (VD: `quanlyhocsinh-db`), chọn Free plan → **Create Database**
3. Chờ database active, copy **Internal Connection String** (chuỗi `postgres://...`)

### Bước 2: Tạo Web Service

1. Dashboard Render → **New → Web Service**
2. Chọn **Build and deploy from a Git repository** → chọn repo `quanlyhocsinh`
3. Render sẽ nhận diện `render.yaml` (nếu push file này) và tự cấu hình; nếu không, nhập tay:
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - Chọn **Free** plan
4. **Add a Database** → chọn PostgreSQL đã tạo (Render tự link `DATABASE_URL`)

### Bước 3: Set Environment Variables

Trong Web Service → **Environment** → thêm:

| Key | Giá trị |
|---|---|
| `NODE_ENV` | `production` |
| `SUPER_ADMIN_USERNAME` | `admin` |
| `SUPER_ADMIN_PASSWORD` | *(password mạnh bạn tự đặt)* |
| `GEMINI_API_KEY` | *(để trống nếu không dùng)* |
| `GOOGLE_APPS_SCRIPT_URL` | *(để trống nếu không dùng)* |
| `DATABASE_URL` | Render tự điền khi link PostgreSQL |

> `DATABASE_URL` sẽ là chuỗi nội bộ của Render PostgreSQL, không để localhost.

### Bước 4: Deploy

1. Bấm **Create Web Service**
2. Render chạy build (~1-3 phút Free plan) rồi tự deploy
3. Deploy xong có URL dạng `https://quanlyhocsinh.onrender.com`

---

## PHẦN 3 — KIỂM TRA SAU DEPLOY

Mở URL web service và kiểm tra lần lượt:

- `https://<tên>.onrender.com/api/health` → `{"status":"ok"}`
- Đăng nhập admin: `admin` / `SUPER_ADMIN_PASSWORD` bạn đã đặt
- Tạo giáo viên → đăng nhập giáo viên
- Tạo lớp → lấy link tham gia
- Học sinh mở link → nhập tên + ngày sinh → vào lớp
- Kiểm tra presence/online/heartbeat
- Thao tác logout

### Lưu ý quan trọng
- **Không commit `.env` thật** — chỉ có `.env.example` được commit OK
- Mật khẩu `SUPER_ADMIN_PASSWORD` chỉ bạn biết, cấu hình trong Render Environment
- Dữ liệu (giáo viên/lớp/học sinh) hiện lưu **trong RAM** của Web Service. Nếu restart Web Service sẽ mất. Để bền vững bắt buộc dùng PostgreSQL trong `server.ts` (bước nâng cấp tiếp theo).

---

## TÓM TẮT THÔNG TIN GIAO

| Mục | Giá trị |
|---|---|
| ZIP source | `C:\Users\Administrator\Desktop\quanlyhocsinh1.zip` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` (chạy `node dist/server.cjs`) |
| Port bind | `0.0.0.0` + `process.env.PORT` |
| Bootstrap admin (mặc định) | `admin` / `admin@123456` |
| Nơi đặt admin password production | Render Environment → `SUPER_ADMIN_PASSWORD` |
| Health check | `/api/health` |
| Blueprint | `render.yaml` (Web + PostgreSQL) |