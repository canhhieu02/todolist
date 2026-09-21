# Todo List App (Advanced MERN Stack)

Ứng dụng **Todo List** giúp bạn quản lý công việc hằng ngày một cách đơn giản, an toàn và hiệu quả. Dự án được xây dựng theo mô hình **Fullstack** (MERN) hoàn chỉnh, được tích hợp đầy đủ hệ thống Xác thực Người dùng (Authentication) và phân quyền bảo mật.

---

## 🚀 Tính năng chính

- **Xác thực người dùng (Authentication)**: Đăng ký, Đăng nhập, Đăng xuất sử dụng bảo mật JWT.
- **Tài khoản cá nhân hóa**: Mỗi người dùng có một không gian quản lý công việc riêng biệt, không ai có thể xâm phạm dữ liệu của người khác.
- **Quản lý công việc nâng cao**: Thêm, sửa, xoá, đánh dấu hoàn thành, gắn nhãn (Tags), chia nhỏ nhiệm vụ (Subtasks).
- **Phân loại độ ưu tiên & Hẹn giờ**: Gắn nhãn Đỏ (Cao) / Vàng (Trung bình) / Xanh (Thấp). Cảnh báo quá hạn.
- **Tính năng Kéo thả (Drag & Drop)**: Tự do sắp xếp thứ tự công việc một cách trực quan.
- **Xác thực dữ liệu (Form Validation) chặt chẽ**: Hiển thị lỗi trực tiếp (real-time) với React Hook Form & Zod.
- **Chế độ xem đa dạng**: 
  - Xem danh sách (List View).
  - Xem thống kê (Dashboard View) bằng biểu đồ Recharts.
  - Xem lịch (Calendar View) trực quan sử dụng `react-big-calendar`.
- **Giao diện hiện đại (UI/UX)**: 
  - Sử dụng TailwindCSS kết hợp các component của `shadcn/ui` mang phong cách Glassmorphism mượt mà.
  - Hỗ trợ Chế độ màn hình tối (Dark Mode) chuẩn chỉ.
  - Tích hợp hiệu ứng Skeleton Loading và Animation.

---

## 🏗 Kiến trúc & Hiệu năng

- **Frontend State Management (TanStack Query)**:
  - Cache dữ liệu trên RAM, giảm thiểu tối đa các request dư thừa khi chuyển Tab.
  - Quản lý trạng thái Global an toàn.
  - Socket.io cập nhật dữ liệu Real-time đa thiết bị.
- **Backend Layered Architecture**:
  - Tuân thủ chặt chẽ mô hình **Controller - Service - Model**.
  - Tách biệt hoàn toàn luồng xử lý Data (Service) khỏi luồng điều khiển Web (Controller).
- **Bảo mật & Tối ưu**:
  - Mật khẩu mã hoá Hash thông qua `bcryptjs`.
  - Tối ưu đóng gói Build bằng cấu hình chia nhỏ (Chunking) của Vite.
  - Codebase sạch hoàn toàn (0 ESLint Errors).

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **ReactJS 19** (Vite)
- **State Management**: TanStack Query (React Query) & Context API.
- **Form & Validation**: React Hook Form, Zod.
- **Styling & UI**: TailwindCSS, `shadcn/ui`, `lucide-react`, Glassmorphism UI.
- **Thư viện mở rộng**: `@hello-pangea/dnd` (Kéo thả), `react-big-calendar`, `date-fns`, `recharts` (Biểu đồ).
- **API Call**: Axios.
- **Routing**: React Router v7.

### Backend
- **NodeJS** & **ExpressJS** (Layered Architecture).
- **Database**: MongoDB & Mongoose.
- **Bảo mật**: `jsonwebtoken` (JWT), `bcryptjs`, `cors`.
- **Real-time**: Socket.io.

---

## ⚙️ Cài đặt & Chạy dự án

### 1️⃣ Clone repository

```bash
git clone https://github.com/your-username/todo-app.git
cd TODOX
```

### 2️⃣ Cài đặt Backend

Cần tạo file `backend/.env` với các nội dung sau:
```env
PORT=5001
MONGODB=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

```bash
cd backend
npm install
npm run dev
```
Backend chạy tại: `http://localhost:5001`

---

### 3️⃣ Cài đặt Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend chạy tại: `http://localhost:5173` (hoặc `5174` tuỳ cấu hình).

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

---

## 🌟 Hướng phát triển tiếp theo

- Quản lý tài khoản (Đổi mật khẩu, quên mật khẩu qua Email OTP).
- Nhắc nhở công việc qua Thông báo đẩy (Push Notifications) trên trình duyệt.
- Tính năng đếm ngược Pomodoro / Tập trung.

---

## 👨‍💻 Tác giả

- **Nguyễn Cảnh Hiếu**
