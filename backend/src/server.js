import express from 'express';
import {connectDB} from './config/db.js';
import taskRoute from './routes/tasksRouters.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const POST = process.env.POST || 5001

const app = express();

app.use(express.json());
app.use(cors({origin : "http://localhost:5173"}))

app.use("/api/tasks", taskRoute)

connectDB().then(() => {
    app.listen(POST, () => {
        console.log('server bắt đầu trên cổng 5001');
    });
});
