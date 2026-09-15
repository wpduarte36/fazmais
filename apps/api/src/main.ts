import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import type { ServerResponse } from 'http';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { UPLOADS_DIR } from './uploads/uploads-dir';

// CORS_ORIGIN aceita uma URL ou várias separadas por vírgula (ex: domínio de
// produção + domínio de preview da Vercel). Local, cai no default do Vite.
function parseCorsOrigins(): string[] {
  return (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Atrás do proxy da Railway (TLS termina na borda, o container recebe HTTP
  // + X-Forwarded-*). Sem isto, req.protocol volta 'http' e o UploadsController
  // gravaria URLs http:// (bloqueadas como mixed content no site HTTPS); o
  // rate limiter também precisa disto pra ler o IP real do cliente.
  app.set('trust proxy', 1);

  // Cabeçalhos de segurança básicos (sem helmet pra não puxar dependência):
  // nosniff impede o navegador de "adivinhar" um Content-Type executável;
  // DENY em frame bloqueia clickjacking; a CSP restritiva vale principalmente
  // pro HTML estático servido de /uploads (defesa extra além da validação de
  // upload). HSTS só faz sentido sob HTTPS.
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'",
    );
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }
    next();
  });

  app.use(cookieParser());
  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Imagens de capa e PDFs enviados via UploadsController ficam aqui e são
  // servidos como estático. nosniff + Content-Disposition impedem que um
  // arquivo com conteúdo malicioso rode como HTML na origem da API (onde
  // fica o cookie de refresh) mesmo que a validação de upload falhe um dia.
  app.useStaticAssets(UPLOADS_DIR, {
    prefix: '/uploads/',
    setHeaders: (res: ServerResponse) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; img-src 'self'; object-src 'none'",
      );
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
