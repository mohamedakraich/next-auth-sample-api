import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDbConnection } from '../../../db';
import { generateToken, hashPassword } from '../../../utils/auth';
import {
  BASE_URL,
  DATABASE_NAME,
  SENDER_EMAIL,
} from '../../../utils/constants';
import { sendEmail } from '../../../utils/sendEmail';

export interface UserType {
  id: string;
  email: string;
  isVerified: boolean;
}

const signUpHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const db = getDbConnection(DATABASE_NAME);
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return res.status(422).json({ message: 'User exists already!' });
    }

    const passwordHash = await hashPassword(password);

    const verificationString = uuid();

    const result = await db.collection('users').insertOne({
      email,
      isVerified: false,
      passwordHash,
      verificationString,
    });

    const { insertedId } = result;

    await sendEmail({
      to: email,
      from: SENDER_EMAIL,
      subject: 'Please Verify Your Email',
      text: `
          Thanks for signing up! To verify your email, you just need to click this link:
          ${BASE_URL}/verify-email/${verificationString}
        `,
    });

    const token = await generateToken({
      id: insertedId.toString(),
      isVerified: false,
      email,
    });

    return res.status(200).send({ token });
  } catch (e) {
    console.error(e);
  }
};

export default signUpHandler;
