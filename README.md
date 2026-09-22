# Todo List App (Advanced MERN Stack)

Ứng dụng **Todo List** giúp bạn quản lý công việc hằng ngày một cách đơn giản, an toàn và hiệu quả. Dự án được xây dựng theo mô hình **Fullstack** (MERN) hoàn chỉnh, tích hợp đầy đủ hệ thống Xác thực Người dùng (Authentication), phân quyền bảo mật, giao diện hiện đại và các tính năng nâng cao.

---

## 🚀 Tính năng chính

### 🔐 Xác thực & Tài khoản
- **Đăng ký / Đăng nhập / Đăng xuất** bảo mật với JWT.
- **Hồ sơ cá nhân**: Cập nhật tên, bio, ảnh đại diện (avatar).
- **Đổi mật khẩu** trực tiếp trong trang Profile.
- **Xuất dữ liệu** toàn bộ task ra file JSON hoặc CSV.
- Bảo vệ API bằng **Rate Limiting** chống Spam/DDoS.

### ✅ Quản lý Công việc
- **Thêm, sửa, xóa, hoàn thành** task với form validation chặt chẽ (React Hook Form + Zod).
- **Phân loại độ ưu tiên**: Cao / Trung bình / Thấp (màu sắc trực quan).
- **Hạn chót (Due Date)**: Cảnh báo khi công việc quá hạn.
- **Gắn nhãn (Tags)** linh hoạt, hỗ trợ tìm kiếm theo tag.
- **Chia nhỏ nhiệm vụ (Subtasks)**: Thêm, hoàn thành, xóa từng subtask.
- **Ghi chú Markdown**: Soạn thảo mô tả task với trình chỉnh sửa hỗ trợ Markdown đầy đủ.
- **Kéo thả (Drag & Drop)** để sắp xếp lại thứ tự công việc.

### 📁 Quản lý Dự án
- Tạo, chỉnh sửa, xóa **Dự án (Projects)** với màu sắc phân biệt.
- Lọc task theo từng dự án qua **Sidebar**.

### 🤝 Cộng tác & Tìm kiếm
- **Chia sẻ task** (Share) với người dùng khác.
- **Bình luận (Comments)** trực tiếp trên từng task.
- **Tìm kiếm nâng cao**: Tìm theo nội dung, tag, mức ưu tiên, dự án, khoảng thời gian.

### 📊 Chế độ xem đa dạng
- **Danh sách (List View)**: Quản lý task với phân trang server-side.
- **Thống kê (Dashboard View)**: Biểu đồ trực quan bằng Recharts.
- **Lịch (Calendar View)**: Xem task theo ngày/tuần/tháng với `react-big-calendar`.

### 🎨 Giao diện & Trải nghiệm
- Glassmorphism UI hiện đại với **TailwindCSS** + **shadcn/ui**.
- **Dark Mode / Light Mode** tự động theo hệ thống.
- Cập nhật dữ liệu **Real-time** đa thiết bị qua **Socket.io**.
- Thông báo mượt mà với **Sonner** Toast.
- **PWA (Progressive Web App)**: Cài đặt như ứng dụng độc lập trên điện thoại/máy tính.

---

## 🏗 Kiến trúc & Hiệu năng

- **Frontend State Management (TanStack Query)**:
  - Cache dữ liệu trên RAM, giảm thiểu tối đa request dư thừa khi chuyển Tab.
  - `placeholderData` giữ lại data cũ khi chuyển trang — không nhấp nháy.
  - Invalidate cache real-time qua Socket.io khi có thay đổi từ thiết bị khác.
- **Backend Layered Architecture**:
  - Tuân thủ chặt chẽ mô hình **Controller → Service → Model**.
  - Tách biệt hoàn toàn luồng xử lý Data (Service) khỏi luồng điều khiển Web (Controller).
- **Background Jobs**:
  - `node-cron` + `nodemailer` để gửi email nhắc nhở task sắp đến hạn tự động.
- **Bảo mật & Tối ưu**:
  - Mật khẩu mã hoá Hash với `bcryptjs`.
  - Tối ưu bundle bằng cấu hình Chunking của Vite.

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: ReactJS 19 (Vite)
- **State Management**: TanStack Query (React Query) & Context API
- **Form & Validation**: React Hook Form + `@hookform/resolvers` + Zod
- **Styling & UI**: TailwindCSS 4, `shadcn/ui`, `lucide-react`, Glassmorphism UI
- **Components mở rộng**:
  - `@hello-pangea/dnd` — Kéo thả task
  - `react-big-calendar` & `date-fns` — Quản lý lịch
  - `recharts` — Vẽ biểu đồ thống kê
  - `react-markdown` & `remark-gfm` — Hiển thị & soạn thảo Markdown
  - `sonner` — Toast notifications
  - `cmdk` — Command UI component
