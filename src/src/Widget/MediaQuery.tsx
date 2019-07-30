import React, { Suspense } from 'react';
import styled from 'styled-components';
import LazyLoad from 'react-lazyload';

interface Props {
  query: string;
}

const sizes = {
  xxxs: 200,
  xxs: 320,
  xs: 480,
  s: 800,
  sl: 960,
  m: 1024,
  ml: 1280,
  l: 1334,
  xl: 1366,
  xxl: 1600,
  xxxl: 1920,
  xxxxl: 2560,
  xxxxxl: 3840,
  'UltraHD1': 3840,
  '4k': 3840,
  xxxxxxl: 5120,
  '5k': 5120,
  'UXGA ': 6400,
  'HSXGA  ': 6400,
  '8k': 7680,
  'UltraHD2': 7680,
  '10k': 10240,
  '16k': 15360,

  small: 768,
  medium: 1536,
  large: 1537
};

export const uiSchema = {
  query: {
    "ui:widget": "list",
    "ui:options": {
      "getList": () => [
        "online",
        "offline",
        "all",
        "only all",
        "not all",
        "screen",
        "only screen",
        "not screen",
        "print",
        "only print",
        "not print",
        "speech",
        "only speech",
        "not speech",
        "(aspect-ratio: 1/1)",
        "(aspect-ratio: 6/5)",
        "(aspect-ratio: 5/4)",
        "(aspect-ratio: 4/3)",
        "(aspect-ratio: 11/8)",
        "(aspect-ratio: 3/2)",
        "(aspect-ratio: 16/10)",
        "(aspect-ratio: 1618/1000)",
        "(aspect-ratio: 5/3)",
        "(aspect-ratio: 16/9)",
        "(aspect-ratio: 2/1)",
        "(aspect-ratio: 22/10)",
        "(aspect-ratio: 7/3)",
        "(aspect-ratio: 32/9)",
        "(aspect-ratio: 3/1)",
        "(orientation: landscape)",
        "(orientation: portrait)",
        "(display-mode: fullscreen)",
        "(display-mode: standalone)",
        "(display-mode: minimal-ui)",
        "(display-mode: browser)",
        "(pointer: fine)",
        "(pointer: coarse)",
        "(pointer: none)",
        "(hover: hover)",
        "(hover: none)",
        "(any-pointer: fine)",
        "(any-pointer: coarse)",
        "(any-pointer: none)",
        "(any-hover: hover)",
        "(any-hover: none)",
        ...Object.values(sizes).map(w => `(max-width: ${w}px)`),
        ...Object.values(sizes).map(w => `(min-width: ${w}px)`),
        ...[
          72,
          96,
          150,
          300,
          2540,
          4000,
        ].reduce((p, i) => p.concat([
          `(resolution: ${i}dpi)`,
          `(min-resolution: ${i}dpi)`,
          `(max-resolution: ${i}dpi)`
        ]), []),
        "(scan: interlace)",
        "(scan: progressive)",
        "(grid: 0)",
        "(grid: 1)",
        "(update: fast)",
        "(update: slow)",
        "(update: none)",
        "(overflow-block: none)",
        "(overflow-block: scroll)",
        "(overflow-block: optional-paged)",
        "(overflow-block: paged)",
        "(overflow-inline: scroll)",
        "(overflow-inline: none)",
        "(color)",
        "(not color)",
        "(min-color: 1)",
        "(min-color: 2)",
        "(min-color: 5)",
        "(min-color: 8)",
        "(min-color: 10)",
        "(min-color: 16)",
        "(max-color: 1)",
        "(max-color: 2)",
        "(max-color: 5)",
        "(max-color: 8)",
        "(max-color: 10)",
        "(max-color: 16)",
        "(color-gamut: srgb)",
        "(color-gamut: p3)",
        "(color-gamut: rec2020)",
        "(monochrome)",
        "(monochrome: 0)",
        "(inverted-colors: inverted)",
        "(inverted-colors: none)",
        "(light-level: normal)",
        "(light-level: dim)",
        "(light-level: washed)",
        "(prefers-reduced-motion: no-preference)",
        "(prefers-reduced-motion: reduce)",
        "(prefers-reduced-transparency: no-preference)",
        "(prefers-reduced-transparency: reduce)",
        "(prefers-color-scheme: dark)",
        "(prefers-color-scheme: light)",
        "(forced-colors: active)",
        "(forced-colors: none)",
        "(scripting: none)",
        "(scripting: initial-only)",
        "(scripting: enabled)"
      ]
    }
  }
};

const schema = {
  "title": "componentmediaquery",
  "type": "object",
  "properties": {
    "query": {
      "description": "The actual mediaquery",
      "defualt": "only screen",
      "type": "string"
    },
    "content": {
      "type": "string",
      "x-$ref": "componentgroup"
    }
  }
};

const CssQuery = styled.div`
  display: none;
  @media ${props => props.query} {
    display: block;
  }
`;

const MediaQueryComponent = React.lazy(() => import('react-responsive'));
const IsInlineComponent = React.lazy(() => import('is-online-component'));

export class MediaQuery extends React.PureComponent<Props> {

  static defaultProps = {
    content: "",
    query: "only screen"
  }

  public render() {
    const {
      _id,
      query,
      __children: { child = [] },
      __renderSubtree,
    } = this.props;

    const content = child.map(__renderSubtree);
    if(query === "online" || query === "offline") {
      return <LazyLoad placeholder={query === "online" ? <>{content}</> : null} offset={100} once >
        <Suspense fallback={query === "online" ? <>{content}</> : null}>
          <IsInlineComponent
            OnlineComponent={query === "online" ? <>{content}</> : null}
            OfflineComponent={query === "offline" ? <>{content}</> : null}
          />
        </Suspense>
      </LazyLoad>
    }
    const size = <CssQuery key={_id} query={`${query}`}>{content}</CssQuery>;
    return (<LazyLoad placeholder={size} offset={100} once >
      <Suspense fallback={size}>
        <MediaQueryComponent key={_id}  query={`${query}`}>
          {content}
        </MediaQueryComponent>
      </Suspense>
    </LazyLoad>);
  }
}
