import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Regex kiểm tra định dạng email hợp lệ
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const generateToken = (id, email) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET chưa được cấu hình trong .env");
  }
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerUser = async (name, email, password) => {
  // ── Validate đầu vào ────────────────────────────────────────────────────
  if (!name?.trim() || !email?.trim() || !password) {
    throw { status: 400, message: "Vui lòng nhập đầy đủ thông tin" };
  }

  if (name.trim().length > 100) {
    throw { status: 400, message: "Tên không được vượt quá 100 ký tự" };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    throw { status: 400, message: "Định dạng email không hợp lệ" };
  }

  if (password.length < 6) {
    throw { status: 400, message: "Mật khẩu phải có ít nhất 6 ký tự" };
  }

  if (password.length > 128) {
    throw { status: 400, message: "Mật khẩu không được vượt quá 128 ký tự" };
  }

  // ── Kiểm tra email trùng ────────────────────────────────────────────────
  const userExists = await User.findOne({ email: email.trim().toLowerCase() });
  if (userExists) {
    throw { status: 400, message: "Email này đã được sử dụng" };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
  });

  if (user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id, user.email),
    };
  } else {
    throw { status: 400, message: "Dữ liệu người dùng không hợp lệ" };
  }
};

export const loginUser = async (email, password) => {
  if (!email?.trim() || !password) {
    throw { status: 400, message: "Vui lòng nhập email và mật khẩu" };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    throw { status: 400, message: "Định dạng email không hợp lệ" };
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (user && (await bcrypt.compare(password, user.password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id, user.email),
    };
  } else {
    throw { status: 401, message: "Email hoặc mật khẩu không đúng" };
  }
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw { status: 404, message: "Không tìm thấy người dùng" };
  }
  return user;
};
