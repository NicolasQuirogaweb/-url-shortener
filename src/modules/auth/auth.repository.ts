import { User, IUser } from './user.model';
import { formatDate } from '../../shared/utils/dateFormatter';

export interface SafeUser {
  id: string;
  email: string;
  createdAt: string;
}

const toSafeUser = (user: IUser): SafeUser => ({
  id: user._id.toString(),
  email: user.email,
  createdAt: formatDate(user.createdAt)!,
});

export const authRepository = {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  },

  async create(email: string, hashedPassword: string): Promise<SafeUser> {
    const user = await User.create({ email, password: hashedPassword });
    return toSafeUser(user);
  },

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  },

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return User.findOne({ googleId });
  },

  async createFromGoogle(email: string, googleId: string): Promise<IUser> {
    return User.create({ email, googleId });
  },

  async linkGoogle(userId: string, googleId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { googleId });
  },

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken });
  },
};
