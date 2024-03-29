import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoginRequestDto } from '../auth/login/dto/login-requestdto';
import { LoginResponseDto } from '../auth/login/dto/login-response.dto';
import { createResponse } from '../generic/create-response';
import { UserDto } from './dto/user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
    constructor(
        @Inject('USER_REPOSITORY')
        private readonly userRepository: Repository<User>,
    ) {}

    /* DB에서 id로 사용자 찾기 */
    async findUser(phoneNumber: string): Promise<UserDto> {
        return await this.userRepository
            .createQueryBuilder()
            .select('id')
            .where('phone_number = :phoneNumber', { phoneNumber })
            .getRawOne()
    }

    /* 신규 가입*/
    async registerUser(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
        const newUser = await this.userRepository.save(
            User.registerNewUser(loginDto)
        );

        delete newUser.createdAt;
        
        return createResponse([
            'login', 201, '신규 사용자 로그인', newUser
        ]);
    }
}
