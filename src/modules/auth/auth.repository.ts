import { User, IUser } from './user.model';

export interface SafeUser {
  id: string;
  email: string;
  createdAt: Date;
}

const toSafeUser = (user: IUser): SafeUser => ({
  id: user._id.toString(),
  email: user.email,
  createdAt: user.createdAt,
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

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken });
  },
};
