import React, { Suspense, useState, useEffect } from 'react';
import styled from 'styled-components';
import LazyLoad from 'react-lazyload';
import { useBatteryStatus } from "environment-aware-hooks/battery";

const navigatorConnection = typeof document !== 'undefined' && navigator.connection;
const getConnection = () => {
  return navigatorConnection ? {
    downlink: navigatorConnection.downlink,
    downlinkMax: navigatorConnection.downlinkMax,
    effectiveType: navigatorConnection.effectiveType,
    saveData: navigatorConnection.saveData,
    type: navigatorConnection.type,
  } : {};
};
const useConnectionType = () => {
  const [effectiveConnectionType, setEffectiveConnectionType] = useState(getConnection());

  const updateECTStatus = () => {
    setEffectiveConnectionType(getConnection());
  };
  useEffect(() => {
    navigatorConnection && navigatorConnection.addEventListener('change', updateECTStatus);
    return () => {
      navigatorConnection && navigatorConnection.removeEventListener('change', updateECTStatus);
    };
  }, []);
  return effectiveConnectionType;
};


const unsupportMessage = 'The Memory Status API is not supported on this platform.';
const windowPerformance = typeof document !== 'undefined' && window.performance;
const isMemorySupported = () => {
  return windowPerformance && windowPerformance.memory;
};
const useMemoryStatus = () => {
  const [memoryStatus, setMemoryStatus] = useState(null);

  const getTotalJSHeapSize = () => windowPerformance.memory.totalJSHeapSize;
  const getUsedJSHeapSize = () => windowPerformance.memory.usedJSHeapSize;
  const getJSHeapSizeLimit = () => windowPerformance.memory.jsHeapSizeLimit;

  const getUsedMemoryPercent = () => {
    const usedJSHeapSize = getUsedJSHeapSize();
    const jsHeapSizeLimit = getJSHeapSizeLimit();
    const usedMemoryPercent = usedJSHeapSize / jsHeapSizeLimit * 100;
    return usedMemoryPercent;
  };

  let cancelCurrentTimer = null;
  const sceduleUpdate = () => {
    const timeout = window.setTimeout(() => {
      const idlecb = window.requestIdleCallback(() => {
        setMemoryStatus({
          totalJSHeapSize: getTotalJSHeapSize(),
          usedJSHeapSize: getUsedJSHeapSize(),
          jsHeapSizeLimit: getJSHeapSizeLimit(),
          usedMemoryPercent: getUsedMemoryPercent()
        });
        sceduleUpdate();
      });
      cancelCurrentTimer = () => window.cancelIdleCallback(idlecb);
    }, 1000);
    cancelCurrentTimer = () => clearTimeout(timeout);
  }

  useEffect(() => {
    if (isMemorySupported()) {
      setMemoryStatus({
        totalJSHeapSize: getTotalJSHeapSize(),
        usedJSHeapSize: getUsedJSHeapSize(),
        jsHeapSizeLimit: getJSHeapSizeLimit(),
        overUsedMemorySize: getOverUsedMemorySize(),
        usedMemoryPercent: getUsedMemoryPercent()
      });
      sceduleUpdate();
      return () => {
        if(cancelCurrentTimer) {
          cancelCurrentTimer()
        }
      };
    } else {
      setMemoryStatus({unsupportMessage});
    }
  // eslint-disable-next-line
  }, []);

  return memoryStatus;
};

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

