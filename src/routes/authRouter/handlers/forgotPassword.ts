import { v4 as uuid } from 'uuid';
import { getDbConnection } from '../../../db';
import { Request, Response } from 'express';
import { sendEmail } from '../../../utils/sendEmail';
import {
  BASE_URL,
  DATABASE_NAME,
  SENDER_EMAIL,
} from '../../../utils/constants';

const forgotPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const db = getDbConnection(DATABASE_NAME);
    const passwordResetCode = uuid();

    const { modifiedCount } = await db.collection('users').updateOne(
      { email },
      {
        $set: { passwordResetCode },
      }
    );

    if (modifiedCount > 0) {
      await sendEmail({
        to: email,
        from: SENDER_EMAIL,
        subject: 'Password Reset',
        text: `
            Uh oh, here's a link to reset your password:
            ${BASE_URL}/reset-password/${passwordResetCode}
          `,
      });
    }

    return res
      .status(200)
      .json({ message: 'Password reset code sent successfully' });
  } catch (e) {
    console.error(e);
  }
};

export default forgotPasswordHandler;
