import express from 'express';
import dotenv from 'dotenv';
import mainRouter from './routes/index.js';

dotenv.config();    

const app = express();
const PORT = process.env.PORT || 3000;
app.use("/api/v1",mainRouter)


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
