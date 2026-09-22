const errorHandler = (err, req, res, next) => {
  // Log chi tiết nhưng không lộ stack trace ra response
  const statusCode = err.status || err.statusCode || 500;
  
  if (statusCode >= 500) {
    // Chỉ log stack trace cho lỗi server thực sự (không log 404, 401, 400 của user)
    console.error(`[${new Date().toISOString()}] Server Error ${statusCode}:`, err.stack || err.message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "ID không hợp lệ." });
  }

  // MongoDB duplicate key error (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({ message: `Giá trị ${field} đã tồn tại.` });
  }

  // Business logic errors từ services ({ status, message })
  // hoặc Express errors (statusCode, message)
  res.status(statusCode).json({
    message: err.message || "Lỗi hệ thống.",
  });
};

export default errorHandler;
