import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AddProfileDto } from './dto/add-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt-http.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CodingProfileDto } from './dto/create-codingProfile.dto';
import { encrypt } from './../utils/encryption.util';
import * as crypto from 'crypto';
interface FileUpload {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  private encrypt(data: any): string {
    if (!process.env.ENCRYPT_KEY) {
      throw new Error('ENCRYPT_KEY is not defined in environment variables');
    }

    const algorithm = 'aes-256-cbc';
    const secretKey = crypto
      .createHash('sha256')
      .update(process.env.ENCRYPT_KEY)
      .digest(); // raw 32 bytes

    const iv = Buffer.alloc(16, 0);

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final(),
    ]);

    return encrypted.toString('base64');
  }

  @Get('allTrendingSkill')
  async getTrendingSkills() {
    return await this.userService.getTrendingSkills();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    const userId = req.user.userId;
    return this.userService.getMyProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  async getUserProfile(@Param('id') id: string) {
    return this.userService.getPostWithUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('image'))
  async updateUserProfile(
    @Req() req,
    @Body() addProfileDto: AddProfileDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    // console.log('User:', req.user);
    // console.log('DTO:', addProfileDto);
    // console.log('Image:', image);

    const userId = req.user.userId;

    let imageBuffer: Buffer | undefined;
    let filename: string | undefined;

    if (image) {
      imageBuffer = image.buffer;
      filename = image.originalname;
    }

    return this.userService.updateUserProfile(
      userId,
      addProfileDto,
      imageBuffer,
      filename,
    );
  }

  @Get('posts')
  async getAllPosts(@Query('search') search?: string) {
    const posts = await this.userService.getAllPosts(search);
    return this.encrypt(posts)
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-post')
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @Req() req,
    @Body() body: any, // using 'any' here to manually map fields from frontend
    @UploadedFile() image?: Express.Multer.File,
  ) {
    try {
      // console.log("User data from controller:", req.user, body);

      const userId = req.user.userId;

      // Map frontend fields to DTO
      const createPostDto: CreatePostDto = {
        wantToLearn: body.wantLearn || body.wantToLearn || '',
        wantToTeach: body.wantTeach || body.wantToTeach || '',
        specificTopic: body.specificTopic,
        trendingSkills: body.trendingSkills
          ? Array.isArray(body.trendingSkills)
            ? body.trendingSkills
            : JSON.parse(body.trendingSkills)
          : [],
        postUrl: body.link,
        postPdf: body.postPdf,
      };

      // Prepare image data if uploaded
      let imageBuffer: Buffer | undefined;
      let filename: string | undefined;
      if (image) {
        imageBuffer = image.buffer;
        filename = image.originalname;
      }

      // Call service to create post
      const newPost = await this.userService.createPost(
        userId,
        createPostDto,
        imageBuffer,
        filename,
      );

      return {
        success: true,
        message: 'Post created successfully',
        data: newPost,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      return {
        success: false,
        message: 'Failed to create post',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('myPosts')
  async myPosts(@Req() req: any) {
    const currentUserId = req.user.userId;
    return this.userService.myPostsData(currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('coding-profile')
  @UseInterceptors(FileInterceptor('resume'))
  async createCodingProfile(
    @Req() req,
    @Body() codingProfileDto: CodingProfileDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    let imageBuffer: Buffer | undefined;
    let filename: string | undefined;

    if (image) {
      imageBuffer = image.buffer;
      filename = image.originalname;
    }

    return await this.userService.createCodingProfile(
      userId,
      codingProfileDto,
      imageBuffer,
      filename,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('coding-profile')
  async getCodingProfile(@Req() req) {
    const userId = req.user.userId;
    return await this.userService.getCodingProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('coding-leetcode')
  async getCodingLeetcode(@Req() req) {
    const userId = req.user.userId;
    return await this.userService.getLeetcodePrfile(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('suggestedUser')
  async suggestedUsers(@Req() req) {
    const currentUserId = req.user.userId;
    return this.userService.suggestedUsers(currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserProfileData(@Param('id') profileId: string) {
    return await this.userService.getUserProfileData(profileId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async followUser(@Param('id') followId: string, @Req() req) {
    const currentUserId = req.user.userId;
    return this.userService.followUser(currentUserId, followId);
  }
}
