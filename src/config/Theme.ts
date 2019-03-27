const colors = {};
colors['gray-dark'] = '#373a3c';
colors.gray = '#55595c';
colors['gray-light'] = '#818a91';
colors['gray-lighter'] = '#eceeef';
colors['gray-lightest'] = '#f7f7f9';
colors['color-primary-0'] = '#F9B41F'; // Main Primary color */
colors['color-primary-1'] = '#FFCF68';
colors['color-primary-2'] = '#FFC546';
colors['color-primary-3'] = '#D69405';
colors['color-primary-4'] = '#AF7800';
colors['color-secondary-1-0'] = '#4B26AB'; // Main Secondary color (1) */
colors['color-secondary-1-1'] = '#795CC3';
colors['color-secondary-1-2'] = '#5F3FB3';
colors['color-secondary-1-3'] = '#371393';
colors['color-secondary-1-4'] = '#2A0C78';
colors['color-secondary-2-0'] = '#168999'; // Main Secondary color (2) */
colors['color-secondary-2-1'] = '#4CA8B5';
colors['color-secondary-2-2'] = '#2E93A1';
colors['color-secondary-2-3'] = '#067483';
colors['color-secondary-2-4'] = '#025E6B';
colors['brand-primary'] = colors['color-secondary-1-0'];
colors['brand-secondary'] = colors['color-primary-0'];
colors['brand-tertiary'] = colors['color-secondary-2-0'];
colors['brand-success'] = '#112200';
colors['brand-info'] = colors['brand-secondary'];
colors['brand-warning'] = colors['color-primary-2'];
colors['brand-danger'] = '#882211';
colors['brand-inverse'] = colors['brand-tertiary'];
colors.primary = colors['brand-primary'];
colors.secondary = colors['brand-secondary'];
colors.tertiary = colors['brand-tertiary'];
colors.bg = '#fff'; // Background color
colors.white = '#fff';
colors.grey = {
  dark: 'rgba(0, 0, 0, 0.9)',
  default: 'rgba(0, 0, 0, 0.7)',
  light: 'rgba(0, 0, 0, 0.5)',
  ultraLight: 'rgba(0, 0, 0, 0.25)',
};

const transitions = {
  normal: '0.5s',
};

const fontSize = {
  small: '0.9rem',
  big: '2.9rem',
};

const header = {
  height: '5rem',
};

export default {
  colors,
  transitions,
  fontSize,
  header,
};
