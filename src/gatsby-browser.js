import React from "react"
import { RenderingContext, BROWSER } from "./src/utils/renderingContext";
// import mobx from "mobx";
import { Layout, Provider } from "./src/components/Layout"

// import '@babel/polyfill';

// mobx.configure({ enforceActions: "observed" });

window.requestIdleCallback(() => {
  try {
    const observer = new ReportingObserver((reports, observer) => {
      for (const report of reports) {
        try {
          window.ga('send', 'exception', {
            'exDescription': `${report.type} - ${JSON.stringify(report.body)}`,
            'exFatal': report.type !== "deprecation"
          });
        } catch(e) {
          console.warn("reporting is disabled (do you use no-track?)", e);
        }
      }
    }, { buffered: true });
  } catch(e) {
    console.warn(e);
  }

  window.addEventListener("error", e => {
    try {
      window.ga('send', 'exception', {
        'exDescription': `${e.name} - ${e.message}`,
        'exFatal': true
      });
    } catch(e) {
      console.error("reporting is disabled (do you use no-track?)", e);
    }
  });
  window.addEventListener("unhandledrejection", e => {
    try {
      window.ga('send', 'exception', {
        'exDescription': `${e.name} - ${e.message}`,
        'exFatal': true
      });
    } catch(e) {
      console.error("reporting is disabled (do you use no-track?)", e);
    }
  });

  try {
    const myObserver = new ReportingObserver(reportList => {
      reportList.forEach(report => {
        console.error(report.body.featureId, report);
      });
    }, { "types": ["feature-policy-violation"], buffered: true });
    myObserver.observe();
  } catch(e) {
    console.warn(e);
  }
});

export const wrapPageElement = ({ element, props }, b) => {
  return <Layout {...props}>{element}</Layout>;
}

export const wrapRootElement =  ({ element, ...rest }) => {
  return (
    <RenderingContext.Provider value={BROWSER}><Provider>
      {element}
    </Provider></RenderingContext.Provider>
  )
}

/*
export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    `This application has been updated. ` +
      `Reload to display the latest version?`
  );

  if (answer === true) {
    window.location.reload()
  }
}

export const registerServiceWorker = () => true;
*/
