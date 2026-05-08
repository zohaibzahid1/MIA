import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthenticationService } from './authentication.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
@Resolver()
export class AuthenticationResolver {
  constructor(
    private readonly authenticationService: AuthenticationService,
  ) {}
  // Will return the Google authentication URL that the frontend will use to redirect the user
  @Query(() => String)
  getGoogleAuthUrl(): string {
    try {
      console.log('Fetching Google Auth URL');
      const url = this.authenticationService.loginUrl('google');
      console.log('Google Auth URL:', url);
      
      if (!url) {
        throw new Error('Failed to get Google authentication URL');
      }
      
      return url;
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      throw error;
    }
  }


   @Query()
   @UseGuards(JwtAuthGuard)
   validateToken(@Context() context: any) {
    const user = context.req.user;
    if (!user) {
      return {
        isValid: false,
        message: 'Token is invalid or expired',
      };
    }
    return {
      isValid: true,
      message: 'Token is valid',
      user: user
    };
  }  
}