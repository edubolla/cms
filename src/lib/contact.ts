import site from '../../content/site.json';

const digits = site.whatsapp.replace(/\D/g, '');

/** Link do botão de contato: WhatsApp se houver número cadastrado, senão e-mail. */
export const contact = digits
  ? {
      href: `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}?text=${encodeURIComponent(site.whatsappMessage)}`,
      external: true,
      label: 'WhatsApp',
    }
  : {
      href: `mailto:${site.email}?subject=${encodeURIComponent('Quero um site para a minha empresa')}`,
      external: false,
      label: 'E-mail',
    };

export { site };
