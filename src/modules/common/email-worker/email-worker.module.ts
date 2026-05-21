// src/modules/common/email-worker/email-worker.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailDeliveryService } from './email-delivery.service';
import { EMAIL_WORKER_TOKENS, type EmailDeliveryOptions } from './email-worker.tokens';

@Module({
  providers: [
    {
      provide: EMAIL_WORKER_TOKENS.DELIVERY_OPTIONS,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): EmailDeliveryOptions => ({
        runAsUser: configService.get<string>('EMAIL_SEND_AS_USER')?.trim() || undefined,
        sendmailPath: '/usr/sbin/sendmail',
      }),
    },
    EmailDeliveryService,
  ],
  exports: [EmailDeliveryService],
})
export class EmailWorkerModule {}