const memoryQueries = {
  "memoryUsedGreater10%": ({ usedMemoryPercent }) => usedMemoryPercent > 10,
  "memoryUsedGreater20%": ({ usedMemoryPercent }) => usedMemoryPercent > 20,
  "memoryUsedGreater30%": ({ usedMemoryPercent }) => usedMemoryPercent > 30,
  "memoryUsedGreater40%": ({ usedMemoryPercent }) => usedMemoryPercent > 40,
  "memoryUsedGreater50%": ({ usedMemoryPercent }) => usedMemoryPercent > 50,
  "memoryUsedGreater60%": ({ usedMemoryPercent }) => usedMemoryPercent > 60,
  "memoryUsedGreater70%": ({ usedMemoryPercent }) => usedMemoryPercent > 70,
  "memoryUsedGreater80%": ({ usedMemoryPercent }) => usedMemoryPercent > 80,
  "memoryUsedGreater90%": ({ usedMemoryPercent }) => usedMemoryPercent > 90,
  "memoryUsedLess10%": ({ usedMemoryPercent }) => usedMemoryPercent < 10,
  "memoryUsedLess20%": ({ usedMemoryPercent }) => usedMemoryPercent < 20,
  "memoryUsedLess30%": ({ usedMemoryPercent }) => usedMemoryPercent < 30,
  "memoryUsedLess40%": ({ usedMemoryPercent }) => usedMemoryPercent < 40,
  "memoryUsedLess50%": ({ usedMemoryPercent }) => usedMemoryPercent < 50,
  "memoryUsedLess60%": ({ usedMemoryPercent }) => usedMemoryPercent < 60,
  "memoryUsedLess70%": ({ usedMemoryPercent }) => usedMemoryPercent < 70,
  "memoryUsedLess80%": ({ usedMemoryPercent }) => usedMemoryPercent < 80,
  "memoryUsedLess90%": ({ usedMemoryPercent }) => usedMemoryPercent < 90,
};
const connectionQueries = {
  saveDataEnabled: ({ saveData }) => saveData === true,
  connectionQueriesDisabled: ({ saveData }) => saveData === false,
  bluetoothNetwork: ({ type }) => type === "bluetooth",
  cellularNetwork: ({ type }) => type === "cellular",
  ethernetNetwork: ({ type }) => type === "ethernet",
  noneNetwork: ({ type }) => type === "none",
  wifiNetwork: ({ type }) => type === "wifi",
  wimaxNetwork: ({ type }) => type === "wimax",
  otherNetwork: ({ type }) => type === "other",
  unknownNetwork: ({ type }) => type === "unknown",
  slow2gConnection: ({ effectiveType }) => effectiveType === "slow-2g",
  "2gConnection": ({ effectiveType }) => effectiveType === "2g",
  "3gConnection": ({ effectiveType }) => effectiveType === "3g",
  "4gConnection": ({ effectiveType }) => effectiveType === "4g",
  "minDownlink0.01MB": ({ downlink }) => downlink > 0.01,
  "minDownlink0.1MB": ({ downlink }) => downlink > 0.1,
  "minDownlink0.5MB": ({ downlink }) => downlink > 0.5,
  "minDownlink1MB": ({ downlink }) => downlink > 1,
  "minDownlink2MB": ({ downlink }) => downlink > 2.,
  "minDownlink5MB": ({ downlink }) => downlink > 5,
  "minDownlink10MB": ({ downlink }) => downlink > 10,
  "minDownlink20MB": ({ downlink }) => downlink > 20,
  "minDownlink50MB": ({ downlink }) => downlink > 50,
  "minDownlink100MB": ({ downlink }) => downlink > 100,
  "minDownlink200MB": ({ downlink }) => downlink > 200,
  "maxDownlink0.01MB": ({ downlink }) => downlink < 0.01,
  "maxDownlink0.1MB": ({ downlink }) => downlink < 0.1,
  "maxDownlink0.5MB": ({ downlink }) => downlink < 0.5,
  "maxDownlink1MB": ({ downlink }) => downlink < 1,
  "maxDownlink2MB": ({ downlink }) => downlink < 2,
  "maxDownlink5MB": ({ downlink }) => downlink < 5,
  "maxDownlink10MB": ({ downlink }) => downlink < 10,
  "maxDownlink20MB": ({ downlink }) => downlink < 20,
  "maxDownlink50MB": ({ downlink }) => downlink < 50,
  "maxDownlink100MB": ({ downlink }) => downlink < 100,
  "maxDownlink200MB": ({ downlink }) => downlink < 200,
};
const batteryQueries = {
  isCharging: ({ chargingState }) => chargingState === "Charging",
  isDischarging: ({ chargingState }) => chargingState === "Discharging",
  "moreThan10%Left": ({ level }) => level > 0.1,
  "moreThan20%Left": ({ level }) => level > 0.2,
  "moreThan30%Left": ({ level }) => level > 0.3,
  "moreThan40%Left": ({ level }) => level > 0.4,
  "moreThan50%Left": ({ level }) => level > 0.5,
  "moreThan60%Left": ({ level }) => level > 0.6,
  "moreThan70%Left": ({ level }) => level > 0.7,
  "moreThan80%Left": ({ level }) => level > 0.8,
  "moreThan90%Left": ({ level }) => level > 0.9,
  "lessThan10%Left": ({ level }) => level < 0.1,
  "lessThan20%Left": ({ level }) => level < 0.2,
  "lessThan30%Left": ({ level }) => level < 0.3,
  "lessThan40%Left": ({ level }) => level < 0.4,
  "lessThan50%Left": ({ level }) => level < 0.5,
  "lessThan60%Left": ({ level }) => level < 0.6,
  "lessThan70%Left": ({ level }) => level < 0.7,
  "lessThan80%Left": ({ level }) => level < 0.8,
  "lessThan90%Left": ({ level }) => level < 0.9,
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
        ...Object.keys(batteryQueries),
        ...Object.keys(connectionQueries),
        ...Object.keys(memoryQueries),
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
        "(scripting: enabled)",
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
const IsOnlineComponent = React.lazy(() => import('is-online-component'));

const BateryQuery = ({ children, query }) => batteryQueries[query](useBatteryStatus()) ? children : null;
const ConnectionQuery = ({ children, query }) => connectionQueries[query](useConnectionType()) ? children : null;
const MemoryQuery = ({ children, query }) => memoryQueries[query](useMemoryStatus()) ? children : null;

export class MediaQuery extends React.PureComponent<Props> {

  static defaultProps = {
    content: "",
    query: "only screen"
  }

  public render() {
    const {
      _id,
      query,
      preview,
      __children: { child = [] },
      __renderSubtree,
    } = this.props;

    const content = child.map(__renderSubtree);
    if(preview === "default") {
      return <>
        <small><b>In preview the content of <i>("{query}")</i> is always shown:</b></small>
        <div>{content}</div>
      </>;
    }
    if(query === "online" || query === "offline") {
      return <LazyLoad scrollContainer="#page-wrap" placeholder={query === "online" ? <>{content}</> : null} offset={100} once >
        <Suspense fallback={query === "online" ? <>{content}</> : null}>
          <IsOnlineComponent
            OnlineComponent={query === "online" ? <>{content}</> : null}
            OfflineComponent={query === "offline" ? <>{content}</> : preview ? <div><b>The following content does not display online, this is only for the editor!</b>{content}</div> : null}
          />
        </Suspense>
      </LazyLoad>
    }
    if(Object.keys(batteryQueries).includes(query)) {
      return <LazyLoad scrollContainer="#page-wrap" placeholder={<>{content}</>} offset={100} once >
        <BateryQuery query={query}>{content}</BateryQuery>
      </LazyLoad>;
    }
    if(Object.keys(connectionQueries).includes(query)) {
      return <LazyLoad scrollContainer="#page-wrap" placeholder={<>{content}</>} offset={100} once >
        <ConnectionQuery query={query}>{content}</ConnectionQuery>
      </LazyLoad>;
    }
    if(Object.keys(memoryQueries).includes(query)) {
      return <LazyLoad scrollContainer="#page-wrap" placeholder={<>{content}</>} offset={100} once >
        <MemoryQuery query={query}>{content}</MemoryQuery>
      </LazyLoad>;
    }
    const size = <CssQuery key={_id} query={`${query}`}>{content}</CssQuery>;
    return (<LazyLoad scrollContainer="#page-wrap" placeholder={size} offset={100} once >
      <Suspense fallback={size}>
        <MediaQueryComponent key={_id}  query={`${query}`}>
          {content}
        </MediaQueryComponent>
      </Suspense>
    </LazyLoad>);
  }
}
