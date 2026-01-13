# Todo List App

Ứng dụng **Todo List** giúp bạn quản lý công việc hằng ngày một cách đơn giản và hiệu quả. Dự án được xây dựng theo mô hình **Fullstack** với ReactJS cho frontend và NodeJS (Express) cho backend.

---

## Tính năng chính

- Thêm công việc mới
- Chỉnh sửa công việc
- Xóa công việc
- Đánh dấu hoàn thành / chưa hoàn thành
- Tìm kiếm & lọc công việc (tuỳ chọn)
- Lưu trữ dữ liệu bằng Database

---

## Công nghệ sử dụng

### Frontend
- ReactJS
- Hooks (useState, useEffect)
- Axios / Fetch API
- CSS / TailwindCSS

### Backend
- NodeJS
- ExpressJS
- MongoDB (hoặc JSON / Memory)

---


---

## Cài đặt & Chạy dự án

### 1️⃣ Clone repository

```bash
git clone https://github.com/your-username/todo-app.git
cd TODOX
```

### 2️⃣ Cài đặt Backend

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
npm start
```

Frontend chạy tại: `http://localhost:5173`

---

## API mẫu

### Lấy danh sách công việc
```
GET /api/tasks
```

### Thêm công việc
```
POST /api/tasks
{
  "title": "Learn React"
}
```

---

## Demo & Testing

- Test API bằng Postman / cURL
- Kiểm tra UI trên trình duyệt

---

## Hướng phát triển tiếp theo

- Authentication (Login / Register)
- User riêng cho mỗi tài khoản
- Thống kê công việ

---

## Tác giả

- **Nguyễn Cảnh Hiếu**

---


