import express from "express";
import cors from "cors";
import helmet from "helmet";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js';

import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";
import adminAuthRouter from './routes/admin/adminAuthRoutes.js';
import adminRouter from './routes/admin/adminRoutes.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = [process.env.CLIENT_URL];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(helmet());

// API Endpoints
app.get('/', (req, res) => res.send("API is working fine"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin', adminRouter);

app.listen(port, () => console.log(`Server started on PORT: ${port}`));
