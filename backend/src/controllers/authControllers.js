import { registerUser, loginUser, getUserById } from "../services/authServices.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const userData = await registerUser(name, email, password);
    res.status(201).json(userData);
  } catch (error) {
    console.error("Lỗi register:", error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const userData = await loginUser(email, password);
    res.json(userData);
  } catch (error) {
    console.error("Lỗi login:", error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error("Lỗi getMe:", error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
