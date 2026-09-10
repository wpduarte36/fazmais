import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { closeSync, openSync, readSync, unlinkSync } from 'fs';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UPLOADS_DIR } from './uploads-dir';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PDF_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB — mesmo limite do legado

// A extensão do arquivo salvo é decidida AQUI, a partir do mimetype já
// validado — nunca copiada de file.originalname (que o cliente controla).
// Sem isso, um MASTER podia enviar "x.html" com Content-Type: image/png,
// passar no fileFilter e acabar com um .html servido como text/html na
// origem da API (XSS + acesso ao cookie de refresh).
const IMAGE_EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Confere os primeiros bytes do arquivo já gravado contra a assinatura
// esperada — mimetype e extensão são ambos falsificáveis, o conteúdo não.
function assertMagicBytes(
  filePath: string,
  check: (bytes: Buffer) => boolean,
  errorMessage: string,
): void {
  const fd = openSync(filePath, 'r');
  const header = Buffer.alloc(16);
  try {
    readSync(fd, header, 0, 16, 0);
  } finally {
    closeSync(fd);
  }
  if (!check(header)) {
    unlinkSync(filePath);
    throw new BadRequestException(errorMessage);
  }
}

const MAGIC = {
  'image/jpeg': (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b: Buffer) =>
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'image/webp': (b: Buffer) =>
    b.toString('ascii', 0, 4) === 'RIFF' &&
    b.toString('ascii', 8, 12) === 'WEBP',
  'application/pdf': (b: Buffer) => b.toString('ascii', 0, 5) === '%PDF-',
} as const;

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MASTER')
export class UploadsController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, callback) => {
          callback(
            null,
            `${randomUUID()}${IMAGE_EXT_BY_MIME[file.mimetype] ?? ''}`,
          );
        },
      }),
      limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!(file.mimetype in IMAGE_EXT_BY_MIME)) {
          callback(
            new BadRequestException('Envie um arquivo JPEG, PNG ou WebP.'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    assertMagicBytes(
      file.path,
      MAGIC[file.mimetype as keyof typeof MAGIC],
      'O arquivo enviado não é uma imagem JPEG, PNG ou WebP válida.',
    );
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return { url: `${baseUrl}/uploads/${file.filename}` };
  }

  // PDF fica hospedado aqui mesmo e é aberto direto num <iframe> no
  // PdfModal — não precisa de um serviço externo tipo fliphtml5 (que o
  // legado usa) porque o navegador já sabe renderizar PDF nativamente.
  @Post('pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, _file, callback) => {
          callback(null, `${randomUUID()}.pdf`);
        },
      }),
      limits: { fileSize: MAX_PDF_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          callback(new BadRequestException('Envie um arquivo PDF.'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadPdf(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    assertMagicBytes(
      file.path,
      MAGIC['application/pdf'],
      'O arquivo enviado não é um PDF válido.',
    );
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return { url: `${baseUrl}/uploads/${file.filename}` };
  }
}
