import { defaultProps } from 'grommet';
import { normalize, transitions, fontFace } from 'polished';
import { mergeDeepRight } from 'ramda';
import theme from '../../config/Theme';

export const myTheme = mergeDeepRight(defaultProps.theme, theme, {
  global: {
    colors: {
      // active
      // focus
      brand: theme.colors['color-secondary-1-0'],
      'accent-1': theme.colors['color-primary-1'],
      'accent-2': theme.colors['color-secondary-1-1'],
      'accent-3': theme.colors['color-secondary-2-1'],
      'accent-4': theme.colors['color-primary-0'],
      'neutral-1': theme.colors['color-primary-4'],
      'neutral-2': theme.colors['color-secondary-1-4'],
      'neutral-3': theme.colors['color-secondary-2-4'],
      'neutral-4': theme.colors['color-primary-3'],
      // "status-critical"
      // "status-error"
      // "status-warning"
      // "status-ok"
      // "status-unknown"
      // "status-disabled"
      // white
    },
    font: {
      family: 'Sintony, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      face: () =>
        `${fontFace({
          fontFamily: 'Cantata One',
          fontFilePath: '../../fonts/CantataOne-Regular',
        })}
        ${fontFace({
          fontFamily: 'Sintony',
          fontFilePath: '../../fonts/Sintony-Regular',
        })}
        ${fontFace({
          fontFamily: 'HeadlandOne',
          fontFilePath: '../../fonts/HeadlandOne-Regular',
        })}`,
    },
    transitionDuration: '0.3s',
  },
  heading: {
    font: {
      family: "HeadlandOne, Georgia, 'Times New Roman', Times, serif",
    },
    extend: props => `
      ${
        props.underline === false
          ? ''
          : `
        display: inline-block;
        ::after {
            content: '';
            border-bottom: 2.5px solid ${props.theme.colors['color-primary-0']};
            width: calc( 100% + 10px);
            left: -5px;
            position: relative;
            display: block;
            transform: translateY(-3px) skewY(-0.5deg);
            -webkit-backface-visibility: hidden;
            -webkit-background-clip: content-box;
            -webkit-transform-style: preserve-3d;
        }
        ${
          props.signature
            ? `::after {
            border-bottom: 3.75px solid ${props.theme.colors['color-primary-0']};
            width: calc( 100% - 10px );
            left: 8px;
            border-radius: 1rem;
        }`
            : ''
        }
        ${
          props.thin
            ? `::after {
            border-bottom: 0.5px solid ${props.theme.colors['color-secondary-1-0']};
            width: calc( 100% + 3px);
            left: -1px;
            transform: translateY(-2px) skewY(-0.3deg);
        }`
            : ''
        }
        ${
          props.underlineColor
            ? `::after {
          border-bottom-color: ${props.theme.colors[props.underlineColor] ||
            props.theme.global.colors[props.underlineColor] ||
            props.underlineColor};
        }`
            : ''
        }`
      }
      `,
  },
  paragraph: {
    textAlign: 'justify',
  },
  text: {
    extend: props => `
      ${
        props.underline
          ? `
        display: inline-block;
        ${props.signature ? 'font-family: "Cantata One", "Helvetica Neue", Arial, sans-serif;' : ''}
        ${
          props.interactive
            ? `
          ::after {
            ${Object.entries(transitions(['width', 'left'], props.theme.global.transitionDuration)).reduce(
              (p, [k, v]) => `${p}
            ${k}: ${v};`,
              '',
            )};
          }
          &:hover::after {
            width: calc( 100% );
            left: 0px;
            ${props.signature ? 'width: calc( 100% + 5px ); left: -2px;' : ''}
            ${props.thin ? 'width: calc( 100% + 13px ); left: -6px;' : ''}
          }
        `
            : ''
        }
        ::after {
            content: '';
            border-bottom: 2.5px solid ${props.theme.colors['color-primary-0']};
            width: calc( 100% + 10px);
            left: -5px;
            position: relative;
            display: block;
            transform: translateY(-3px) skewY(-0.5deg);
            -webkit-backface-visibility: hidden;
            -webkit-background-clip: content-box;
            -webkit-transform-style: preserve-3d;
        }
        ${
          props.signature
            ? `::after {
            border-bottom: 3.75px solid ${props.theme.colors['color-primary-0']};
            width: calc( 100% - 10px );
            left: 8px;
            border-radius: 1rem;
        }`
            : ''
        }
        ${
          props.thin
            ? `::after {
            border-bottom: 0.5px solid ${props.theme.colors['color-secondary-1-0']};
            width: calc( 100% + 3px);
            left: -1px;
            transform: translateY(-2px) skewY(-0.3deg);
        }`
            : ''
        }
        ${
          props.underlineColor
            ? `::after {
          border-bottom-color: ${props.theme.colors[props.underlineColor] ||
            props.theme.global.colors[props.underlineColor] ||
            props.underlineColor};
        }`
            : ''
        }
      `
          : ''
      }
    `,
  },
  button: {
    border: {
      radius: '10px',
    },
  },
});
