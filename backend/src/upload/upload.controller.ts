import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/auth/jwt-http.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    const result = this.uploadService.uploadFile(file);
    return result;
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return this.uploadService.deleteImage(id);
  }
}
