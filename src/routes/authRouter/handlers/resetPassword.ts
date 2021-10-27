import { Request, Response } from 'express';
import { getDbConnection } from '../../../db';
import { hashPassword } from '../../../utils/auth';
import { DATABASE_NAME } from '../../../utils/constants';

const resetPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { passwordResetCode } = req.params;
    const { newPassword } = req.body;

    const db = getDbConnection(DATABASE_NAME);

    const newPasswordHash = await hashPassword(newPassword);

    const result = await db.collection('users').findOneAndUpdate(
      { passwordResetCode },
      {
        $set: { passwordHash: newPasswordHash },
        $unset: { passwordResetCode: '' },
      }
    );

    if (result.lastErrorObject?.n === 0) return res.status(404).end();

    return res.status(200).json({ message: 'Password reset successfully!' });
  } catch (e) {
    console.error(e);
  }
};

export default resetPasswordHandler;
