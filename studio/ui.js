const paths = {
  home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-6h6v6"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  bookmark:'<path d="M6 4h12v17l-6-4-6 4z"/>',
  book:'<path d="M12 7c-2-3-6-4-9-3v14c4-1 7 0 9 2 2-2 5-3 9-2V4c-3-1-7 0-9 3zm0 0v13"/>',
  repeat:'<path d="m17 2 4 4-4 4M21 6H7a4 4 0 0 0-4 4m4 12-4-4 4-4m-4 4h14a4 4 0 0 0 4-4"/>',
  flag:'<path d="M5 21V4m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>',
  trophy:'<path d="M8 3h8v8a4 4 0 0 1-8 0zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 4v5m-4 1h8"/>',
  game:'<path d="M7 7h10a4 4 0 0 1 4 3l1 5a3 3 0 0 1-5 3l-2-2H9l-2 2a3 3 0 0 1-5-3l1-5a4 4 0 0 1 4-3zM7 9v5m-2-2h5m6 0h.01m3 2h.01"/>',
  folder:'<path d="M3 6h7l2 2h9v11H3z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  pen:'<path d="m4 16-1 5 5-1L21 7l-4-4zm10-10 4 4"/>',
  chart:'<path d="M4 3v17h17M8 16v-3m5 3V8m5 8V5"/>',
  user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="9" cy="18" r="2" fill="currentColor"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
  moon:'<path d="M20 15.4A8.5 8.5 0 0 1 8.6 4 8.5 8.5 0 1 0 20 15.4Z"/>',
  play:'<path d="m8 5 11 7-11 7z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  spark:'<path d="M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10z"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  music:'<path d="M9 17V5l11-2v12M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18c3 0 3-2 2-3-1-2 1-3 3-3h1a3 3 0 0 0 3-3 9 9 0 0 0-9-9zM7 11h.01m3-4h.01m5 0h.01m3 4h.01"/>',
  code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 4l-4 16"/>',
  camera:'<path d="M3 7h5l2-3h4l2 3h5v13H3z"/><circle cx="12" cy="13" r="4"/>',
  brain:'<path d="M12 5a3 3 0 0 0-6 0 4 4 0 0 0-2 6 4 4 0 0 0 2 6 3 3 0 0 0 6 1V5zm0 0a3 3 0 0 1 6 0 4 4 0 0 1 2 6 4 4 0 0 1-2 6 3 3 0 0 1-6 1M7 9l2 2m6 0 2-2"/>',
  orbit:'<circle cx="12" cy="12" r="3"/><ellipse transform="rotate(-32 12 12)" cx="12" cy="12" rx="11" ry="5"/>',
  leaf:'<path d="M20 4c-2 3-8 0-12 4s-3 9 0 11 9 0 11-4 1-8 1-11ZM4 21l11-10"/>',
  activity:'<path d="M2 12h5l3-7 4 14 3-7h5"/>',
  shuffle:'<path d="M3 6h3c6 0 6 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-2 5-4m2-4c1-2 3-4 5-4h3m-4-4 4 4-4 4"/>',
  compare:'<path d="M3 5h7v14H3zm11 0h7v14h-7z"/>',
  heart:'<path d="M12 20 4 12a5 5 0 0 1 8-6 5 5 0 0 1 8 6z"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3l-1 2m0 3h.01"/>',
  chevron:'<path d="m9 6 6 6-6 6"/>',
  bolt:'<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18m-9-9c5 5 5 13 0 18-5-5-5-13 0-18z"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
};

export function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
}

export const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[char]));
export const route = (path = '') => '#/' + path;
export const readRoute = () => location.hash.startsWith('#/') ? location.hash.slice(2).split('/') : [''];
export const brand = () => `<a class="brand" href="#/" aria-label="HobbyMaxing Startseite"><img alt="" src="./assets/mark.svg" width="34" height="34"><span>Hobby<span>Maxing</span></span></a>`;
export const link = (label, to, style = '', symbol = '') => `<a class="button ${style}" href="${route(to)}">${symbol ? icon(symbol, 17) : ''}${esc(label)}</a>`;
export const action = (label, name, style = '', symbol = '', value = '') => `<button type="button" class="button ${style}" data-action="${name}" data-value="${esc(value)}">${symbol ? icon(symbol, 17) : ''}${esc(label)}</button>`;
export const empty = (title, description, button = '', symbol = 'spark') => `<div class="empty"><span class="round-icon">${icon(symbol, 26)}</span><h3>${esc(title)}</h3><p>${esc(description)}</p>${button}</div>`;
export const dateLabel = (date, options = {day:'numeric', month:'short', year:'numeric'}) => {
  if (!date) return '';
  const parsed = new Date(date.length === 10 ? date + 'T12:00:00' : date);
  return Number.isNaN(+parsed) ? '' : new Intl.DateTimeFormat('de-DE', options).format(parsed);
};
export const localDay = (value = new Date()) => [value.getFullYear(), String(value.getMonth() + 1).padStart(2,'0'), String(value.getDate()).padStart(2,'0')].join('-');
export const normalize = value => String(value ?? '').toLocaleLowerCase('de').normalize('NFKD').replace(/\p{Diacritic}/gu, '').replace(/ß/g,'ss').trim();
export const uid = () => globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
export const paragraphList = list => list?.length ? `<ul class="plain-list">${list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
export function pageHead(kicker, title, description, controls = '') {
  return `<header class="page-head"><div><span class="eyebrow">${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${controls ? `<div class="actions">${controls}</div>` : ''}</header>`;
}
export function download(filename, data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const element = document.createElement('a');
  element.href = url;
  element.download = filename;
  element.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
