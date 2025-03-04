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
import adminBusRouteRouter from './routes/admin/adminBusRouteRoutes.js';
import operatorAuthRouter from './routes/operator/operatorAuthRoutes.js';
import operatorRouter from './routes/operator/operatorRoutes.js';
import operatorBusRouter from './routes/operator/operatorBusRoutes.js';
import operatorBusRouteRouter from './routes/operator/operatorBusRouteRoutes.js';
import operatorBusScheduleRouter from './routes/operator/operatorBusScheduleRoutes.js';

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
app.use('/api/admin/routes', adminBusRouteRouter);
app.use('/api/operator/auth', operatorAuthRouter);
app.use('/api/operator', operatorRouter);
app.use('/api/operator/bus', operatorBusRouter);
app.use('/api/operator/routes', operatorBusRouteRouter);
app.use('/api/operator/schedules', operatorBusScheduleRouter);

app.listen(port, () => console.log(`Server started on PORT: ${port}`));
