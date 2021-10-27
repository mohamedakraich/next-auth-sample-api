import { ObjectId } from 'mongodb';
import { getDbConnection } from '../../../db';
import { Request, Response } from 'express';
import { DATABASE_NAME } from '../../../utils/constants';
import { generateToken } from '../../../utils/auth';

const verifyEmailHandler = async (req: Request, res: Response) => {
  try {
    const { verificationString } = req.body;

    const db = getDbConnection(DATABASE_NAME);

    const existingUserWithVerifyStr = await db
      .collection('users')
      .findOne({ verificationString });

    if (!existingUserWithVerifyStr) return res.status(401).end();

    const { _id: id, email, info } = existingUserWithVerifyStr;

    await db
      .collection('users')
      .updateOne({ _id: new ObjectId(id) }, { $set: { isVerified: true } });

    const token = await generateToken({ id, email, isVerified: true, info });

    return res.status(200).json({ token });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};
export default verifyEmailHandler;
