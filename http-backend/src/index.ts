import express from 'express';
import dotenv from 'dotenv';
import mainRouter from './routes/index';
import cors from 'cors';

dotenv.config();    

const app = express();

app.use(express.json());
app.use(cors())

app.use("/api/v1",mainRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
