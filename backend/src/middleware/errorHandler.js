const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "ID không hợp lệ." });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Lỗi hệ thống.",
  });
};

export default errorHandler;
