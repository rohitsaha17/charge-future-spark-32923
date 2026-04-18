import DOMPurify from 'dompurify';

// Allowed tags/attributes for blog content. Enough for rich formatting,
// images, code, links, tables, and our custom gallery/figure blocks —
// nothing that can execute JS.
const BLOG_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'a', 'b', 'i', 'em', 'strong', 'u', 's', 'del', 'ins', 'mark', 'sub', 'sup',
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code', 'kbd',
    'img', 'figure', 'figcaption',
    'div', 'span',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel',
    'src', 'alt', 'title', 'loading', 'decoding',
    'class', 'style',
    'width', 'height',
    'colspan', 'rowspan',
    'id',
  ],
  ALLOW_DATA_ATTR: false,
  // Block javascript:, vbscript:, data: (except for images), etc.
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  // Drop anything that survives but had an event handler
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'oninput', 'onsubmit', 'formaction'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'link', 'meta', 'base'],
  // Ensure anchor targets always open with noopener
  ADD_ATTR: [],
};

// When DOMPurify generates an <a target="_blank">, strip it of rel reuse:
// add noopener+noreferrer so tabnabbing isn't possible.
if (typeof window !== 'undefined' && 'addHook' in DOMPurify) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/** Sanitize blog HTML for safe rendering via dangerouslySetInnerHTML. */
export const sanitizeBlogHtml = (html: string): string =>
  DOMPurify.sanitize(html || '', BLOG_CONFIG) as unknown as string;

/** Sanitize HTML that's about to be pasted/inserted into the contentEditable
 *  editor. Same ruleset — prevents clipboard-borne XSS. */
export const sanitizePasteHtml = sanitizeBlogHtml;
