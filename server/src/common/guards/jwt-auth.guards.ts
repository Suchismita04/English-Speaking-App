import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { TokenBlacklistService } from "src/auth/token-blacklist.service";


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private blacklistService: TokenBlacklistService, private moduleRef: ModuleRef) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
            // console.log('JWT Guard - err:', err);
            // console.log('JWT Guard - user:', user);
            // console.log('JWT Guard - info:', info);

        if (err || !user) {
            throw err || new UnauthorizedException();
        }

        // Lazily load the service (since constructor injection doesn’t work here)
        if (!this.blacklistService) {
            this.blacklistService = this.moduleRef.get(TokenBlacklistService, { strict: false });
        }
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];

        console.log('JWT Guard - token extracted:', token ? 'YES' : 'NO');
        console.log('JWT Guard - auth header:', request.headers.authorization);

        if (token && this.blacklistService.isBlacklisted(token)) {
            throw new UnauthorizedException('Token has been logged out')
        }

        return user
    }
}