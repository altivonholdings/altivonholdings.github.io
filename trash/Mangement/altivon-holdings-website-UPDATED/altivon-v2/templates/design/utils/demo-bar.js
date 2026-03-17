/**
 * Altivon Design Demo – Shared Demo Bar Utility
 * Call initDemoBar({ title, backHref, orderHref }) to inject the top bar.
 */
function initDemoBar({ title = 'Template Preview', backHref = '../', orderHref = '../../contact/index.html' } = {}) {
  const bar = document.createElement('div');
  bar.className = 'demo-bar';
  bar.innerHTML = `
    <div class="demo-left">
      <span class="demo-badge">Preview</span>
      <span>${title}</span>
    </div>
    <div class="demo-right">
      <a href="${backHref}" class="demo-btn demo-back">← Back to Template</a>
      <a href="${orderHref}" class="demo-btn demo-order">🚀 Order This →</a>
    </div>
  `;
  document.body.insertBefore(bar, document.body.firstChild);
}
