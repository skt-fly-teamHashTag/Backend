import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from './auth.service';
import { UserModule } from "../user/user.module";
import { HttpModule } from "@nestjs/axios/dist";

@Module ({
    imports: [
        UserModule,
        HttpModule.register({
            timeout: 3000,
            maxRedirects: 3
        }) 
    ],
    controllers: [AuthController],
    providers: [AuthService]
})

export class AuthModule {}