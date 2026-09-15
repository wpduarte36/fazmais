import { ApiError } from '../../../lib/apiClient';
import { getAccessToken } from '../../../lib/tokenStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

// Fora do apiRequest padrão porque upload usa multipart/form-data — o
// browser define o Content-Type (com boundary) sozinho quando o body é
// FormData; setar manualmente quebra o parse no multer.
async function uploadFile(endpoint: string, file: File, errorFallback: string): Promise<{ url: string }> {
  const accessToken = getAccessToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : errorFallback;
    throw new ApiError(message, response.status);
  }

  return data as { url: string };
}

export function uploadImage(file: File): Promise<{ url: string }> {
  return uploadFile('/uploads/image', file, 'Não foi possível enviar a imagem');
}

export function uploadPdf(file: File): Promise<{ url: string }> {
  return uploadFile('/uploads/pdf', file, 'Não foi possível enviar o PDF');
}
