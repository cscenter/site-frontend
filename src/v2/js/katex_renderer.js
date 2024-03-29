import renderMathInElement from 'katex/dist/contrib/auto-render.js';

import 'katex/dist/katex.css';

let katexOptions = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false }
  ]
};

export function renderMath(domElement, options = null) {
  if (options === null) {
    options = {};
  }
  renderMathInElement(domElement, { ...katexOptions, ...options });
}
