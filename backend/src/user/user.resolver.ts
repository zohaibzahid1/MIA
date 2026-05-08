import { Resolver, Query, Mutation, Args ,Int, ResolveField, Parent, Context} from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload-minimal'; 
import { RolesGuard } from 'src/guards/roles.guard';
import { HROnly, ManagerOrHR, Roles } from 'src/guards/roles.decorator';
import { UserRole } from 'src/guards/roles.decorator';
//import { UpdateUserInput } from '../dto/update-user.input';


@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}





}