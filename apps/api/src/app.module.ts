import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { PlanosModule } from './planos/planos.module';
import { CatalogosModule } from './catalogos/catalogos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    PlanosModule,
    CatalogosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
