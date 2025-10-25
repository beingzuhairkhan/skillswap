import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload file buffer to Cloudinary
   * Returns both URL and public_id
   */
  async uploadFile(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'skillswap' },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result?.secure_url || 'N/A',
            publicId: result?.public_id || 'N/A',
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Delete image from Cloudinary using its public_id
   */
  async deleteImage(publicId: string): Promise<{ result: string }> {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res; // { result: 'ok' } or { result: 'not found' }
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
}
