import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { PatientModule } from './patient/patient.module';
import { ScanModule } from './scan/scan.module';
import { S3Module } from './s3/s3.module';
import { AnalyticsModule } from './analytics/analytics.module';

import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from './database/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLUpload } from 'graphql-upload-minimal';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GraphQLJSON } = require('graphql-type-json');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule,
    UserModule,
    PatientModule,
    ScanModule,
    S3Module,
    AnalyticsModule,

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./src/**/*.graphql'],
      playground: true,
      introspection: true,
      debug: true,
      context: ({ req }) => ({ req }),
      resolvers: {
        JSON: GraphQLJSON,
        ScanType: {
          XRAY: 'xray',
          CT: 'ct',
          MRI: 'mri',
        },
        ScanStatus: {
          PENDING: 'pending',
          UPLOADING: 'uploading',
          UPLOADED: 'uploaded',
          PROCESSING: 'processing',
          PROCESSED: 'processed',
          FAILED: 'failed',
        },
        AIResultStatus: {
          PENDING: 'pending',
          COMPLETED: 'completed',
          FAILED: 'failed',
        },
      },
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
  ],

  controllers: [AppController],
  providers: [
    AppService,
    // Register GraphQLUpload as a scalar
    {
      provide: 'Upload',
      useValue: GraphQLUpload,
    },
  ],
})
export class AppModule {}
