import { LitElement, html, css } from './base.js';

const DEFAULT_NAV = [
  { label: 'Products', href: '/products/index.html' },
  { label: 'Quality & Compliance', href: '/quality.html' },
  { label: 'Sourcing & Logistics', href: '/logistics.html' },
  { label: 'Marbles & Stones', href: '/marbles/index.html', highlight: true },
  { label: 'Resources', href: '/resources/index.html' },
  { label: 'Contact', href: '/contact.html' },
];

export class PetsFooter extends LitElement {
  static properties = {
    brandName: { type: String, attribute: 'brand-name' },
    tagline: { type: String },
    copyrightName: { type: String, attribute: 'copyright-name' },
    logoSrc: { type: String, attribute: 'logo-src' },
    exploreLabel: { type: String, attribute: 'explore-label' },
    contactEmail: { type: String, attribute: 'contact-email' },
    contactLocation: { type: String, attribute: 'contact-location' },
    navLinks: {
      attribute: 'nav-links',
      converter: {
        fromAttribute(value) {
          if (!value) return null;
          try {
            return JSON.parse(value);
          } catch (err) {
            console.warn('pets-footer: invalid nav-links JSON', err);
            return null;
          }
        },
      },
    },
  };

  constructor() {
    super();
    this.brandName = 'Planet Earth Treasures';
    this.tagline =
      'Importer & Wholesale Distributor of Egyptian herbs & botanicals. Based near the Port of NY/NJ.';
    this.copyrightName = 'Planet Earth Treasures LLC';
    this.logoSrc = '/assets/logo-mark-32.png';
    this.exploreLabel = 'Explore';
    this.contactEmail = 'hello@planetearthtreasures.com';
    this.contactLocation = 'USA (NY/NJ)';
    this._navLinks = DEFAULT_NAV;
  }

  set navLinks(value) {
    const normalized = Array.isArray(value) && value.length ? value : DEFAULT_NAV;
    const old = this._navLinks;
    this._navLinks = normalized;
    this.requestUpdate('navLinks', old);
  }

  get navLinks() {
    return this._navLinks ?? DEFAULT_NAV;
  }

  #year() {
    return new Date().getFullYear();
  }

  render() {
    return html`
      <footer role="contentinfo">
        <div class="wrap foot">
          <div>
            <div class="brand">
              <img src=${this.logoSrc} alt="" width="36" height="36" />
              <strong class="brand__name">${this.brandName}</strong>
            </div>
            <p class="small">${this.tagline}</p>
            <p class="small">
              &copy; ${this.#year()} ${this.copyrightName}. All rights reserved.
            </p>
          </div>
          <div>
            <strong>${this.exploreLabel}</strong>
            <div class="explore-nav">
              ${this.navLinks.map(
                (link) => html`
                  <a
                    class=${link.highlight ? 'link-highlight' : ''}
                    href=${link.href}
                    >${link.label}</a
                  >
                `,
              )}
            </div>
          </div>
          <div>
            <strong>Contact</strong><br />
            ${this.contactEmail
              ? html`<span class="small">Email: ${this.contactEmail}</span><br />`
              : null}
            ${this.contactLocation
              ? html`<span class="small">${this.contactLocation}</span>`
              : null}
          </div>
        </div>
      </footer>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    footer {
      border-top: 1px solid var(--line, #e6e3db);
      background: #1f2a24;
      color: #e8efe9;
    }

    .foot {
      display: grid;
      gap: 20px;
      grid-template-columns: 1.2fr 1fr 1fr;
      padding: clamp(24px, 4vw, 36px) 0;
    }

    @media (max-width: 720px) {
      .foot {
        grid-template-columns: 1fr;
      }
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .brand__name {
      font-family: Marcellus, serif;
      font-size: 20px;
      color: #e8efe9;
    }

    .explore-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }

    .explore-nav a {
      color: #e8efe9;
      text-decoration: none;
      font-weight: 500;
    }

    .link-highlight {
      color: var(--accent-2, #c97249);
      font-weight: 600;
    }

    .small {
      font-size: 14px;
      color: #cfd8d2;
      margin: 4px 0;
    }
  `;
}

customElements.define('pets-footer', PetsFooter);
