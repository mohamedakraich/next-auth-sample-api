import { Request, Response } from 'express';
import { getDbConnection } from '../../../db';
import { hashPassword, verifyPassword } from '../../../utils/auth';
import { DATABASE_NAME } from '../../../utils/constants';

const changePasswordHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    console.log(req.currentUser?.isVerified);

    if (
      !req.currentUser ||
      req.currentUser.id !== userId ||
      !req.currentUser.isVerified
    ) {
      res.status(403).end();
    }

    const { email, newPassword, oldPassword } = req.body;
    const db = getDbConnection(DATABASE_NAME);
    const user = await db.collection('users').findOne({
      email,
    });

    if (!user) {
      // close database
      return res.status(404).json({ message: 'User not found!' });
    }

    const passwordsEqual = await verifyPassword(oldPassword, user.passwordHash);
    if (!passwordsEqual) {
      // close database
      return res.status(403).json({ message: 'Invalid Password' });
    }
    const newPasswordHash = await hashPassword(newPassword);
    await db
      .collection('users')
      .updateOne({ email }, { $set: { passwordHash: newPasswordHash } });
    // Close the database
    return res.status(200).json({ message: 'Password Updated' });
  } catch (e) {
    console.error(e);
  }
};

export default changePasswordHandler;
