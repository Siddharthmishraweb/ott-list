import express from 'express';
import mongoose from 'mongoose';
import listRoutes from './routes/listRoutes';

const app = express();

app.use(express.json());

mongoose.connect('mongodb+srv://mishrasiddharth1999:Reenter2@cluster0.drc2anz.mongodb.net/ott?retryWrites=true&w=majority&appName=Cluster0', {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

app.use('/api', listRoutes);

export default app;
