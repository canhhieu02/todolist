import nodemailer from "nodemailer";

/**
 * Tạo transporter email từ config .env
 * Hỗ trợ: Gmail, SMTP bất kỳ
 */
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("⚠️ EMAIL_USER hoặc EMAIL_PASS chưa được cấu hình — Email reminders bị tắt");
        return null;
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Gmail App Password (không phải password thường)
        },
    });
};

/**
 * Gửi email nhắc nhở deadline sắp đến
 */
export const sendReminderEmail = async ({ toEmail, toName, taskTitle, dueDate }) => {
    const transporter = createTransporter();
    if (!transporter) return false;

    const formattedDate = new Date(dueDate).toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📅 Nhắc Nhở Deadline</h1>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #475569; font-size: 16px; margin: 0 0 16px;">Xin chào <strong>${toName}</strong>,</p>
        <p style="color: #475569; font-size: 16px; margin: 0 0 24px;">Nhiệm vụ sau sắp đến hạn trong <strong>24 giờ tới</strong>:</p>
        <div style="background: white; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px 20px; margin: 0 0 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 8px;">${taskTitle}</p>
          <p style="font-size: 14px; color: #64748b; margin: 0;">⏰ Deadline: ${formattedDate}</p>
        </div>
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" 
           style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Xem ngay →
        </a>
      </div>
      <div style="padding: 16px 24px; background: #f1f5f9; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Bạn nhận email này vì đã bật thông báo trong TodoList App.</p>
      </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"TodoList App 📋" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `⏰ Nhắc nhở: "${taskTitle}" sắp đến hạn!`,
            html,
        });
        return true;
    } catch (error) {
        console.error("❌ Lỗi gửi email:", error.message);
        return false;
    }
};
