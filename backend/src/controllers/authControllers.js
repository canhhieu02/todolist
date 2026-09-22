import { registerUser, loginUser, getUserById } from "../services/authServices.js";

// Dùng next(error) để đẩy tất cả lỗi lên errorHandler middleware
// Không xử lý lỗi cục bộ trong từng controller — nhất quán và dễ maintain

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userData = await registerUser(name, email, password);
    res.status(201).json(userData);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userData = await loginUser(email, password);
    res.json(userData);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
