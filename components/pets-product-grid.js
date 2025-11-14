import { LitElement, html, css, nothing } from './base.js';
import './pets-product-card.js';

const API_DEFAULT = 'https://pets-products-api.hashmawy.workers.dev';

export class PetsProductGrid extends LitElement {
  static properties = {
    apiBase: { type: String, attribute: 'api-base' },
    status: { type: String },
    publishStatus: { type: String, attribute: 'publish-status' },
    homeFeatured: { type: Boolean, attribute: 'home-featured', reflect: true },
    limit: { type: Number },
    filters: {
      attribute: 'filters',
      converter: {
        fromAttribute(value) {
          if (!value) return null;
          try {
            return JSON.parse(value);
          } catch (err) {
            console.warn('pets-product-grid: invalid filters JSON', err);
            return null;
          }
        },
      },
    },
    autoLoad: { type: Boolean, attribute: 'auto-load', reflect: true },
    sortBy: { type: String, attribute: 'sort-by' },
    loading: { state: true },
    error: { state: true },
    items: { state: true },
  };

  constructor() {
    super();
    this.apiBase = API_DEFAULT;
    this.status = 'active';
    this.publishStatus = 'published';
    this.homeFeatured = false;
    this.limit = 50;
    this.filters = null;
    this.autoLoad = true;
    this.sortBy = 'name';
    this.loading = false;
    this.error = '';
    this.items = [];
    this._abortController = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.autoLoad) {
      this.load();
    }
  }

  updated(changed) {
    const autoChanged = changed.has('autoLoad');
    const shouldReload =
      changed.has('apiBase') ||
      changed.has('status') ||
      changed.has('publishStatus') ||
      changed.has('homeFeatured') ||
      changed.has('limit') ||
      changed.has('filters') ||
      changed.has('sortBy');

    if ((autoChanged && this.autoLoad) || (this.autoLoad && shouldReload)) {
      this.load();
    }
  }

  disconnectedCallback() {
    this._abortController?.abort();
    super.disconnectedCallback();
  }

  async load() {
    if (!this.apiBase) return;
    this._abortController?.abort();
    this._abortController = new AbortController();

    this.loading = true;
    this.error = '';
    this.dispatchEvent(new CustomEvent('pets:grid-loading', { bubbles: true }));

    const url = this.#buildUrl();

    try {
      const res = await fetch(url, {
        mode: 'cors',
        signal: this._abortController.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      this.items = this.#sortItems(items);
      this.dispatchEvent(
        new CustomEvent('pets:grid-loaded', {
          detail: { count: this.items.length },
          bubbles: true,
        }),
      );
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('pets-product-grid', err);
      this.error = 'Error loading products. Please try again later.';
      this.items = [];
      this.dispatchEvent(
        new CustomEvent('pets:grid-error', { detail: { error: err }, bubbles: true }),
      );
    } finally {
      this.loading = false;
    }
  }

  #buildUrl() {
    const base = this.apiBase.endsWith('/')
      ? this.apiBase.slice(0, -1)
      : this.apiBase;
    const url = new URL('/api/products', base);
    if (this.status) url.searchParams.set('status', this.status);
    if (this.publishStatus)
      url.searchParams.set('publish_status', this.publishStatus);
    if (this.homeFeatured) url.searchParams.set('home_featured', '1');
    if (this.limit) url.searchParams.set('limit', String(this.limit));
    const extra = this.filters || {};
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  #sortItems(items) {
    const sorted = [...items];
    if (this.homeFeatured) {
      sorted.sort((a, b) => {
        const ao = a.w_home_featured_order ?? 0;
        const bo = b.w_home_featured_order ?? 0;
        if (ao !== bo) return ao - bo;
        return (a.name || '').localeCompare(b.name || '');
      });
      return sorted;
    }
    if (this.sortBy === 'category') {
      return sorted.sort((a, b) =>
        (a.category_label || '').localeCompare(b.category_label || ''),
      );
    }
    return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  #renderSkeleton() {
    return html`
      <div class="card skeleton">
        <div class="media"></div>
        <div class="lines">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
  }

  #renderCards() {
    if (!this.items.length) return nothing;
    const variant = this.homeFeatured ? 'featured' : 'catalog';
    return this.items.map(
      (item) => html`
        <pets-product-card
          .product=${item}
          variant=${variant}
          request-source=${this.homeFeatured
            ? `home-featured-${item.slug}`
            : `products-${item.slug}-card`}
        ></pets-product-card>
      `,
    );
  }

  render() {
    const isEmpty = !this.loading && !this.error && this.items.length === 0;
    return html`
      <div
        class="grid product-grid"
        aria-live="polite"
        aria-busy=${this.loading}
      >
        ${this.loading ? this.#renderSkeleton() : this.#renderCards()}
      </div>

      ${this.error
        ? html`
            <div class="status error">
              <slot name="error">
                <p class="muted">${this.error}</p>
              </slot>
            </div>
          `
        : nothing}

      ${isEmpty
        ? html`
            <div class="status empty">
              <slot name="empty">
                <p class="muted">No products available.</p>
              </slot>
            </div>
          `
        : nothing}
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .product-grid {
      display: grid;
      gap: clamp(18px, 4vw, 28px);
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    :host([home-featured]) .product-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }

    .status {
      margin-top: 12px;
    }

    .status p {
      margin: 0;
    }

    .card.skeleton {
      border: 1px solid var(--line, #e6e3db);
      border-radius: var(--radius, 14px);
      background: var(--paper, #fff);
      box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.06));
      animation: pulse 1.6s infinite ease-in-out;
    }

    .card.skeleton .media {
      aspect-ratio: 4 / 3;
      background: color-mix(in srgb, var(--bg, #f3eee3), #fff 50%);
    }

    .card.skeleton .lines {
      padding: 16px;
      display: grid;
      gap: 10px;
    }

    .card.skeleton span {
      height: 12px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--bg, #f3eee3), #fff 30%);
    }

    .card.skeleton span:nth-child(1) {
      width: 70%;
    }
    .card.skeleton span:nth-child(2) {
      width: 90%;
    }
    .card.skeleton span:nth-child(3) {
      width: 60%;
    }

    @keyframes pulse {
      0% {
        opacity: 0.7;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.7;
      }
    }
  `;
}

customElements.define('pets-product-grid', PetsProductGrid);
