# Todo List App (Advanced MERN Stack)

Ứng dụng **Todo List** giúp bạn quản lý công việc hằng ngày một cách đơn giản, an toàn và hiệu quả. Dự án được xây dựng theo mô hình **Fullstack** (MERN) hoàn chỉnh, được tích hợp đầy đủ hệ thống Xác thực Người dùng (Authentication), phân quyền bảo mật, giao diện hiện đại và các tính năng nâng cao.

---

## 🚀 Tính năng chính

- **Xác thực người dùng (Authentication)**: Đăng ký, Đăng nhập, Đăng xuất sử dụng bảo mật JWT. Bảo vệ API bằng Rate Limiting để chống Spam/DDoS.
- **Tài khoản cá nhân hóa**: Mỗi người dùng có một không gian quản lý công việc riêng biệt, dữ liệu được bảo mật hoàn toàn.
- **Quản lý công việc nâng cao**: Thêm, sửa, xoá, đánh dấu hoàn thành, gắn nhãn (Tags), chia nhỏ nhiệm vụ (Subtasks).
- **Phân loại độ ưu tiên & Hẹn giờ**: Gắn nhãn Đỏ (Cao) / Vàng (Trung bình) / Xanh (Thấp). Đặt hạn chót cho công việc.
- **Tính năng Kéo thả (Drag & Drop)**: Tự do sắp xếp thứ tự công việc một cách trực quan.
- **Giao diện Command Menu (Cmd + K)**: Tìm kiếm và thao tác nhanh chóng bằng bàn phím.
- **Xác thực dữ liệu (Form Validation) chặt chẽ**: Hiển thị lỗi trực tiếp (real-time) với React Hook Form & Zod.
- **Chế độ xem đa dạng**: 
  - Xem danh sách (List View).
  - Xem thống kê (Dashboard View) bằng biểu đồ Recharts.
  - Xem lịch (Calendar View) trực quan sử dụng `react-big-calendar`.
- **Giao diện hiện đại (UI/UX)**: 
  - Sử dụng TailwindCSS kết hợp các component của `shadcn/ui` mang phong cách Glassmorphism mượt mà.
  - Hỗ trợ Chế độ màn hình tối (Dark Mode).
  - Thông báo mượt mà với `sonner`.
  - Hỗ trợ hiển thị Markdown cho ghi chú (`react-markdown`).
- **Hỗ trợ PWA (Progressive Web App)**: Có thể cài đặt như một ứng dụng độc lập trên điện thoại/máy tính.

---

## 🏗 Kiến trúc & Hiệu năng

- **Frontend State Management (TanStack Query)**:
  - Cache dữ liệu trên RAM, giảm thiểu tối đa các request dư thừa khi chuyển Tab.
  - Quản lý trạng thái Global an toàn.
  - Cập nhật dữ liệu Real-time đa thiết bị qua Socket.io.
- **Backend Layered Architecture**:
  - Tuân thủ chặt chẽ mô hình **Controller - Service - Model**.
  - Tách biệt hoàn toàn luồng xử lý Data (Service) khỏi luồng điều khiển Web (Controller).
- **Tính năng ngầm (Background Jobs)**:
  - Sử dụng `node-cron` kết hợp `nodemailer` để thực hiện các tác vụ tự động như gửi email thông báo.
- **Bảo mật & Tối ưu**:
  - Mật khẩu mã hoá Hash thông qua `bcryptjs`.
  - Tối ưu đóng gói Build bằng cấu hình chia nhỏ (Chunking) của Vite.

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: ReactJS 19 (Vite)
- **State Management**: TanStack Query (React Query) & Context API.
- **Form & Validation**: React Hook Form, Zod.
- **Styling & UI**: TailwindCSS 4, `shadcn/ui`, `lucide-react`, Glassmorphism UI.
- **Components mở rộng**: 
  - `@hello-pangea/dnd` (Kéo thả)
  - `react-big-calendar` & `date-fns` (Quản lý lịch)
  - `recharts` (Vẽ biểu đồ thống kê)
  - `cmdk` (Command menu)
  - `sonner` (Toast notifications)
  - `react-markdown` (Hiển thị văn bản Markdown)
- **API Call**: Axios.
- **Routing**: React Router v7.
- **Khác**: `vite-plugin-pwa` (PWA).

### Backend
- **Core**: NodeJS & ExpressJS (Layered Architecture).
- **Database**: MongoDB & Mongoose.
- **Bảo mật**: `jsonwebtoken` (JWT), `bcryptjs`, `cors`, `express-rate-limit` (Chống Spam API).
- **Real-time**: Socket.io.
- **Tiện ích**: `node-cron` (Lập lịch tác vụ), `nodemailer` (Gửi email).

---

## ⚙️ Cài đặt & Chạy dự án

### 1️⃣ Clone repository & Cài đặt chung

```bash
git clone <repository-url>
cd TODOX
```

Bạn có thể chạy toàn bộ dự án từ thư mục gốc nhờ script có sẵn:

```bash
npm run build # Cài đặt dependencies cho cả backend, frontend và build frontend
npm run start # Khởi chạy backend server
```

*(Lưu ý: Để phát triển (development), hãy chạy riêng biệt từng frontend và backend như hướng dẫn bên dưới)*

### 2️⃣ Cài đặt Backend

Cần tạo file `backend/.env` với các nội dung sau:
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

Cần tạo file `frontend/.env` (nếu có các cấu hình biến môi trường tương ứng).

```bash
cd frontend
npm install
npm run dev
```
Frontend chạy tại: `http://localhost:5173` (hoặc cổng khác tuỳ cấu hình Vite).

---

## 📡 API Tham khảo

### 🔑 Authentication (`/api/auth`)
- `POST /register`: Tạo tài khoản mới.
- `POST /login`: Đăng nhập lấy JWT Token.
- `GET /me`: Lấy thông tin user hiện tại.

### 📝 Tasks (`/api/tasks`) - Cần JWT Token ở Header
- `GET /`: Lấy danh sách task của User.
- `POST /`: Tạo mới task.
- `PUT /:id`: Cập nhật task.
- `DELETE /:id`: Xoá task.

*(Còn nhiều API khác phục vụ quản lý dự án, thống kê...)*

---

## 🌟 Hướng phát triển tiếp theo

- Hoàn thiện tính năng Quản lý tài khoản (Đổi mật khẩu, quên mật khẩu qua Email OTP).
- Mở rộng hệ thống Nhắc nhở công việc qua Thông báo đẩy (Push Notifications) trên trình duyệt và Email tự động.
- Phát triển Tính năng đếm ngược Pomodoro / Tập trung.
- Tích hợp AI (Sử dụng API của OpenAI hoặc Gemini) để gợi ý phân rã công việc hoặc tạo nội dung Markdown tự động.

---

## 👨‍💻 Tác giả

- **Nguyễn Cảnh Hiếu**
