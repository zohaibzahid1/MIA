import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    // Get the request object (works for both REST and GraphQL)
    const request = this.getRequest(context);
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user's role is in the required roles
    const hasRole = requiredRoles.some(
      (role) => user.role?.toLowerCase() === role.toLowerCase()
    );
    
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}`
      );
    }

    return true;
  }

  private getRequest(context: ExecutionContext) {
    // Check if this is a GraphQL context
    const gqlContext = GqlExecutionContext.create(context);
    if (gqlContext.getType() === 'graphql') {
      // Extract request from GraphQL context
      return gqlContext.getContext().req;
    }
    
    // For REST endpoints, return the request as usual
    return context.switchToHttp().getRequest();
  }
}
