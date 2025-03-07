// routes/userRoutes.js
import express from 'express';
import { searchRoutes } from '../controllers/searchController.js';

const Router = express.Router();

Router.get('/routes', searchRoutes);

export default Router;
