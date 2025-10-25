import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { AddProfileDto } from './dto/add-profile.dto';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UploadService } from 'src/upload/upload.service';
import { CodingProfileDto } from './dto/create-codingProfile.dto';
import axios from 'axios';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        private readonly cloudinary: UploadService
    ) { }


    async getMyProfile(userId: string): Promise<any> {
        try {
            const profileData = await this.userModel.findById(userId).select('-password');
            if (!profileData) {
                throw new NotFoundException('User not found');
            }
            return profileData;
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
                    $match: { _id: objectId } // Match the specific post
                },
                {
                    // Convert user field to ObjectId for lookup if stored as string
                    $addFields: {
                        userObjId: { $toObjectId: "$user" }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userObjId",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
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
                            _id: 1
                        }
                    }
                }
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
        filename?: string
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
                    await this.cloudinary.deleteImage(publicId)
                }

                const { url, publicId: newPublicId } = await this.cloudinary.uploadFile(file);
                imageUrl = url;
                publicId = newPublicId;
            }

            //console.log("image" , imageUrl , publicId)

            // Update the user
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        ...addProfileDto,
                        imageUrl,
                        publicId,
                    },
                },
                { new: true, runValidators: true }
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

    async getAllPosts(): Promise<Post[]> {
        const posts = await this.postModel.aggregate([

            {
                $addFields: {
                    userObjId: { $toObjectId: "$user" }
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "userObjId",
                    foreignField: "_id",
                    as: "userPostDetails"
                }
            },
            { $unwind: "$userPostDetails" },
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
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        return posts;
    }

    async createPost(userId: string, createPostDto: CreatePostDto, imageBuffer?: Buffer, filename?: string): Promise<any> {
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
                const { url, publicId: cloudinaryId } = await this.cloudinary.uploadFile(file);
                imageUrl = url;
                publicId = cloudinaryId;
            }

            const newPost = new this.postModel({
                user: userId,
                ...createPostDto,
                postImageUrl: imageUrl,
                postImagePublicId: publicId
            })

            await newPost.save();

            const savedPost = await newPost.save();

            if (!savedPost) {
                throw new InternalServerErrorException('Failed to create post');
            }

            return savedPost;

        } catch (error) {
            throw new InternalServerErrorException('Failed to create Post ' + error);
        }
    }

    async createCodingProfile(
        userId: string,
        codingProfileDto: CodingProfileDto,
        imageBuffer?: Buffer,
        filename?: string
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

                const { url } = await this.cloudinary.uploadFile(file);
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
                { new: true, runValidators: true }
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
            throw new InternalServerErrorException('Failed to create Coding Profile: ' + error.message);
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
            throw new InternalServerErrorException('Failed to fetch Coding Profile: ' + error.message);
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
                    }, {
                    headers: { 'Content-Type': 'application/json' },
                });

                const data = response.data;
                // console.log('LeetCode Data:', data);

                return data;

            } catch (err) {
                throw new InternalServerErrorException(
                    'Failed to fetch LeetCode profile: ' + err.message,
                );
            }


        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch Leetcode Profile: ' + error.message);
        }
    }

    async getUserProfileData(profileId: string): Promise<User> {
        try {
            if (!profileId) {
                throw new ConflictException('User ID not provided');
            }

            const userProfileData = await this.userModel.findById(profileId).select('-password');
            if (!userProfileData) {
                throw new NotFoundException('User not found');
            }

            return userProfileData;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch user profile: ' + error.message);
        }
    }

   async followUser(userId: string, followId: string): Promise<any> {
  try {
    if (userId === followId) {
      throw new ConflictException("You cannot follow yourself");
    }

    const user = await this.userModel.findById(userId);
    const followUser = await this.userModel.findById(followId);

    if (!user || !followUser) {
      throw new NotFoundException("User not found");
    }

    const followObjectId = new Types.ObjectId(followId);
    const userObjectId = new Types.ObjectId(userId);

    const alreadyFollowing = user.following.some(
      (id) => id.toString() === followId
    );

    if (alreadyFollowing) {
      return { message: "User already followed" };
    }

    user.following.push(followObjectId);
    followUser.follower.push(userObjectId);

    await user.save();
    await followUser.save();

    return { message: "Followed successfully" };
  } catch (error) {
    throw new InternalServerErrorException(
      'Failed to follow user: ' + error.message
    );
  }
}


}
