import DOMPurify from 'dompurify';

// Reforça rel="noopener noreferrer" em qualquer link com target="_blank" que
// sobreviver à sanitização — evita reverse tabnabbing mesmo se o HTML de
// origem esquecer o rel (import-legado.mjs já inclui, mas não dá pra confiar
// nisso pra todo HTML autoral futuro).
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

// HTML é autoral (hoje só MASTER escreve), mas sanitizamos mesmo assim:
// defesa em profundidade contra um MASTER comprometido e contra o dia em
// que Admins também puderem publicar conteúdo.
export function sanitizeHtml(html: string | null | undefined): string {
  return DOMPurify.sanitize(html ?? '');
}
