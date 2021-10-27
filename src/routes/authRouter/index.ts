import express from 'express';
import { protect } from '../../utils/auth';
import changePasswordHandler from './handlers/changePassword';
import forgotPasswordHandler from './handlers/forgotPassword';
import logInHandler from './handlers/login';
import resetPasswordHandler from './handlers/resetPassword';
import signUpHandler from './handlers/signUp';
import updateUserInfoHandler from './handlers/updateUserInfo';
import verifyEmailHandler from './handlers/verifyEmail';

const router = express.Router();

router.post('/api/signup', signUpHandler);
router.post('/api/login', logInHandler);

router.put('/api/users/:userId', updateUserInfoHandler);

router.put('/api/verify-email', verifyEmailHandler);

router.put('/api/forgot-password/:email', forgotPasswordHandler);
router.put(
  '/api/users/:passwordResetCode/reset-password',
  resetPasswordHandler
);
router.put(
  '/api/users/change-password/:userId',
  protect,
  changePasswordHandler
);

export default router;
