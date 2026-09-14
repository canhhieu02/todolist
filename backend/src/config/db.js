import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB, {
            serverSelectionTimeoutMS: 10000, // timeout sau 10 giây nếu không tìm được server
            socketTimeoutMS: 45000, // timeout socket sau 45 giây
            maxPoolSize: 10, // tối đa 10 kết nối đồng thời
            retryWrites: true,
        });
        console.log("kết nối Database thành công");

    } catch (error) {
        console.error("Kết nối thất bại!:", error);
        process.exit(1); // thoát với trạng thái thất bại
    }
}