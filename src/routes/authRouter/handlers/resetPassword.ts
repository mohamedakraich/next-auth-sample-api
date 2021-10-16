import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { getDbConnection } from '../../../db';
import { DATABASE_NAME } from '../../../utils/constants';

const resetPasswordHandler = async (req: Request, res: Response) => {
  const { passwordResetCode } = req.params;
  const { newPassword } = req.body;

  const db = getDbConnection(DATABASE_NAME);

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  const result = await db.collection('users').findOneAndUpdate(
    { passwordResetCode },
    {
      $set: { passwordHash: newPasswordHash },
      $unset: { passwordResetCode: '' },
    }
  );

  if (result.lastErrorObject?.n === 0) return res.sendStatus(404);

  res.sendStatus(200);
};

export default resetPasswordHandler;
