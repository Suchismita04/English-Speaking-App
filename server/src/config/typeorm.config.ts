import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
 

  return {
    type: 'mssql',
    host: 'localhost',
    port: parseInt(configService.get<string>('DB_PORT') ?? '1433', 10),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: true,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
};
