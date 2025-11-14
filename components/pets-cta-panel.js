import { LitElement, html, css, nothing } from './base.js';

const DEFAULT_PRIMARY = '/request-sample-quote.html';

export class PetsCtaPanel extends LitElement {
  static properties = {
    heading: { type: String },
    body: { type: String },
    primaryLabel: { type: String, attribute: 'primary-label' },
    primaryHref: { type: String, attribute: 'primary-href' },
    secondaryLabel: { type: String, attribute: 'secondary-label' },
    secondaryHref: { type: String, attribute: 'secondary-href' },
    source: { type: String },
  };

  constructor() {
    super();
    this.heading = 'Need Specs or Samples?';
    this.body =
      'Tell us your product of interest and volume range. We’ll send specs, pricing, and timelines.';
    this.primaryLabel = 'Request Samples/Quote';
    this.primaryHref = DEFAULT_PRIMARY;
    this.secondaryLabel = '';
    this.secondaryHref = '';
    this.source = '';
  }

  #withSource(url) {
    if (!url) return '#';
    try {
      const target = new URL(url, window.location.origin);
      if (this.source) {
        target.searchParams.set('source', this.source);
      }
      return `${target.pathname}${target.search}`;
    } catch {
      return url;
    }
  }

  render() {
    return html`
      <section class="panel panel--cta">
        <div>
          <h3>${this.heading}</h3>
          <p class="muted">${this.body}</p>
        </div>
        <div class="cta-band__actions">
          <a class="btn btn-primary" href=${this.#withSource(this.primaryHref)}>
            ${this.primaryLabel}
          </a>
          ${this.secondaryHref
            ? html`
                <a class="btn btn-ghost" href=${this.secondaryHref}>
                  ${this.secondaryLabel || 'Learn More'}
                </a>
              `
            : nothing}
        </div>
      </section>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .panel {
      background: var(--paper, #fff);
      border: 1px solid var(--line, #e6e3db);
      border-radius: var(--radius, 14px);
      box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.06));
      padding: clamp(18px, 4vw, 28px);
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .panel--cta {
      background: color-mix(in oklab, var(--paper, #fff), var(--bg, #f3eee3) 30%);
    }

    h3 {
      margin: 0 0 6px;
    }

    .muted {
      color: var(--ink-muted, #58625c);
      margin: 0;
    }

    .cta-band__actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  `;
}

customElements.define('pets-cta-panel', PetsCtaPanel);
