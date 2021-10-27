import { Request, Response } from 'express';
import { getDbConnection } from '../../../db';
import { generateToken, verifyPassword } from '../../../utils/auth';
import { DATABASE_NAME } from '../../../utils/constants';

const logInHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const db = getDbConnection(DATABASE_NAME);
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'No user found!' });
    }

    const { _id: id, isVerified, passwordHash, info } = user;

    const isCorrect = await verifyPassword(password, passwordHash);

    if (isCorrect) {
      const token = await generateToken({ id, isVerified, email, info });
      return res.status(200).send({ token });
    } else {
      res.status(401).json({ message: 'Could not log you in!' });
    }
  } catch (e) {
    console.error(e);
  }
};

export default logInHandler;
