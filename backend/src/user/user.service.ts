import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { createUserDto } from 'src/dto/createUserDto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

  

    async findOne(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    // This method finds an existing user by email or creates a new one if it doesn't exist.
    // used in google.strategy.ts
    async findOrCreateOAuthUser(profile: createUserDto): Promise<User> {
        let user = await this.userRepository.findOne({ where: { email: profile.email } });
        if (!user) {
            user = this.userRepository.create(profile);
            await this.userRepository.save(user);
        } else {
            // Update existing user with new Google info if missing
            let updated = false;
            if (profile.googleId && !user.googleId) {
                user.googleId = profile.googleId;
                updated = true;
            }
            if (profile.avatar && !user.avatar) {
                user.avatar = profile.avatar;
                updated = true;
            }
             if (profile.name && !user.name) {
                user.name = profile.name;
                updated = true;
            }
            if (updated) {
                await this.userRepository.save(user);
            }
        }
        return user;
    }
}