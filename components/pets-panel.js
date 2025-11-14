import { LitElement, html, css, nothing } from './base.js';

export class PetsPanel extends LitElement {
  static properties = {
    heading: { type: String },
    variant: { type: String, reflect: true },
    muted: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.heading = '';
    this.variant = 'default';
    this.muted = false;
  }

  render() {
    return html`
      ${this.heading
        ? html`<h2>${this.heading}</h2>`
        : html`<slot name="heading"></slot>`}
      <slot></slot>
    `;
  }

  static styles = css`
    :host {
      display: block;
      background: var(--paper, #fff);
      border: 1px solid var(--line, #e6e3db);
      border-radius: var(--radius, 14px);
      box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.06));
      padding: clamp(18px, 4vw, 28px);
    }

    :host([variant='subtle']) {
      background: color-mix(in oklab, var(--paper, #fff), var(--bg, #f3eee3) 35%);
    }

    :host([variant='flat']) {
      box-shadow: none;
    }

    h2 {
      margin-top: 0;
    }

    :host([muted]) {
      color: var(--ink-muted, #58625c);
    }
  `;
}

customElements.define('pets-panel', PetsPanel);
