
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { v5 as uuidv5 } from 'uuid';

export const FileInterceptor = {
  limits: {
    fileSize: 2512000,
  },

  fileFilter: (req: any, file: any, callback: any) => {
    if (
      file.mimetype.match(
        /\/(pdf|vnd.openxmlformats-officedocument.wordprocessingml.document|plain|rtf)$/,
      )
    ) {
      callback(null, true);
    } else {
      callback(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },

  storage: diskStorage({
    // Указываем куда записывать
    destination: (req: any, file: any, callback: any) => {
      const userID = req.user.id || req.params.id;
      // Есть ли ID
      if (userID === undefined) {
        callback(new NotFoundException(`Not found USER ID`, ''));
      } else {
        const uploadPath = './public/attached/' + userID + '/docs';
        const fileName =
          uuidv5(file.originalname, userID) + extname(file.originalname);
        file.dest =
          'https://media.cleverdeus.com/attached/' + userID + '/docs' + fileName;
        file.id = userID;
        try {
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath);
          }
          const fullPathToFile = `${uploadPath}/${fileName}`;
          if (existsSync(fullPathToFile)) {
            unlinkSync(fullPathToFile);
          }
        } catch (error) {
          throw error;
        }
        if (!existsSync(uploadPath)) {
          callback(
            new BadRequestException(
              `There is no such directory of the user. Contact your administrator.`,
              '',
            ),
          );
        }

        callback(null, uploadPath);
      }
    },

    filename: (req: any, file: any, callback: any) => {
      const userID = req.user.id || req.params.id;
      const fileName =
        uuidv5(file.originalname, userID) + extname(file.originalname);
      callback(null, fileName);
    },
  }),
};
