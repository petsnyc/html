import { LitElement, html, css, nothing } from './base.js';
import './pets-trust-strip.js';

const API_DEFAULT = 'https://pets-products-api.hashmawy.workers.dev';

export class PetsProductDetail extends LitElement {
  static properties = {
    slug: { type: String, reflect: true },
    apiBase: { type: String, attribute: 'api-base' },
    autoSlug: { type: Boolean, attribute: 'auto-slug', reflect: true },
    manageSeo: { type: Boolean, attribute: 'manage-seo', reflect: true },
    quoteLabel: { type: String, attribute: 'quote-label' },
    contactLabel: { type: String, attribute: 'contact-label' },
    backHref: { type: String, attribute: 'back-href' },
    product: { state: true },
    loading: { state: true },
    error: { state: true },
  };

  constructor() {
    super();
    this.slug = '';
    this.apiBase = API_DEFAULT;
    this.autoSlug = false;
    this.manageSeo = false;
    this.quoteLabel = 'Request Samples/Quote';
    this.contactLabel = 'Contact Team';
    this.backHref = '/products/index.html';
    this.product = null;
    this.loading = false;
    this.error = '';
    this._abortController = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.autoSlug && !this.slug) {
      this.slug = this.#deriveSlug();
    }
    if (this.slug) {
      this.load();
    }
  }

  updated(changed) {
    if (changed.has('slug') && this.slug) {
      this.load();
    }
  }

  disconnectedCallback() {
    this._abortController?.abort();
    super.disconnectedCallback();
  }

  #deriveSlug() {
    try {
      const url = new URL(window.location.href);
      const qp = url.searchParams.get('slug');
      if (qp) return qp.toLowerCase();
      const last = url.pathname.split('/').pop() || '';
      if (last && last.endsWith('.html') && last !== 'product.html') {
        return last.replace('.html', '').toLowerCase();
      }
    } catch (err) {
      console.warn('pets-product-detail: unable to derive slug', err);
    }
    return '';
  }

  async load() {
    if (!this.slug || !this.apiBase) {
      this.error = 'No product selected.';
      return;
    }

    this._abortController?.abort();
    this._abortController = new AbortController();

    this.loading = true;
    this.error = '';
    this.product = null;
    const url = this.#buildUrl();

    try {
      const res = await fetch(url, {
        mode: 'cors',
        signal: this._abortController.signal,
      });
      if (res.status === 404) throw new Error('Product not found.');
      if (!res.ok) throw new Error('Failed to load product.');
      const data = await res.json();
      this.product = data?.item ?? null;
      if (!this.product) throw new Error('Product data missing.');
      if (this.manageSeo) {
        this.#applySeo(this.product);
      }
      this.dispatchEvent(
        new CustomEvent('pets:product-loaded', {
          detail: { slug: this.slug, product: this.product },
          bubbles: true,
        }),
      );
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('pets-product-detail', err);
      this.error = err.message || 'Product not found.';
      this.product = null;
      this.dispatchEvent(
        new CustomEvent('pets:product-error', {
          detail: { slug: this.slug, error: err },
          bubbles: true,
        }),
      );
    } finally {
      this.loading = false;
    }
  }

  #buildUrl() {
    const base = this.apiBase.endsWith('/')
      ? this.apiBase.slice(0, -1)
      : this.apiBase;
    return `${base}/api/products/${encodeURIComponent(this.slug)}`;
  }

  #applySeo(item) {
    if (typeof document === 'undefined') return;
    if (item.w_seo_title) document.title = item.w_seo_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', item.w_seo_description || '');
    }
  }

  #buildQuoteHref(item) {
    const slug = this.slug || item?.slug || '';
    const prod = encodeURIComponent(item?.w_request_quote_product_value || slug);
    const src = encodeURIComponent(
      item?.w_request_quote_source_key || `product-${slug}-page`,
    );
    return `/request-sample-quote.html?products=${prod}&source=${src}`;
  }

  #buildContactHref(item) {
    const slug = this.slug || item?.slug || '';
    const prod = encodeURIComponent(item?.w_contact_product_value || slug);
    const src = encodeURIComponent(
      item?.w_request_quote_source_key || `product-${slug}-page`,
    );
    return `/contact.html?product=${prod}&source=${src}`;
  }

  #renderList(items = []) {
    if (!items.length) {
      return html`<li class="muted">Details coming soon.</li>`;
    }
    return items.map((entry) => html`<li>${entry}</li>`);
  }

  #renderHero() {
    const item = this.product;
    if (!item) return nothing;
    return html`
      <section class="hero hero--product">
        <div class="wrap hero__grid">
          <div class="hero__copy">
            <a class="back-link" href=${this.backHref}>&larr; Back to Products</a>
            <p class="eyebrow">${item.category_label ?? ''}</p>
            <h1>${item.name ?? ''}</h1>
            <p class="lead">${item.w_hero_lead ?? ''}</p>
            <ul class="feature-list">
              ${this.#renderList(item.w_hero_features || [])}
            </ul>
            <div class="actions">
              <a class="btn btn-primary" href=${this.#buildQuoteHref(item)}>
                ${item.w_cta_primary_label || this.quoteLabel}
              </a>
              <a class="btn btn-ghost" href=${this.#buildContactHref(item)}>
                ${this.contactLabel}
              </a>
            </div>
            <pets-trust-strip
              .items=${['FSVP/HACCP aligned', 'COA per lot', 'NY/NJ warehousing']}
            ></pets-trust-strip>
          </div>
          <figure class="hero__art">
            ${item.w_hero_image_url
              ? html`
                  <img
                    src=${item.w_hero_image_url}
                    alt=${item.w_hero_image_alt || item.name || ''}
                  />
                `
              : html`<div class="hero__placeholder" aria-hidden="true"></div>`}
            <figcaption class="muted">${item.w_hero_image_caption ?? ''}</figcaption>
          </figure>
        </div>
      </section>
    `;
  }

  #renderInfoCards() {
    const item = this.product;
    if (!item) return nothing;
    const sections = [
      { title: 'Quality Snapshot', data: item.w_quality_snapshot_points },
      { title: 'Applications', data: item.w_applications },
      { title: 'Formats & Logistics', data: item.w_formats_logistics },
    ];

    return html`
      <section class="product-sections">
        <div class="wrap product-grid">
          ${sections.map(
            (section) => html`
              <article class="product-card">
                <h2>${section.title}</h2>
                <ul class="bullet">${this.#renderList(section.data || [])}</ul>
              </article>
            `,
          )}
        </div>
      </section>
    `;
  }

  #renderCta() {
    const item = this.product;
    if (!item) return nothing;
    const heading =
      item.w_cta_bottom_heading || `Ready to source ${item.name || ''}?`;
    const body =
      item.w_cta_bottom_body ||
      'Partner with Planet Earth Treasures for compliant, reliable sourcing.';
    return html`
      <section class="cta-band">
        <div class="wrap cta-band__inner">
          <div>
            <h2>${heading}</h2>
            <p class="muted">${body}</p>
          </div>
          <div class="cta-band__actions">
            <a class="btn btn-primary" href=${this.#buildQuoteHref(item)}>
              ${item.w_cta_bottom_button_label || 'Request Quote'}
            </a>
            <a class="btn btn-ghost" href="/specs-pack.html">Download Specs Pack</a>
          </div>
        </div>
      </section>
    `;
  }

  render() {
    if (!this.slug) {
      return html`<p class="muted wrap">
        No product selected. Provide a <code>slug</code> attribute or use
        <code>auto-slug</code>.
      </p>`;
    }

    if (this.loading) {
      return html`
        <div class="wrap loading">
          <p class="muted">Loading product details…</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="wrap error">
          <p class="muted">${this.error}</p>
        </div>
      `;
    }

    if (!this.product) return nothing;

    return html`
      ${this.#renderHero()} ${this.#renderInfoCards()} ${this.#renderCta()}
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    main & {
      display: contents;
    }

    .hero {
      padding: clamp(28px, 5vw, 52px) 0;
    }

    .hero__grid {
      display: grid;
      gap: clamp(18px, 4vw, 28px);
      grid-template-columns: minmax(0, 1fr) 420px;
    }

    @media (max-width: 880px) {
      .hero__grid {
        grid-template-columns: 1fr;
      }
    }

    .back-link {
      display: inline-flex;
      margin-bottom: 12px;
      color: var(--accent, #234b3b);
      text-decoration: none;
      font-weight: 600;
    }

    .eyebrow {
      color: var(--ink-muted, #58625c);
      margin: 0 0 6px;
      font-weight: 600;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      font-size: 13px;
    }

    h1 {
      margin: 0 0 10px;
      font-size: clamp(28px, 5vw, 40px);
    }

    .lead {
      margin: 0 0 12px;
      color: var(--ink-muted, #58625c);
      font-size: 18px;
    }

    .feature-list {
      margin: 0 0 16px;
      padding-left: 18px;
      color: var(--ink-muted, #58625c);
    }

    .feature-list li::marker {
      content: '– ';
      color: var(--accent, #234b3b);
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 18px;
    }

    .hero__art {
      background: #fdfbf6;
      border: 1px solid var(--line, #e6e3db);
      border-radius: var(--radius, 14px);
      box-shadow: var(--shadow, 0 8px 24px rgba(31, 42, 36, 0.1));
      padding: 18px;
      display: grid;
      gap: 12px;
    }

    .hero__art img,
    .hero__placeholder {
      width: 100%;
      border-radius: 12px;
      height: auto;
      object-fit: cover;
      box-shadow: 0 12px 24px rgba(31, 42, 36, 0.12);
      background: #ede7da;
      min-height: 220px;
    }

    .product-grid {
      display: grid;
      gap: clamp(18px, 5vw, 28px);
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      padding: clamp(28px, 5vw, 52px) 0;
    }

    .product-card {
      background: var(--paper, #fff);
      border: 1px solid var(--line, #e6e3db);
      border-radius: var(--radius, 14px);
      box-shadow: var(--shadow, 0 8px 24px rgba(31, 42, 36, 0.1));
      padding: clamp(18px, 4vw, 28px);
    }

    .product-card h2 {
      margin-top: 0;
    }

    .product-card ul {
      margin: 0;
      padding-left: 18px;
      color: var(--ink-muted, #58625c);
    }

    .cta-band {
      background: color-mix(in oklab, var(--accent, #234b3b), #000 6%);
      color: #f5f7f5;
      border-top: 1px solid color-mix(in oklab, var(--accent, #234b3b), #000 25%);
      border-bottom: 1px solid color-mix(
        in oklab,
        var(--accent, #234b3b),
        #000 25%
      );
      padding: clamp(28px, 5vw, 48px) 0;
    }

    .cta-band h2 {
      margin: 0 0 8px;
      color: #fff;
    }

    .cta-band .muted {
      color: color-mix(in oklab, #fff, #000 20%);
    }

    .cta-band__inner {
      display: grid;
      gap: clamp(16px, 4vw, 32px);
      align-items: center;
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .cta-band__actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .cta-band__actions .btn-primary {
      background: #fff;
      color: var(--accent, #234b3b);
      border-color: color-mix(in oklab, #fff, var(--accent, #234b3b) 35%);
    }

    .cta-band__actions .btn-ghost {
      color: #fff;
      border-color: color-mix(in oklab, #fff, rgba(255, 255, 255, 0) 30%);
    }

    @media (max-width: 720px) {
      .cta-band__inner {
        grid-template-columns: 1fr;
      }

      .cta-band__actions {
        justify-content: flex-start;
      }
    }

    .loading,
    .error {
      padding: clamp(28px, 5vw, 52px) 0;
    }
  `;
}

customElements.define('pets-product-detail', PetsProductDetail);
