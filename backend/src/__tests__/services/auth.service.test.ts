import authService from '../../services/auth.service';
import userRepository from '../../repositories/user.repository';
import { generateToken } from '../../utils/jwt';

// Mock dependencies
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/jwt');

// Type assertions for mocked modules
const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const mockedGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;

describe('AuthService', () => {
  const mockUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  const mockUser = {
    _id: 'user123',
    ...mockUserData,
    comparePassword: jest.fn().mockResolvedValue(true),
    toObject: () => ({ 
      _id: 'user123', 
      name: mockUserData.name, 
      email: mockUserData.email 
    })
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock dependencies
      mockedUserRepo.findByEmail.mockResolvedValue(null);
      mockedUserRepo.create.mockResolvedValue(mockUser as any);
      mockedGenerateToken.mockReturnValue('mock-token');

      // Execute
      const result = await authService.register(mockUserData);

      // Assert
      expect(mockedUserRepo.findByEmail).toHaveBeenCalledWith(mockUserData.email);
      expect(mockedUserRepo.create).toHaveBeenCalledWith(mockUserData);
      expect(mockedGenerateToken).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mock-token');
    });

    it('should throw error if email already exists', async () => {
      // Mock dependencies
      mockedUserRepo.findByEmail.mockResolvedValue(mockUser as any);

      // Execute & Assert
      await expect(
        authService.register(mockUserData)
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      // Mock dependencies
      mockedUserRepo.findByEmail.mockResolvedValue(mockUser as any);
      mockedGenerateToken.mockReturnValue('mock-token');

      // Execute
      const result = await authService.login({
        email: mockUserData.email,
        password: mockUserData.password
      });

      // Assert
      expect(mockedUserRepo.findByEmail).toHaveBeenCalledWith(mockUserData.email);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(mockUserData.password);
      expect(mockedGenerateToken).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mock-token');
    });

    it('should throw error with invalid credentials', async () => {
      // Mock dependencies
      mockedUserRepo.findByEmail.mockResolvedValue(null);

      // Execute & Assert
      await expect(
        authService.login({
          email: mockUserData.email,
          password: mockUserData.password
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with wrong password', async () => {
      // Mock user with wrong password
      const mockUserWrongPassword = {
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserWrongPassword as any);

      // Execute & Assert
      await expect(
        authService.login({
          email: mockUserData.email,
          password: 'wrongpassword'
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});