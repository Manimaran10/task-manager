import userRepository from '../repositories/user.repository';
import { generateToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import { RegisterDto, LoginDto, UpdateProfileDto } from '../validations/auth.validation';

export class AuthService {
  async register(data: RegisterDto) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user
    const user = await userRepository.create(data);

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token };
  }

  async login(data: LoginDto) {
    // Find user with password
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await userRepository.updateProfile(userId, data);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async searchUsers(query: string, currentUserId: string) {
    return await userRepository.searchUsers(query, currentUserId);
  }
}

export default new AuthService();