- **API Call**: Axios
- **Routing**: React Router v7
- **Khác**: `vite-plugin-pwa` (PWA)

### Backend
- **Core**: NodeJS & ExpressJS (Layered Architecture)
- **Database**: MongoDB & Mongoose
- **Bảo mật**: `jsonwebtoken` (JWT), `bcryptjs`, `cors`, `express-rate-limit`
- **Real-time**: Socket.io
- **Tiện ích**: `node-cron` (Lập lịch tác vụ), `nodemailer` (Gửi email)

---

## ⚙️ Cài đặt & Chạy dự án

### 1️⃣ Clone repository

```bash
git clone <repository-url>
cd todolist
```

Chạy toàn bộ dự án từ thư mục gốc:

```bash
npm run build   # Cài dependencies cho cả backend & frontend, build frontend
npm run start   # Khởi chạy backend server (serve cả frontend đã build)
```

> **Lưu ý**: Để phát triển (development), hãy chạy riêng từng phần như hướng dẫn bên dưới.

---

### 2️⃣ Cài đặt Backend

Tạo file `backend/.env`:

```env
PORT=5001
MONGODB=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

```bash
cd backend
npm install
npm run dev
```

Backend chạy tại: `http://localhost:5001`

---

### 3️⃣ Cài đặt Frontend

Tạo file `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

---

## 📡 API Reference

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/register` | Tạo tài khoản mới |
| `POST` | `/login` | Đăng nhập, nhận JWT Token |
| `GET` | `/me` | Lấy thông tin user hiện tại |

### 👤 Profile (`/api/profile`) — Cần JWT
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/` | Lấy thông tin hồ sơ |
| `PUT` | `/` | Cập nhật tên, bio, avatar, tuỳ chọn email |
| `PUT` | `/password` | Đổi mật khẩu |
| `GET` | `/export?format=json\|csv` | Xuất toàn bộ task ra file |

### 📝 Tasks (`/api/tasks`) — Cần JWT
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/` | Lấy danh sách task (hỗ trợ filter, phân trang) |
| `POST` | `/` | Tạo task mới |
| `PUT` | `/:id` | Cập nhật task |
| `DELETE` | `/:id` | Xóa task |
| `PUT` | `/reorder` | Sắp xếp lại thứ tự (kéo thả) |
| `POST` | `/:id/subtasks` | Thêm subtask |
| `PATCH` | `/:id/subtasks/:subId/toggle` | Hoàn thành / bỏ hoàn thành subtask |
| `DELETE` | `/:id/subtasks/:subId` | Xóa subtask |

### 📁 Projects (`/api/projects`) — Cần JWT
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/` | Lấy danh sách dự án |
| `POST` | `/` | Tạo dự án mới |
| `PUT` | `/:id` | Cập nhật dự án |
| `DELETE` | `/:id` | Xóa dự án |

### 🤝 Collaboration (`/api/collaboration`) — Cần JWT
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/search` | Tìm kiếm nâng cao (query, tag, priority, date...) |
| `GET` | `/shared` | Lấy task được chia sẻ với mình |
| `POST` | `/tasks/:id/share` | Chia sẻ task với user khác |
| `DELETE` | `/tasks/:id/share/:userId` | Hủy chia sẻ |
| `GET` | `/tasks/:id/comments` | Lấy danh sách bình luận |
| `POST` | `/tasks/:id/comments` | Thêm bình luận |
| `DELETE` | `/comments/:commentId` | Xóa bình luận |

---

## 🌟 Hướng phát triển tiếp theo

- Thông báo đẩy (Push Notifications) trên trình duyệt.
- Tính năng đếm ngược **Pomodoro / Tập trung**.
- Tích hợp **AI** (OpenAI / Gemini) để gợi ý phân rã công việc hoặc tự động tạo nội dung Markdown.
- Quên mật khẩu qua **Email OTP**.

---

## 👨‍💻 Tác giả

- **Nguyễn Cảnh Hiếu**


