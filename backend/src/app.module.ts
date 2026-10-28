import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './data-source';
import { ClientModule } from './modules/client/client.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { HealthController } from './health.controller';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { DocumentModule } from './modules/documents/documents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { LegalProcessModule } from './modules/legal-process/legal-process.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { AuditModule } from './modules/audit/audit.module';
import { PrivacyModule } from './modules/privacy/privacy.module';
import { EmailLogModule } from './modules/email-log/email-log.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ScheduleModule.forRoot(),
    ClientModule,
    UserModule,
    AuthModule,
    DocumentModule,
    DashboardModule,
    ReportsModule,
    AlertsModule,
    LegalProcessModule,
    TicketModule,
    AuditModule,
    PrivacyModule,
    EmailLogModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
