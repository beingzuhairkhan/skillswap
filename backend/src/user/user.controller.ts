import { Body, Controller, Get, Param, Patch, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AddProfileDto } from './dto/add-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt-http.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CodingProfileDto } from './dto/create-codingProfile.dto';

interface FileUpload {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

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

    return this.userService.updateUserProfile(userId, addProfileDto, imageBuffer, filename);
  }


  @Get('posts')
  async getAllPost() {
    return this.userService.getAllPosts();
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-post')
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @Req() req,
    @Body() body: any, // using 'any' here to manually map fields from frontend
    @UploadedFile() image?: Express.Multer.File
  ) {
    try {
      // console.log("User data from controller:", req.user, body);

      const userId = req.user.userId;

      // Map frontend fields to DTO
      const createPostDto: CreatePostDto = {
        wantToLearn: body.wantLearn || body.wantToLearn || "",
        wantToTeach: body.wantTeach || body.wantToTeach || "",
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
        filename
      );

      return {
        success: true,
        message: "Post created successfully",
        data: newPost,
      };
    } catch (error) {
      console.error("Error creating post:", error);
      return {
        success: false,
        message: "Failed to create post",
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('myPosts')
  async myPosts(@Req() req: any) {
    const currentUserId = req.user.userId;
    return this.userService.myPostsData(currentUserId)
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

    return await this.userService.createCodingProfile(userId, codingProfileDto, imageBuffer, filename);
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
    return this.userService.suggestedUsers(currentUserId)
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

  @UseGuards(JwtAuthGuard)
  @Get('allTrendingSkill')
  async getTrendingSkills() {
    return await this.userService.getTrendingSkills()
  }







}
