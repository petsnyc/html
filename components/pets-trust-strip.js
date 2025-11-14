import { LitElement, html, css } from './base.js';

export class PetsTrustStrip extends LitElement {
  static properties = {
    items: {
      attribute: 'items',
      converter: {
        fromAttribute(value) {
          if (!value) return null;
          try {
            return JSON.parse(value);
          } catch (err) {
            console.warn('pets-trust-strip: invalid items JSON', err);
            return null;
          }
        },
      },
    },
    label: { type: String },
    condensed: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.items = ['Importer of Record', 'FDA / FSVP', 'COA per lot'];
    this.label = 'Trust badges';
    this.condensed = false;
  }

  render() {
    const hasItems = Array.isArray(this.items) && this.items.length > 0;
    return html`
      <div class="trust" aria-label=${this.label}>
        ${hasItems ? this.items.map((item) => html`<span>${item}</span>`) : html`<slot></slot>`}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .trust {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 12px;
      font-size: 13px;
      color: var(--ink-muted, #58625c);
    }

    :host([condensed]) .trust {
      gap: 6px;
      font-size: 12px;
    }

    .trust span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .trust span::before {
      content: '';
      width: 6px;
      height: 6px;
      background: var(--accent, #234b3b);
      border-radius: 999px;
    }
  `;
}

customElements.define('pets-trust-strip', PetsTrustStrip);
