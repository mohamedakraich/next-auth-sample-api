import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getDbConnection } from '../../../db';
import { DATABASE_NAME } from '../../../utils/constants';

const logInHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const db = getDbConnection(DATABASE_NAME);
  const user = await db.collection('users').findOne({ email });

  if (!user) {
    return res.sendStatus(401);
  }

  const { _id: id, isVerified, passwordHash, info } = user;

  const isCorrect = await bcrypt.compare(password, passwordHash);

  if (isCorrect) {
    jwt.sign(
      { id, isVerified, email, info },
      process.env.JWT_SECRET || '',
      { expiresIn: '2d' },
      (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }

        res.status(200).send({ token });
      }
    );
  } else {
    res.sendStatus(401);
  }
};

export default logInHandler;
