import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/xml',
  'text/xml',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.xlsx', '.xml'];

export const assertAllowedFile = (file: Express.Multer.File) => {
  const extension = extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) && !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new BadRequestException(
      'Tipo de arquivo não permitido. Envie XML, PDF, imagem, Word ou Excel',
    );
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new BadRequestException('O arquivo deve ter no máximo 10 MB');
  }
};
