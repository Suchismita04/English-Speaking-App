import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";




@Module({
    imports:[
        UserModule,
        PassportModule,
        JwtModule.register({

            secret:'',// will update
            signOptions:{expiresIn:'5m'}
        })
    ],
    controllers: [],
    providers: [],
})

export class AuthModule{}