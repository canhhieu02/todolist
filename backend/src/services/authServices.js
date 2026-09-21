import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "30d",
  });
};

export const registerUser = async (name, email, password) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw { status: 400, message: "Email này đã được sử dụng" };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
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
  const user = await User.findOne({ email });

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
