import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { getDbConnection } from '../../../db';
import { Request, Response } from 'express';
import { DATABASE_NAME } from '../../../utils/constants';

const verifyEmailHandler = async (req: Request, res: Response) => {
  const { verificationString } = req.body;
  console.log(verificationString);

  const db = getDbConnection(DATABASE_NAME);
  const result = await db.collection('users').findOne({ verificationString });

  console.log(result);

  if (!result) return res.sendStatus(401);

  const { _id: id, email, info } = result;

  await db
    .collection('users')
    .updateOne({ _id: new ObjectId(id) }, { $set: { isVerified: true } });

  jwt.sign(
    { id, email, isVerified: true, info },
    process.env.JWT_SECRET || '',
    { expiresIn: '2d' },
    (err, token) => {
      if (err) {
        return res.sendStatus(500);
      }

      res.status(200).json({ token });
    }
  );
};
export default verifyEmailHandler;
