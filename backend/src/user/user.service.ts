import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { AddProfileDto } from './dto/add-profile.dto';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UploadService } from 'src/upload/upload.service';
import { CodingProfileDto } from './dto/create-codingProfile.dto';
import axios from 'axios';
import { Feedback, FeedbackDocument } from 'src/schemas/feedback.schema';
import {
  TrendingSkills,
  TrendingSkillsDocument,
} from 'src/schemas/trending-skills.schema';
import { Resource, ResourceDocument } from 'src/schemas/resource.schema';
import { Save, SavedDocument } from 'src/schemas/save.schema';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Feedback.name) private readonly feedbackModel: Model<FeedbackDocument>,
    @InjectModel(TrendingSkills.name) private readonly trendingSkillsModel: Model<TrendingSkillsDocument>,
    @InjectModel(Resource.name) private readonly resourceModel: Model<ResourceDocument>,
    @InjectModel(Save.name) private readonly saveModel: Model<SavedDocument>,
    private readonly cloudinary: UploadService,
  ) { }

  async getMyProfile(userId: string): Promise<any> {
    try {
      const profileData = await this.userModel
        .findById(userId)
        .select('-password');

      const ratingAggregation = await this.feedbackModel.aggregate([
        { $match: { otherUserId: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$otherUserId',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]);

      const avgRating = ratingAggregation.length
        ? Number(ratingAggregation[0].avgRating.toFixed(1))
        : 0;
      const ratingCount = ratingAggregation.length
        ? ratingAggregation[0].count
        : 0;
      if (!profileData) {
        throw new NotFoundException('User not found');
      }
      return {
        ...profileData.toObject(),
        ratings: avgRating,
        ratingCount,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user profile');
    }
  }

  async getPostWithUser(postId: string): Promise<any> {
    try {
      if (!postId) {
        throw new NotFoundException('PostId not found');
      }

      // Convert postId to ObjectId
      if (!Types.ObjectId.isValid(postId)) {
        throw new NotFoundException('Invalid postId');
      }
      const objectId = new Types.ObjectId(postId);

      const postData = await this.postModel.aggregate([
        {
          $match: { _id: objectId }, // Match the specific post
        },
        {
          // Convert user field to ObjectId for lookup if stored as string
          $addFields: {
            userObjId: { $toObjectId: '$user' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userObjId',
            foreignField: '_id',
            as: 'userData',
          },
        },
        {
          $unwind: {
            path: '$userData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            wantToLearn: 1,
            wantToTeach: 1,
            rating: 1,
            specificTopic: 1,
            postImageUrl: 1,
            trendingSkills: 1,
            userData: {
              name: 1,
              imageUrl: 1,
              _id: 1,
            },
          },
        },
      ]);

      if (!postData || postData.length === 0) {
        throw new NotFoundException('Post not found');
      }
      // console.log(postData)
      return postData[0];
    } catch (error) {
      console.error('Error fetching post with user:', error);
      throw new InternalServerErrorException('Failed to fetch post data');
    }
  }

  async updateUserProfile(
    userId: string,
    addProfileDto: AddProfileDto,
    imageBuffer?: Buffer,
    filename?: string,
  ): Promise<UserDocument> {
    try {
      if (!userId) {
        throw new ConflictException('User not present');
      }
      //console.log("image" ,userId , addProfileDto, imageBuffer , filename)

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let imageUrl = user.imageUrl;
      let publicId = user.publicId;

      // If new image uploaded, replace old one
      if (imageBuffer) {
        const file = {
          buffer: imageBuffer,
          originalname: filename,
        } as Express.Multer.File;

        // If user already has an image, delete it from Cloudinary
        if (publicId) {
          await this.cloudinary.deleteImage(publicId);
        }

        const { url, publicId: newPublicId } =
          await this.cloudinary.uploadFile(file);
        imageUrl = url;
        publicId = newPublicId;
      }

      //console.log("image" , imageUrl , publicId)
      const parsedSkillsToTeach = addProfileDto.skillsToTeach
        ? JSON.parse(addProfileDto.skillsToTeach as unknown as string)
        : [];

      const parsedSkillsToLearn = addProfileDto.skillsToLearn
        ? JSON.parse(addProfileDto.skillsToLearn as unknown as string)
        : [];

      // Update the user
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            ...addProfileDto,
            skillsToTeach: parsedSkillsToTeach,
            skillsToLearn: parsedSkillsToLearn,
            imageUrl,
            publicId,
          },
        },
        { new: true, runValidators: true },
      );
      if (!updatedUser) {
        throw new InternalServerErrorException('Failed to update profile');
      }
      return updatedUser;
    } catch (error) {
      // console.error('Error updating user profile:', error);
      throw new InternalServerErrorException('Failed to update user profile');
    }
  }

  async getAllPosts(search?: string): Promise<any> {
    const trendingSkills = await this.getTrendingSkills(5);
    const matchStage: any = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      matchStage.$or = [
        { 'userPostDetails.name': regex },
        { 'userPostDetails.email': regex },
        { 'userPostDetails.domain': regex },
        { wantToTeach: regex },
        { wantToLearn: regex },
        { specificTopic: regex },
        { trendingSkills: regex },
      ];
    }

    const Allpost = await this.postModel.aggregate([
      { $addFields: { userObjId: { $toObjectId: '$user' } } },

      {
        $lookup: {
          from: 'users',
          localField: 'userObjId',
          foreignField: '_id',
          as: 'userPostDetails',
        },
      },
      { $unwind: '$userPostDetails' },

      ...(search ? [{ $match: matchStage }] : []),

      {
        $lookup: {
          from: 'resources',
          localField: '_id',
          foreignField: 'postId',
          as: 'resources',
        },
      },

      {
        $lookup: {
          from: 'users',
          let: { resourceUserIds: '$resources.userId' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$resourceUserIds'] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: 'resourceUsers',
        },
      },

      {
        $addFields: {
          resources: {
            $map: {
              input: '$resources',
              as: 'res',
              in: {
                _id: '$$res._id',
                resourcePDF: '$$res.resourcePDF',
                resourceURL: '$$res.resourceURL',
                createdAt: '$$res.createdAt',
                userId: '$$res.userId',
                postId: '$$res.postId',
                userName: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$resourceUsers',
                        as: 'ru',
                        cond: { $eq: ['$$ru._id', '$$res.userId'] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },

      {
        $project: {
          _id: 1,
          user: 1,
          wantToLearn: 1,
          wantToTeach: 1,
          specificTopic: 1,
          postImageUrl: 1,
          postUrl: 1,
          postPdf: 1,
          trendingSkills: 1,
          likes: 1,
          comments: 1,
          createdAt: 1,
          userPostDetails: {
            name: 1,
            collegeName: 1,
            skillsToLearn: 1,
            imageUrl: 1,
            domain: 1,
            badge:1
          },
          resources: 1,
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    const posts = Allpost.map((post) => ({
      ...post,
      trendingSkills,
    }));

    return posts;
  }

  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
    imageBuffer?: Buffer,
    filename?: string,
  ): Promise<any> {
    try {
      if (!userId) {
        throw new ConflictException('User not present');
      }
      //  console.log(createPostDto)

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let imageUrl: string | undefined;
      let publicId: string | undefined;

      if (imageBuffer && filename) {
        const file = {
          buffer: imageBuffer,
          originalname: filename,
        } as Express.Multer.File;
        const { url, publicId: cloudinaryId } =
          await this.cloudinary.uploadFile(file);
        imageUrl = url;
        publicId = cloudinaryId;
      }

      const newPost = new this.postModel({
        user: new Types.ObjectId(userId),
        ...createPostDto,
        postImageUrl: imageUrl,
        postImagePublicId: publicId,
      });

      const savedPost = await newPost.save();

      if (!savedPost) {
        throw new InternalServerErrorException('Failed to create post');
      }

      await this.updateTrendingSkills([
        createPostDto.wantToLearn,
        createPostDto.wantToTeach,
      ]);

      return savedPost;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create Post ' + error);
    }
  }

  async createCodingProfile(
    userId: string,
    codingProfileDto: CodingProfileDto,
    imageBuffer?: Buffer,
    filename?: string,
  ): Promise<CodingProfileDto> {
    try {
      if (!userId) {
        throw new ConflictException('User ID is required');
      }

      let imageUrl: string | undefined;

      // Upload resume if provided
      if (imageBuffer && filename) {
        const file = {
          buffer: imageBuffer,
          originalname: filename,
        } as Express.Multer.File;

        const { url } = await this.cloudinary.uploadPfp(file);
        imageUrl = url;
      }

      // Update user document
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            leetcodeUsername: codingProfileDto.leetcodeUsername,
            githubUsername: codingProfileDto.githubUsername,
            portfolioUrl: codingProfileDto.portfolioUrl,
            resume: imageUrl,
          },
        },
        { new: true, runValidators: true },
      );

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return {
        leetcodeUsername: updatedUser.leetcodeUsername,
        githubUsername: updatedUser.githubUsername,
        portfolioUrl: updatedUser.portfolioUrl,
        resume: updatedUser.resume,
      } as CodingProfileDto;
    } catch (error) {
      console.error(error); // optional: log actual error
      throw new InternalServerErrorException(
        'Failed to create Coding Profile: ',
      );
    }
  }

  async getCodingProfile(userId: string): Promise<CodingProfileDto> {
    try {
      if (!userId) {
        throw new ConflictException('User not present');
      }

      const user = await this.userModel
        .findById(userId)
        .select('leetcodeUsername githubUsername portfolioUrl resume');

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        leetcodeUsername: user.leetcodeUsername,
        githubUsername: user.githubUsername,
        portfolioUrl: user.portfolioUrl,
        resume: user.resume,
      } as CodingProfileDto;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch Coding Profile: ',
      );
    }
  }

  async getLeetcodePrfile(userId: string): Promise<any> {
    try {
      if (!userId) {
        throw new ConflictException('User not present');
      }
      const user = await this.userModel
        .findById(userId)
        .select('leetcodeUsername');

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // console.log("U" , user)
      try {
        const response = await axios.post(
          'https://leetcode.com/graphql',
          {
            query: `
                        query getUserProfile($username: String!) {
                          matchedUser(username: $username) {
                            username
                            profile {
                              realName
                              userAvatar
                              ranking
                              reputation
                            }
                            submitStats {
                              acSubmissionNum {
                                difficulty
                                count
                              }
                            }
                            badges {
                              id
                              name
                              displayName
                            }
                          }
                        }
                      `,
            variables: { username: user.leetcodeUsername },
          },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        const data = response.data;
        // console.log('LeetCode Data:', data);

        return data;
      } catch (err) {
        throw new InternalServerErrorException(
          'Failed to fetch LeetCode profile: ',
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch Leetcode Profile: ',
      );
    }
  }

  async getUserProfileData(profileId: string): Promise<any> {
    try {
      if (!profileId) {
        throw new ConflictException('User ID not provided');
      }

      const userProfileData = await this.userModel
        .findById(profileId)
        .select('-password');

      const ratingAggregation = await this.feedbackModel.aggregate([
        { $match: { otherUserId: new Types.ObjectId(profileId) } },
        {
          $group: {
            _id: '$otherUserId',
            avgRating: { $avg: '$rating' },
            ratingCount: { $sum: 1 },
          },
        },
      ]);

      const avgRating = ratingAggregation.length
        ? Number(ratingAggregation[0].avgRating.toFixed(1))
        : 0;
      const ratingCount = ratingAggregation.length
        ? ratingAggregation[0].ratingCount
        : 0;
      if (!userProfileData) {
        throw new NotFoundException('User not found');
      }

      return {
        ...userProfileData.toObject(),
        ratings: avgRating,
        ratingCount,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user profile: ');
    }
  }

  async followUser(userId: string, followId: string): Promise<any> {
    try {
      if (userId === followId) {
        throw new ConflictException('You cannot follow yourself');
      }

      const user = await this.userModel.findById(userId);
      const followUser = await this.userModel.findById(followId);

      if (!user || !followUser) {
        throw new NotFoundException('User not found');
      }

      const followObjectId = new Types.ObjectId(followId);
      const userObjectId = new Types.ObjectId(userId);

      const alreadyFollowing = user.following.some(
        (id) => id.toString() === followId,
      );

      if (alreadyFollowing) {
        return { message: 'User already followed' };
      }

      user.following.push(followObjectId);
      followUser.follower.push(userObjectId);

      await user.save();
      await followUser.save();

      return { message: 'Followed successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to follow user: ');
    }
  }
  async suggestedUsers(userId: string): Promise<any[]> {
    try {
      const currentUser = await this.userModel.findById(userId);
      if (!currentUser) return [];

      const candidates = await this.userModel.find({
        _id: { $nin: [userId, ...currentUser.following] },
      });
      // const filtered = candidates.filter((candidate) => {
      //     const teachesWhatILearn = candidate.skillsToTeach.some(skill =>
      //         currentUser.skillsToLearn.includes(skill)
      //     );

      //     const learnsWhatITeach = candidate.skillsToLearn.some(skill =>
      //         currentUser.skillsToTeach.includes(skill)
      //     );

      //     return teachesWhatILearn || learnsWhatITeach;
      // });

      const formatted = candidates.map((u) => ({
        _id: u._id,
        name: u.name,
        imageUrl: u.imageUrl || null,
        followerCount: u.follower.length,
        firstSkillToLearn: u.skillsToLearn[0] || null,
        isOnline: u.isOnline,
      }));

      return formatted.slice(0, 5);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      return [];
    }
  }

  async myPostsData(userId: string): Promise<any> {
    try {
      if (!userId) {
        throw new NotFoundException('User not found');
      }

      const postData = await this.postModel
        .find({ user: userId.toString() })
        .sort({ createdAt: -1 });
      return postData;
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      return [];
    }
  }

  private normalizeSkill(skill: string): string {
    return skill.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  async updateTrendingSkills(skills: string[]) {
    const normalizedSkills = [
      ...new Set(
        skills.filter(Boolean).map((skill) => this.normalizeSkill(skill)),
      ),
    ];

    for (const skill of normalizedSkills) {
      const regex = new RegExp(`^${skill}$`, 'i');

      const updateResult = await this.trendingSkillsModel.updateOne(
        { 'skills.skill': { $regex: regex } },
        { $inc: { 'skills.$.count': 1 } },
      );

      if (updateResult.matchedCount === 0) {
        await this.trendingSkillsModel.updateOne(
          {},
          {
            $push: {
              skills: { skill, count: 1 },
            },
          },
          { upsert: true },
        );
      }
    }
  }

  async getTrendingSkills(limit?: number) {
    try {
      const doc = await this.trendingSkillsModel.findOne();

      if (!doc || !doc.skills?.length) {
        return [];
      }

      const sortedSkills = doc.skills
        .sort((a, b) => b.count - a.count)
        .slice(0, limit ?? doc.skills.length)
        .map((skillObj) => skillObj.skill);

      return sortedSkills;
    } catch (error) {
      console.error('Error fetching trending skills:', error);
      return [];
    }
  }

  async savePost(userId: string, postId: string): Promise<any> {
    try {
      if (!postId || !userId) {
        throw new NotFoundException('User or Post not found');
      }

      // Check if post exists
      const post = await this.postModel.findById(postId);
      const user = await this.userModel.findById(userId);

      if (!post || !user) {
        throw new NotFoundException('User or Post not found');
      }

      // Check for duplicate using ObjectId
      const checkPostExist = await this.saveModel.findOne({
        user: user._id,
        Post: post._id
      });

      if (checkPostExist) {
        return { message: "Post already saved" };
      }

      // Save new post
      const newSave = new this.saveModel({
        user: user._id,
        Post: post._id
      });

      await newSave.save();
      return { message: 'Post saved successfully' };

    } catch (error) {
      console.error('Error saving post:', error);
      throw new InternalServerErrorException('Failed to save post');
    }
  }

  async getSavedPosts(userId: string): Promise<any> {
    try {
      console.log("Fetching saved posts for user:", userId);

      if (!userId) {
        throw new NotFoundException('User not found');
      }

      const savedPosts = await this.saveModel
        .find({ user: new Types.ObjectId(userId) })
        .populate('Post');


      return savedPosts.map(save => save.Post);
    } catch (error) {
      console.error('Error fetching saved posts:', error);

      throw new InternalServerErrorException(
        error.message || 'Failed to fetch saved posts'
      );
    }
  }


  async unsavePost(userId: string, postId: string): Promise<any> {
    try {
      if (!postId || !userId) {
        throw new NotFoundException('User or Post not found');
      }

      const deleted = await this.saveModel.findOneAndDelete({ user: new Types.ObjectId(userId), Post: new Types.ObjectId(postId) });
      if (!deleted) {
        throw new NotFoundException('Saved post not found');
      }
      return { message: 'Post unsaved successfully' };
    } catch (error) {
      console.error('Error unsaving post:', error);
      throw new InternalServerErrorException('Failed to unsave post');
    }
  }

  async leetcode(username: string) {
    try {
      const response = await axios.post(
        "https://leetcode.com/graphql",
        {
          query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
          variables: { username }
        }
      );

      const stats =
        response.data.data.matchedUser.submitStats.acSubmissionNum;

      let result = {
        leetcode_solved: 0,
        easy_solved: 0,
        medium_solved: 0,
        hard_solved: 0
      };

      stats.forEach((item) => {
        if (item.difficulty === "All") result.leetcode_solved = item.count;
        if (item.difficulty === "Easy") result.easy_solved = item.count;
        if (item.difficulty === "Medium") result.medium_solved = item.count;
        if (item.difficulty === "Hard") result.hard_solved = item.count;
      });

      return result;
    } catch (err) {
      throw new InternalServerErrorException("LeetCode fetch failed");
    }
  }

  async github(username: string) {
    try {
      const res = await axios.get(
        `https://api.github.com/users/${username}`
      );

      return {
        repos: res.data.public_repos,
        followers: res.data.followers
      };
    } catch (err) {
      throw new InternalServerErrorException("GitHub fetch failed");
    }
  }

  @Cron('*/5 * * * *')
  async handleCron() {
    console.log('Running badge generator cron...');

    await this.badgeGenerator();
  }

  async badgeGenerator() {
    const users = await this.userModel.find({});

    for (const user of users) {
      if (!user.leetcodeUsername || !user.githubUsername) continue;

      try {
        const leetcodeData = await this.leetcode(user.leetcodeUsername);
        const githubData = await this.github(user.githubUsername);

        const hard_ratio =
          leetcodeData.hard_solved / (leetcodeData.leetcode_solved + 1);

        const repo_score =
          githubData.repos * 0.7 + githubData.followers * 0.3;

        const payload = {
          ...leetcodeData,
          ...githubData,
          hard_ratio,
          repo_score
        };

        const mlResponse = await axios.post(
          `${process.env.MODEL}/predict`,
          payload
        );

        const { badge, confidence } = mlResponse.data;

        user.badge = badge;

        await user.save();
     

      } catch (err) {
        console.error("Error processing user:", user._id);
      }
    }

    return { message: "Badges updated successfully" };
  }

}
