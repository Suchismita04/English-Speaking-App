import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";




@Module({
    imports:[
        UserModule,
        PassportModule,
        JwtModule.register({
            secret:'',// will update
            signOptions:{expiresIn:'5m'}
        })
    ],
    controllers: [AuthController],
    providers: [AuthService],
})

export class AuthModule{}