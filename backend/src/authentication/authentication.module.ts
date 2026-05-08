import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationController } from './authentication.controller';
import { UserModule } from '../user/user.module'; // Import the user module to access user services
import { PassportModule } from '@nestjs/passport'; // Import PassportModule for authentication strategies
import { GoogleStrategy } from './strategy/google.strategy'; // Import the Google strategy for OAuth authentication
import { JwtStrategy } from './strategy/jwt.strategy'; // Import the JWT strategy for JWT authentication
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [AuthenticationResolver, AuthenticationService, GoogleStrategy, JwtStrategy],
  controllers: [AuthenticationController],
  imports: 
  [   
      PassportModule,
      UserModule, // Import the user module to access user services
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_ACCESS_SECRET'),
          signOptions: { expiresIn: '24h' },
        }),
        inject: [ConfigService],
      }),
    ], 
})
export class AuthenticationModule {}