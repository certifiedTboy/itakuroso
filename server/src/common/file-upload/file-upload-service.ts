import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileUploadService {
  private cloudinary: typeof cloudinary;
  constructor(private configService: ConfigService) {
    const cloudinaryApiKey =
      this.configService.get<string>('CLOUDINARY_API_KEY');
    const cloudinaryApiSecret = this.configService.get<string>(
      'CLOUDINARY_API_SECRET',
    );
    const cloudinaryCloudName = this.configService.get<string>(
      'CLOUDINARY_CLOUD_NAME',
    );

    cloudinary.config({
      api_key: cloudinaryApiKey,
      api_secret: cloudinaryApiSecret,
      cloud_name: cloudinaryCloudName,
    });
    this.cloudinary = cloudinary;
  }

  /**
   * @method uploadFileOnCloud
   * @description Uploads a file to the cloudinary storage.
   * @param {Buffer} file - The data transfer object containing the file to be uploaded.
   */
  async uploadFileToCloud(file: Buffer) {
    try {
      const promise = new Promise((resolve: any, reject: any) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          { folder: 'chat_files' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        // For buffer uploads
        if (file instanceof Buffer) {
          uploadStream.end(file);
        }
      });

      const result = await promise.then(
        (data: { secure_url: string; public_id: string }) => {
          const { secure_url, public_id } = data;
          return { secureUrl: secure_url, publicId: public_id };
        },
      );

      return { secureUrl: result.secureUrl, publicId: result.publicId };
    } catch (error: unknown) {
      console.log(error);
    }
  }

  /**
   * @method deleteUploadedFile
   * @description Deletes a file from the cloudinary storage.
   * @param {string} publicId - The public ID of the file to be deleted
   */

  async deleteUploadedFile(publicId: string) {
    const result = (await this.cloudinary.uploader.destroy(
      `chat_files/${publicId}`,
    )) as { result: string };

    return result;
  }
}
