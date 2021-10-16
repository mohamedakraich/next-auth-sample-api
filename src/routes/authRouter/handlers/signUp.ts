import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { getDbConnection } from '../../../db';
import {
  BASE_URL,
  DATABASE_NAME,
  SENDER_EMAIL,
} from '../../../utils/constants';
import { sendEmail } from '../../../utils/sendEmail';

const signUpHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const db = getDbConnection(DATABASE_NAME);
  const user = await db.collection('users').findOne({ email });

  if (user) {
    return res.sendStatus(409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const verificationString = uuid();

  const startingInfo = {
    hairColor: '',
    favoriteFood: '',
    bio: '',
  };

  const result = await db.collection('users').insertOne({
    email,
    isVerified: false,
    passwordHash,
    info: startingInfo,
    verificationString,
  });

  const { insertedId } = result;

  try {
    await sendEmail({
      to: email,
      from: SENDER_EMAIL,
      subject: 'Please Verify Your Email',
      text: `
					Thanks for signing up! To verify your email, you just need to click this link:
					${BASE_URL}/verify-email/${verificationString}
				`,
    });
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }

  jwt.sign(
    {
      id: insertedId,
      isVerified: false,
      email,
      info: startingInfo,
    },
    process.env.JWT_SECRET || '',
    {
      expiresIn: '2d',
    },
    (err, token) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }

      res.status(200).send({ token });
    }
  );
};

export default signUpHandler;
