import MqInit from 'styled-components-media-query';
import { myTheme } from './themeCreator';

const sizes = {
  tablet: '1200px',
  phone: '600px',
};

export const media = {
  tablet: `(max-width: ${sizes.tablet})`,
  phone: `(max-width: ${sizes.phone})`,
};

const bp = Object.entries(myTheme.global.breakpoints).reduce(
  (p, [name, { value }]) => ({
    ...p,
    [name]: value,
  }),
  {},
);

export const mq = MqInit({ bp });
