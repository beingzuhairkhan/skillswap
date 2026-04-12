import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Res,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import eventBus from 'src/notification/eventBus';
import { EVENTS } from 'src/notification/eventTypes';
import { Redis } from 'ioredis';
import { NotificationService } from 'src/notification/notification.service';
import { getForgotPasswordEmailTemplate } from 'src/template/forgotPassword.template';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignupResponse {
  user?: UserDocument;
  message?: string;
}

export interface LoginResponse extends SignupResponse {
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
    @Inject('REDIS') private readonly redis: Redis,
    private readonly notificationService: NotificationService
  ) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  generateToken(user: UserDocument): AuthTokens {
    const payload = {
      id: user._id?.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '50m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRY
        ? parseInt(process.env.JWT_REFRESH_EXPIRY, 10)
        : '7d',
    });

    return { accessToken, refreshToken };
  }

  async signUp(signupDto: SignupDto): Promise<UserDocument> {
    try {
      const { name, email, password, role } = signupDto;
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('User already registered');
      }
      const user = await this.userModel.create({
        name,
        email,
        password,
        role: role || UserRole.USER,
      });

      await user.save();
      const savedUser = await this.userModel.findOne({ email });
      if (!savedUser) {
        throw new InternalServerErrorException(
          'Failed to find user after signup',
        );
      }

      return savedUser;
    } catch (error) {
      throw new InternalServerErrorException('Failed to register ' + error);
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginDto;
      console.log(email, password);
      const existingUser = await this.userModel.findOne({ email });
      // console.log(existingUser )
      if (!existingUser) {
        throw new ConflictException('User Not registered');
      }

      const isMatchPassword = await bcrypt.compare(
        password,
        existingUser.password,
      );
      //  console.log(isMatchPassword )
      if (!isMatchPassword) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const tokens = this.generateToken(existingUser);

      const sanitizedUser = await this.userModel
        .findById(existingUser._id)
        .select('-password');
      // console.log(sanitizedUser)
      // console.log(sanitizedUser , tokens)
      return {
        user: sanitizedUser!,
        tokens,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to Login ' + error);
    }
  }
  async generateNewRefreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token missing');
      }

      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userModel.findById(payload.id);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = this.generateToken(user);

      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to Generate access Token ' + error,
      );
    }
  }

  async githubCallback(githubData: any) {
    try {
      const { githubId, username, email } = githubData;

      let user = await this.userModel.findOne({ email });

      if (!user) {
        user = new this.userModel({
          name: username,
          email,
          password: githubId,
          githubUsername: username,
          role: UserRole.USER,
        });
        await user.save();
      }
      const tokens = this.generateToken(user);

      const sanitizedUser = await this.userModel
        .findById(user._id)
        .select('-password');

      return {
        user: sanitizedUser!,
        tokens,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to register/login: ' + error,
      );
    }
  }

  async googleLogin(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket?.getPayload();
      if (!payload) {
        throw new InternalServerErrorException('Invalid Google token payload');
      }
      const { email, name, picture } = payload;
      const sub = (payload as any).sub; // fallback if sub is present

      let user = await this.userModel.findOne({ email });

      if (!user) {
        user = new this.userModel({
          name,
          email,
          password: sub,
          imageUrl: picture,
          role: UserRole.USER,
        });
        await user.save();
      }
      const tokens = this.generateToken(user);

      const sanitizedUser = await this.userModel
        .findById(user._id)
        .select('-password');

      return {
        user: sanitizedUser!,
        tokens,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to register/login: ' + error,
      );
    }
  }

   private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER, // Gmail address
      pass: process.env.MAIL_PASS, // App password!
    },
  });

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        html,
      });
      console.log('✅ Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error; // Important: rethrow for BullMQ retries
    }
  }

  async forgotPasswordGetEmail(emailId: string) {
    try {
      const checkUserExits = await this.userModel.findOne({ email: emailId });
      if (!checkUserExits) {
        throw new InternalServerErrorException('User not exits');
      }

      const generateOTP = Math.floor(100000 + Math.random() * 900000);
      await this.redis.set(`otp:${emailId}`, generateOTP, 'EX', 300);
      const subject = 'forgot password '
      const html = getForgotPasswordEmailTemplate(generateOTP);
      this.sendEmail(emailId, subject, html)


      return {
        message: 'OTP sent successfully',
      };

    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send OTP: ' + error,
      );
    }
  }

  async newPassword(
    emailId: string,
    otp: string,
    password: string,
    confirmPassword: string,
  ) {
    try {
      const user = await this.userModel.findOne({ email: emailId });
      if (!user) {
        throw new InternalServerErrorException('User does not exist');
      }

      const redisOtp = await this.redis.get(`otp:${emailId}`);
      if (!redisOtp || redisOtp !== otp) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }

      if (password !== confirmPassword) {
        throw new ConflictException('Passwords do not match');
      }

      user.password = password;
      await user.save();

      await this.redis.del(`otp:${emailId}`);

      return { message: 'Password updated successfully' };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update new password: ' + error,
      );
    }
  }

  async verifyCaptcha(token: string): Promise<boolean> {
    console.log("token" , token)
    if (!token) {
      throw new BadRequestException('Captcha token missing');
    }

    try {
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret:process.env.RECAPTCHA_SECRET_KEY,
            response: token,
          },
        },
      );

      return response.data.success;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Captcha verification failed');
    }
  }
}
