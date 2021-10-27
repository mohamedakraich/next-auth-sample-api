import jwt from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { UserType } from '../routes/authRouter/handlers/signUp';
import { getDbConnection } from '../db';
import { DATABASE_NAME } from './constants';

export interface JwtType {
  id: string;
  email: string;
  isVerified: boolean;
}

export const generateToken = (user: UserType) =>
  new Promise((resolve, reject) => {
    jwt.sign(
      user,
      process.env.JWT_SECRET || '',
      { expiresIn: process.env.JWT_EXP || '2d' },
      (err, token) => {
        if (err) return reject(err);
        resolve(token);
      }
    );
  });

export const verifyToken = (token: string) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET || '', (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });

export const verifyPassword = async (
  password: string,
  hashedPassword: string
) => {
  const isValid = await compare(password, hashedPassword);
  return isValid;
};

export const hashPassword = async (password: string) => {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
};

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearer = req.headers.authorization;
    //console.log(bearer);
    if (!bearer || !bearer.startsWith('Bearer ')) {
      return res.status(401).end();
    }
    const token = bearer.split('Bearer ')[1].trim();
    const payload = (await verifyToken(token)) as JwtType;

    const db = getDbConnection(DATABASE_NAME);

    const user = await db.collection('users').findOne({
      email: payload.email,
    });

    console.log(user);

    if (!user) {
      return res.status(401).end();
    }

    const authenticatedUser = { ...payload };

    req.currentUser = authenticatedUser;

    next();
  } catch (e) {
    console.error(e);
  }
};
