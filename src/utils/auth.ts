import jwt from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { UserType } from '../routes/authRouter/handlers/signUp';

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
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).end();
  }

  const token = bearer.split('Bearer ')[1].trim();
  let payload;
  try {
    payload = await verifyToken(token);
  } catch (e) {
    return res.status(401).end();
  }

  /*const user = await User.findById(payload.id)
    .select('-password')
    .lean()
    .exec();

  if (!user) {
    return res.status(401).end();
  }

  req.user = user;*/
  next();
};
