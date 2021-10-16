import express from 'express';
import authRouter from './routes/authRouter';

import { initializeDbConnection } from './db';

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());

app.use(authRouter);

initializeDbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});
