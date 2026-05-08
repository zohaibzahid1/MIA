import { Resolver, Query, Context } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Resolver()
@UseGuards(JwtAuthGuard)
export class AnalyticsResolver {
  private readonly logger = new Logger(AnalyticsResolver.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query('myAnalytics')
  async myAnalytics(@Context() ctx: any) {
    const userId = ctx.req.user.id;
    this.logger.log(`[myAnalytics] user=${userId}`);
    return this.analyticsService.getUserAnalytics(userId);
  }
}
