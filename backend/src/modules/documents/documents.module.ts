import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { StorageService } from '../storage/storage.service';
import { MailModule } from '../mail/mail.module';
import {
  CreateDocumentService,
  CreateDocumentTypeService,
  DeleteDocumentTypeService,
  DownloadDocumentService,
  ListDocumentsService,
  ListDocumentTypesService,
  NotifyDocumentsService,
} from './services';

@Module({
  imports: [MailModule],
  controllers: [DocumentController],
  providers: [
    CreateDocumentService,
    CreateDocumentTypeService,
    ListDocumentTypesService,
    ListDocumentsService,
    DownloadDocumentService,
    DeleteDocumentTypeService,
    NotifyDocumentsService,
    StorageService,
  ],
})
export class DocumentModule {}
