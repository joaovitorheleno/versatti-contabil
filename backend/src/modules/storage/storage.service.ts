import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import 'multer';

@Injectable()
export class StorageService {
  private readonly basePath =
    process.env.STORAGE_PATH || join(process.cwd(), 'uploads');

  public async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const key = `${folder}/${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    const fullPath = join(this.basePath, key);

    await fs.mkdir(join(fullPath, '..'), { recursive: true });
    await fs.writeFile(fullPath, file.buffer);

    return key;
  }

  public async delete(key: string): Promise<void> {
    await fs.unlink(join(this.basePath, key));
  }

  public getPath(key: string): string {
    return join(this.basePath, key);
  }
}
