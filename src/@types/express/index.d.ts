import { UserType } from '../../routes/authRouter/handlers/signUp';

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserType;
    }
  }
}
