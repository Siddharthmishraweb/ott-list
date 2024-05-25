import express from 'express';
import mongoose from 'mongoose';
import listRoutes from './routes/listRoutes';
import dbConnect from './utils/dbConnect';

const app = express();

app.use(express.json());

dbConnect();

app.use('/api', listRoutes);

export default app;
