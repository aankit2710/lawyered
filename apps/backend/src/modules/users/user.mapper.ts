import { User } from './entities/user.entity';

export type PublicUser = Omit<User, 'password'>;

export function sanitizeUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}
