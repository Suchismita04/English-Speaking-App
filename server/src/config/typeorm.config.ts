import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "process";

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {

  return {
    type: 'mssql',
    host: configService.get<string>('DB_HOST'),
    port: parseInt(configService.get<string>('DB_PORT') ?? '1433', 10),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    entities:[__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
};
