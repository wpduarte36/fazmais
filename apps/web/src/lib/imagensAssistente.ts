import type { MarcaPublica } from '@fazmais/shared';
import fabinhoFigura from '../assets/fabinho.webp';
import fabinhoAvatar from '../assets/fabinho-avatar.webp';

export interface ImagensAssistente {
  figura: string;
  avatar: string;
  // Sem avatar próprio, o avatar é a figura de corpo inteiro: posicionar no
  // topo pra o círculo pegar o rosto.
  avatarPosicao: 'object-center' | 'object-top';
}

// Empresa sem imagem nenhuma = Fabinho. Com só a figura, o avatar sai dela.
export function imagensDoAssistente(
  marca: Pick<MarcaPublica, 'assistenteImagemUrl' | 'assistenteAvatarUrl'>,
): ImagensAssistente {
  const figura = marca.assistenteImagemUrl;
  const avatar = marca.assistenteAvatarUrl;
  if (!figura && !avatar) return { figura: fabinhoFigura, avatar: fabinhoAvatar, avatarPosicao: 'object-center' };
  return {
    figura: figura ?? avatar!,
    avatar: avatar ?? figura!,
    avatarPosicao: avatar ? 'object-center' : 'object-top',
  };
}
