import { LitElement, html, css, nothing } from './base.js';

const DETAIL_BASE = '/products/product.html?slug=';
const QUOTE_BASE = '/request-sample-quote.html';

export class PetsProductCard extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    requestSource: { type: String, attribute: 'request-source' },
    detailHrefBase: { type: String, attribute: 'detail-href-base' },
    product: { attribute: false },
  };

  constructor() {
    super();
    this.variant = 'catalog';
    this.requestSource = '';
    this.detailHrefBase = DETAIL_BASE;
    this.product = null;
  }

  set product(value) {
    const old = this._product;
    this._product = value ?? null;
    this.requestUpdate('product', old);
  }

  get product() {
    return this._product;
  }

  #slug() {
    return this.product?.slug ?? '';
  }

  #detailHref() {
    const slug = this.#slug();
    if (!slug) return '#';
    return `${this.detailHrefBase}${encodeURIComponent(slug)}`;
  }

  #quoteHref() {
    const slug = this.#slug();
    const item = this.product ?? {};
    const prodValue = encodeURIComponent(
      item.w_request_quote_product_value || slug || '',
    );
    const sourceKey =
      this.requestSource ||
      item.w_request_quote_source_key ||
      `${this.variant}-card-${slug}`;
    const source = encodeURIComponent(sourceKey);
    const url = new URL(QUOTE_BASE, window.location.origin);
    url.searchParams.set('products', prodValue);
    if (source) url.searchParams.set('source', source);
    return `${url.pathname}${url.search}`;
  }

  #buildMedia() {
    const imgUrl =
      this.product?.w_card_image_url ||
      (this.product?.name
        ? `/products/assets/${(this.product.name || '').replace(/\s+/g, '')}.jpg`
        : '');
    const alt = this.product?.w_card_image_alt || this.product?.name || '';
    if (!imgUrl) {
      return html`<div class="ph" aria-hidden="true">Image coming soon</div>`;
    }
    const img = html`<img src=${imgUrl} alt=${alt} loading="lazy" decoding="async" />`;
    if (this.variant === 'featured') {
      return html`<figure class="card__media">${img}</figure>`;
    }
    return html`
      <a class="card__image" href=${this.#detailHref()} aria-label=${alt}>
        ${img}
      </a>
    `;
  }

  render() {
    const item = this.product;
    if (!item) return nothing;
    const highlights = item.w_card_highlights_text ?? '';
    const packaging = item.w_packaging_note ?? '';
    const moq = item.w_home_moq_text ?? '';
    const intro = item.w_home_intro_text ?? '';
    const badge = item.w_home_badge_label || item.category_label || '';

    return html`
      <article class="card col-4" data-variant=${this.variant}>
        ${this.#buildMedia()}
        <div class="card__body">
          ${badge ? html`<span class="badge">${badge}</span>` : nothing}
          <h3 class="card__title">
            <a href=${this.#detailHref()}>${item.w_home_title || item.name}</a>
          </h3>
          ${this.variant === 'featured' && intro
            ? html`<p class="meta">${intro}</p>`
            : null}
          ${highlights && this.variant !== 'featured'
            ? html`<p class="meta">${highlights}</p>`
            : null}
          ${packaging && this.variant !== 'featured'
            ? html`<p class="meta">${packaging}</p>`
            : null}
          ${moq && this.variant === 'featured'
            ? html`<p class="meta">${moq}</p>`
            : null}

          ${this.variant === 'featured'
            ? html`
                <div class="card__links">
                  <a class="link-btn" href=${this.#detailHref()}>View Specs ›</a>
                  <a class="link-btn" href=${this.#quoteHref()}>Request Quote</a>
                </div>
              `
            : html`
                <div class="card__actions">
                  <a class="btn btn-ghost" href=${this.#detailHref()}>View Details</a>
                  <a class="btn btn-primary" href=${this.#quoteHref()}>
                    ${item.w_cta_primary_label || 'Request Quote'}
                  </a>
                </div>
              `}
        </div>
      </article>
    `;
  }

  static styles = css`
    :host {
      display: contents;
    }

    .card {
      background: var(--paper, #fff);
      border: 1px solid var(--line, #e6e3db);
      border-radius: var(--radius, 14px);
      box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.06));
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card__media,
    .card__image {
      aspect-ratio: 4 / 3;
      background: #f0eee9;
      border-bottom: 1px solid var(--line, #e6e3db);
      display: grid;
      place-items: center;
    }

    .card__image {
      text-decoration: none;
    }

    .card__media img,
    .card__image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: calc(var(--radius, 14px) - 4px);
    }

    .ph {
      width: 100%;
      height: 100%;
      font-size: 14px;
      color: var(--ink-muted, #58625c);
    }

    .card__body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1 1 auto;
    }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      background: color-mix(in oklab, var(--accent, #234b3b), #fff 40%);
      color: var(--accent, #234b3b);
      font-size: 13px;
      font-weight: 600;
    }

    .card__title {
      margin: 0;
      font-size: 20px;
    }

    .card__title a {
      color: inherit;
      text-decoration: none;
    }

    .meta {
      font-size: 15px;
      color: var(--ink-muted, #58625c);
      margin: 0;
    }

    .card__actions,
    .card__links {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: auto;
    }

    .link-btn {
      font-weight: 700;
      color: var(--accent, #234b3b);
    }
  `;
}

customElements.define('pets-product-card', PetsProductCard);
