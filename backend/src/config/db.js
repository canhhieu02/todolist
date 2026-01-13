import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log("kết nối Database thành công");

    } catch (error) {
        console.error("Kết nối thất bại!:", error);
        process.exit(1); // thoát với trọng thái thất bại
    }
}