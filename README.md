# Todo List App (Advanced MERN Stack)

Ứng dụng **Todo List** giúp bạn quản lý công việc hằng ngày một cách đơn giản, an toàn và hiệu quả. Dự án được xây dựng theo mô hình **Fullstack** (MERN) hoàn chỉnh, được tích hợp đầy đủ hệ thống Xác thực Người dùng (Authentication) và phân quyền bảo mật.

---

## 🚀 Tính năng chính

- **Xác thực người dùng (Authentication)**: Đăng ký, Đăng nhập, Đăng xuất sử dụng bảo mật JWT.
- **Tài khoản cá nhân hóa**: Mỗi người dùng có một không gian quản lý công việc riêng biệt, không ai có thể xâm phạm dữ liệu của người khác.
- **Quản lý công việc nâng cao**: Thêm, sửa, xoá, đánh dấu hoàn thành, gắn nhãn (Tags), chia nhỏ nhiệm vụ (Subtasks).
- **Phân loại độ ưu tiên**: Gắn nhãn Đỏ (Cao) / Vàng (Trung bình) / Xanh (Thấp).
- **Chế độ xem đa dạng**: 
  - Xem danh sách (List View).
  - Xem lịch (Calendar View) trực quan sử dụng `react-big-calendar`.
- **Giao diện hiện đại (UI/UX)**: 
  - Sử dụng TailwindCSS kết hợp các component của `shadcn/ui` mang phong cách mượt mà, Glassmorphism cao cấp.
  - Hỗ trợ Chế độ màn hình tối (Dark Mode) chuẩn chỉ.
  - Hiệu ứng Skeleton Loading khi tải dữ liệu.
- **Bảo mật & Tối ưu Backend**:
  - Mật khẩu được mã hoá (hashing) qua `bcryptjs`.
  - Có cơ chế xử lý lỗi (Error Handler) tập trung.
  - Chặn CORS bảo mật.

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **ReactJS 19** (Vite)
- **State Management**: React Context API & Hooks.
- **Styling**: TailwindCSS, `shadcn/ui`, `lucide-react`, Glassmorphism UI.
- **Thư viện mở rộng**: `react-big-calendar`, `date-fns` (Xử lý ngày tháng và Lịch).
- **API Call**: Axios (với Interceptors tự động đính kèm Token).
- **Routing**: React Router v7.

### Backend
- **NodeJS** & **ExpressJS**
- **Database**: MongoDB & Mongoose.
- **Bảo mật**: `jsonwebtoken` (JWT), `bcryptjs`, `cors`.

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

- Tính năng kéo thả (Drag & Drop) để sắp xếp công việc tự do.
- Quản lý trạng thái (State Management) bằng TanStack Query (React Query) thay cho useEffect thuần.
- Refactor Backend theo kiến trúc Layered Architecture (Controller-Service-Repository).
- Tính năng đếm ngược Pomodoro / Tập trung.
- Nhắc nhở qua Email hoặc Thông báo đẩy (Push Notifications).

---

## 👨‍💻 Tác giả

- **Nguyễn Cảnh Hiếu**
