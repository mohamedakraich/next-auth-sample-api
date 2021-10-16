import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId, ReturnDocument } from 'mongodb';
import { getDbConnection } from '../../../db';
import { InfoType } from '../../../types/InfoType';
import { JwtType } from '../../../types/JwtType';

const updateUserInfoHandler = async (req: Request, res: Response) => {
  const { authorization } = req.headers;
  const { userId } = req.params;

  if (!authorization) {
    return res.sendStatus(401);
  }

  const updates = (({ favoriteFood, hairColor, bio }) => ({
    favoriteFood,
    hairColor,
    bio,
  }))(req.body);

  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET || '', async (err, decoded) => {
    if (err) return res.sendStatus(401);

    const { id, isVerified } = decoded as JwtType;

    if (id !== userId) return res.sendStatus(403);
    if (!isVerified) return res.sendStatus(403);

    const options = { returnNewDocument: true };

    const db = getDbConnection('next-auth-sample');
    const result = await db
      .collection('users')
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { info: updates } },
        { returnDocument: ReturnDocument.AFTER }
      );

    const { email, info } = result.value as { email: string; info: InfoType };

    jwt.sign(
      { id, email, isVerified, info },
      process.env.JWT_SECRET || '',
      { expiresIn: '2d' },
      (err, token) => {
        if (err) {
          return res.sendStatus(500);
        }

        res.status(200).json({ token });
      }
    );
  });
};

export default updateUserInfoHandler;
