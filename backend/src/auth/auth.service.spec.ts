import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole, UserDocument } from '../schemas/user.schema';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let jwtService: any;

  const signupDto = {
    name: 'Zuhair',
    email: 'test@example.com',
    password: 'password123',
    role: UserRole.USER,
  };

  const loginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUserDoc = {
    _id: 'userId123',
    name: 'Zuhair',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mockToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken('User'));
    jwtService = module.get(JwtService);
  });

  // -------------------- SignUp Tests --------------------
  it('should signup successfully', async () => {
    userModel.findOne.mockResolvedValueOnce(null); // no existing user
    userModel.create.mockResolvedValueOnce(mockUserDoc);
    userModel.findOne.mockResolvedValueOnce(mockUserDoc); // after save

    const result = await service.signUp(signupDto);

    expect(result).toEqual(mockUserDoc);
    expect(userModel.findOne).toHaveBeenCalledTimes(2);
    expect(userModel.create).toHaveBeenCalledWith({
      ...signupDto,
      role: signupDto.role || UserRole.USER,
    });
    expect(mockUserDoc.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if user already exists', async () => {
    userModel.findOne.mockResolvedValueOnce(mockUserDoc);

    await expect(service.signUp(signupDto)).rejects.toThrow(ConflictException);
  });

  it('should throw InternalServerError if saved user not found', async () => {
    userModel.findOne.mockResolvedValueOnce(null);
    userModel.create.mockResolvedValueOnce(mockUserDoc);
    userModel.findOne.mockResolvedValueOnce(null);

    await expect(service.signUp(signupDto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  // -------------------- Login Tests --------------------
  it('should login successfully', async () => {
    userModel.findOne.mockResolvedValueOnce(mockUserDoc); // user exists
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    userModel.findById.mockResolvedValueOnce({
      ...mockUserDoc,
      password: undefined,
    });

    const result = await service.login(loginDto);

    expect(result.tokens.accessToken).toBe('mockToken');
    expect(result.tokens.refreshToken).toBe('mockToken');
    expect(result.user.email).toBe('test@example.com');
  });

  it('should throw ConflictException if user not registered', async () => {
    userModel.findOne.mockResolvedValueOnce(null);

    await expect(service.login(loginDto)).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException if password is wrong', async () => {
    userModel.findOne.mockResolvedValueOnce(mockUserDoc);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    await expect(service.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
