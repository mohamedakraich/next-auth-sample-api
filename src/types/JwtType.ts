import { InfoType } from './InfoType';

export interface JwtType {
  id: string;
  email: string;
  info: InfoType;
  isVerified: boolean;
}
