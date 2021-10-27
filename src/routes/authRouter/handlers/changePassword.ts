import { Request, Response } from 'express';

import { getDbConnection } from '../../../db';
import { JwtType } from '../../../types/JwtType';
import { hashPassword, verifyPassword, verifyToken } from '../../../utils/auth';
import { DATABASE_NAME } from '../../../utils/constants';

const changePasswordHandler = async (req: Request, res: Response) => {
  const { authorization } = req.headers;
  const { userId } = req.params;

  if (!authorization) {
    return res.status(401).end();
  }
  const token = authorization.split(' ')[1];

  try {
    const decodedToken = await verifyToken(token);
    const { id, isVerified } = decodedToken as JwtType;
    if (id !== userId) return res.status(403).end();
    if (!isVerified) return res.status(403).end();

    const { email, newPassword, oldPassword } = req.body;
    const db = getDbConnection(DATABASE_NAME);
    const user = await db.collection('users').findOne({
      email,
    });
    if (!user) {
      // close database
      return res.status(404).json({ message: 'User not found!' });
    }
    const passwordsEqual = await verifyPassword(oldPassword, user.password);
    if (!passwordsEqual) {
      // close database
      return res.status(403).json({ message: 'Invalid Password' });
    }
    const newPasswordHash = await hashPassword(newPassword);
    const result = await db
      .collection('users')
      .updateOne({ email }, { $set: { password: newPasswordHash } });
    // Close the database
    return res.status(200).json({ message: 'Password Updated' });
  } catch (err) {
    return res.sendStatus(401);
  }
};

export default changePasswordHandler;
