import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './Routes/index';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use('/', router);

app.get('/', (req, res) => {
  res.send('Welcome!');
});

app.listen(port, () => {
  console.log(`Server Running on: ${port}`);
});

export default app;
