import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { StorageService } from '../storage/storage.service';
import { MailService } from '../mail/mail.service';
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
    MailService,
  ],
})
export class DocumentModule {}
