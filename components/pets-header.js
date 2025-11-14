import { LitElement, html, css } from './base.js';

const DEFAULT_LINKS = [
  { label: 'Products', href: '/products/index.html', key: 'products' },
  { label: 'Quality & Compliance', href: '/quality.html', key: 'quality' },
  { label: 'Sourcing & Logistics', href: '/logistics.html', key: 'logistics' },
  { label: 'Resources', href: '/resources/index.html', key: 'resources' },
];

export class PetsHeader extends LitElement {
  static properties = {
    logoSrc: { type: String, attribute: 'logo-src' },
    logoAlt: { type: String, attribute: 'logo-alt' },
    homeHref: { type: String, attribute: 'home-href' },
    activePage: { type: String, attribute: 'active-page' },
    ctaLabel: { type: String, attribute: 'cta-label' },
    ctaHref: { type: String, attribute: 'cta-href' },
    variant: { type: String, reflect: true },
    showCta: { type: Boolean, attribute: 'show-cta', reflect: true },
    navLinks: {
      attribute: 'nav-links',
      converter: {
        fromAttribute(value) {
          if (!value) return null;
          try {
            return JSON.parse(value);
          } catch (err) {
            console.warn('pets-header: invalid nav-links JSON', err);
            return null;
          }
        },
      },
    },
  };

  constructor() {
    super();
    this.logoSrc = '/assets/logo-wordmark.png';
    this.logoAlt = 'Planet Earth Treasures';
    this.homeHref = '/';
    this.activePage = '';
    this.ctaLabel = 'Request Samples/Quote';
    this.ctaHref = '/request-sample-quote.html';
    this.variant = 'transparent';
    this.showCta = true;
    this._navLinks = DEFAULT_LINKS;
  }

  set navLinks(value) {
    const normalized = this.#normalizeLinks(value);
    const old = this._navLinks;
    this._navLinks = normalized;
    this.requestUpdate('navLinks', old);
  }

  get navLinks() {
    return this._navLinks ?? DEFAULT_LINKS;
  }

  #normalizeLinks(value) {
    if (!value) return DEFAULT_LINKS;
    const arr = Array.isArray(value) ? value : DEFAULT_LINKS;
    return arr
      .map((link) => ({
        label: link.label ?? '',
        href: link.href ?? '#',
        key:
          link.key ??
          (link.label ? link.label.toLowerCase().replace(/\s+/g, '-') : ''),
      }))
      .filter((link) => !!link.label);
  }

  render() {
    return html`
      <header class="site" role="banner">
        <div class="site__grid wrap">
          <a class="site__logo" href=${this.homeHref} aria-label=${this.logoAlt}>
            <img src=${this.logoSrc} alt=${this.logoAlt} width="220" height="60" />
          </a>
          <div class="site__nav">
            <nav aria-label="Primary">
              <ul>
                ${this.navLinks.map((link) => this.#renderNavLink(link))}
              </ul>
            </nav>
            <div class="actions">
              <slot name="actions"></slot>
              ${this.showCta && this.ctaHref
                ? html`
                    <a class="cta-header" href=${this.ctaHref}>
                      ${this.ctaLabel}
                    </a>
                  `
                : null}
            </div>
          </div>
          <div class="site__spacer" aria-hidden="true"></div>
        </div>
      </header>
    `;
  }

  #renderNavLink(link) {
    const isActive =
      !!this.activePage && this.activePage.toLowerCase() === link.key;
    return html`
      <li>
        <a
          href=${link.href}
          aria-current=${isActive ? 'page' : 'false'}
          ?data-active=${isActive}
        >
          ${link.label}
        </a>
      </li>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .site {
      position: sticky;
      top: 0;
      z-index: 50;
      background: transparent;
      border-bottom: none;
      backdrop-filter: none;
    }

    :host([variant='frosted']) .site {
      background: color-mix(in srgb, var(--bg, #f3eee3) 90%, #fff 10%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      backdrop-filter: blur(10px);
    }

    .site__grid {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: clamp(10px, 3vw, 24px);
      padding: clamp(4px, 1.5vw, 16px);
    }

    .site__logo {
      display: inline-flex;
      align-items: center;
      background: color-mix(in oklab, var(--paper, #fff), var(--bg, #f3eee3) 25%);
      padding: 6px 14px;
      border-radius: var(--radius, 14px);
      border: 1px solid var(--line, #e6e3db);
      box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.06));
    }

    .site__logo img {
      width: clamp(120px, 18vw, 220px);
      height: auto;
      display: block;
    }

    .site__nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      background: color-mix(in oklab, var(--paper, #fff), var(--bg, #f3eee3) 25%);
      padding: clamp(8px, 1.5vw, 16px);
      border-radius: var(--radius, 14px);
      border: 1px solid var(--line, #e6e3db);
      box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.06));
    }

    nav {
      flex: 1 1 auto;
    }

    nav ul {
      display: flex;
      gap: 18px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    nav a {
      font-weight: 600;
      color: var(--ink, #1f2a24);
      opacity: 0.92;
      text-decoration: none;
    }

    nav a[data-active] {
      opacity: 1;
      text-decoration: underline;
      text-decoration-color: var(--accent, #234b3b);
      text-decoration-thickness: 2px;
      text-underline-offset: 6px;
    }

    .actions {
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }

    .cta-header {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--accent, #234b3b);
      color: #fff;
      border-radius: 999px;
      padding: 10px 18px;
      border: 1px solid color-mix(in oklab, #fff, var(--accent, #234b3b) 70%);
      box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.06));
      text-decoration: none;
      font-weight: 600;
      white-space: nowrap;
    }

    .cta-header:hover {
      text-decoration: none;
    }

    .site__spacer {
      height: 1px;
      width: 1px;
      opacity: 0;
    }

    @media (max-width: 768px) {
      .site__grid {
        grid-template-columns: auto 1fr;
        gap: 8px;
      }

      .site__logo {
        justify-content: center;
      }

      .site__nav {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      nav ul {
        flex-direction: column;
        gap: 6px;
      }

      .cta-header {
        display: none;
      }
    }
  `;
}

customElements.define('pets-header', PetsHeader);
