import { LitElement, html, css, nothing } from './base.js';

export class PetsResourceCard extends LitElement {
  static properties = {
    title: { type: String },
    href: { type: String },
    imageSrc: { type: String, attribute: 'image-src' },
    imageAlt: { type: String, attribute: 'image-alt' },
    excerpt: { type: String },
    tag: { type: String },
  };

  constructor() {
    super();
    this.title = '';
    this.href = '#';
    this.imageSrc = '';
    this.imageAlt = '';
    this.excerpt = '';
    this.tag = '';
  }

  render() {
    return html`
      <article class="post">
        ${this.imageSrc
          ? html`
              <div class="post__media">
                <img src=${this.imageSrc} alt=${this.imageAlt || ''} loading="lazy" />
              </div>
            `
          : nothing}
        <div class="body">
          ${this.tag ? html`<span class="badge">${this.tag}</span>` : nothing}
          <h3>
            <a href=${this.href}>${this.title}</a>
          </h3>
          ${this.excerpt ? html`<p class="muted">${this.excerpt}</p>` : nothing}
          <slot></slot>
        </div>
      </article>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .post {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr);
      gap: 16px;
      padding: clamp(14px, 3vw, 18px);
      background: var(--paper, #fff);
      border: 1px solid var(--line, #e6e3db);
      border-radius: var(--radius, 14px);
      box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.06));
    }

    @media (max-width: 640px) {
      .post {
        grid-template-columns: 1fr;
      }
    }

    .post__media img {
      width: 100%;
      height: auto;
      border-radius: calc(var(--radius, 14px) - 4px);
      object-fit: cover;
    }

    .body h3 {
      margin: 0 0 6px;
      font-size: 20px;
    }

    .body a {
      color: inherit;
      text-decoration: none;
    }

    .body .muted {
      margin: 0;
      color: var(--ink-muted, #58625c);
    }

    .badge {
      display: inline-block;
      margin-bottom: 6px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--accent, #234b3b);
    }
  `;
}

customElements.define('pets-resource-card', PetsResourceCard);
