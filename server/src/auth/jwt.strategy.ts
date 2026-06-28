import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        const jwtSecret = configService.get<string>('ACCESS_TOKEN_SECRET')

        // console.log('JWT Secret from config:', jwtSecret ? 'SET' : 'NOT SET');

        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
        })
    }

    validate(payload: any): any {
        // console.log('JWT Payload:', payload);
        // console.log('JWT Strategy validate called');
        return {userId: payload.sub, email: payload.email, username: payload.username}
    }
}