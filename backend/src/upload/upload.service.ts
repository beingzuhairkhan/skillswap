import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { PinataSDK } from "pinata";

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
     this.pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT!,
      pinataGateway: process.env.PINATA_GATEWAY,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'skillswap', resource_type: 'auto' },
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

  async deleteImage(publicId: string): Promise<{ result: string }> {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res;
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async uploadPfp(
    file: Express.Multer.File,
  ): Promise<{ cid: string; url: string }> {
    try {
      const pinataFile = new File(
        [new Uint8Array(file.buffer)],
        file.originalname,
        {
          type: file.mimetype,
        },
      );

      const upload = await this.pinata.upload.public.file(pinataFile);

      return {
        cid: upload.cid,
        url: `https://${process.env.PINATA_GATEWAY}/ipfs/${upload.cid}`,
      };
    } catch (error) {
      throw new Error(`PFP upload failed: ${error.message}`);
    }
  }
}
