import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException , Res} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema'
import { SignupDto } from './dto/signup.dto'
import { LoginDto } from './dto/login.dto'
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt'

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
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) { }


  generateToken(user: UserDocument): AuthTokens {
    const payload = {
      id: user._id?.toString(),
      email: user.email,
      role: user.role
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '50m',
    })
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRY ? parseInt(process.env.JWT_REFRESH_EXPIRY, 10) : '7d',
    })

    return {accessToken , refreshToken}
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
        role: role || UserRole.USER
      });

      await user.save();
      const savedUser = await this.userModel.findOne({ email });
      if (!savedUser) {
        throw new InternalServerErrorException('Failed to find user after signup');
      }

      return savedUser;

    } catch (error) {
      throw new InternalServerErrorException('Failed to register ' + error);
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginDto;
      const existingUser = await this.userModel.findOne({ email });
      // console.log(existingUser )
      if (!existingUser) {
        throw new ConflictException('User Not registered');
      }

      const isMatchPassword = await bcrypt.compare(password, existingUser.password);
      //  console.log(isMatchPassword )
      if (!isMatchPassword) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const tokens = this.generateToken(existingUser);

      const sanitizedUser = await this.userModel.findById(existingUser._id).select('-password');
      // console.log(sanitizedUser)
      // console.log(sanitizedUser , tokens)
      return {
        user:sanitizedUser!,
        tokens 
      }


    } catch (error) {
      throw new InternalServerErrorException('Failed to Login ' + error);
    }
  }
   async generateNewRefreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token missing');
      }

      // verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // find user in db
      const user = await this.userModel.findById(payload.id);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // generate new refresh token
      const tokens = this.generateToken(user);

      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to Generate access Token ' + error,
      );
    }
  }
}
