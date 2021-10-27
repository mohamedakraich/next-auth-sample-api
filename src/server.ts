import express from 'express';
import morgan from 'morgan';

import authRouter from './routes/authRouter';

import { initializeDbConnection } from './db';

const PORT = process.env.PORT || 8080;

export const app = express();

app.disable('x-powered-by');

//app.use(cors());
app.use(express.json()); // No need to use body-parser anymore
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(authRouter);

initializeDbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});

export const start = () => {
  /*app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
  });*/
};
