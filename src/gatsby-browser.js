import React from "react"
import { RenderingContext, BROWSER } from "./src/utils/renderingContext";
// import mobx from "mobx";
import { toast, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Layout, Provider } from "./src/components/Layout";

window.globalActions = window.globalActions || {};
window.globalActions["INSTALL_APP"] = {
  available: false
};
const fn = deferredPrompt => {
  // Prevent Chrome 76 and later from showing the mini-infobar
  // deferredPrompt.preventDefault();
  let res = () => null;
  let rej = () => null;
  window.globalActions["INSTALL_APP"] = {
    trigger: () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            window.globalActions["INSTALL_APP"].successfull = true;
            window.globalActions["INSTALL_APP"].available = false;
            res();
          } else {
            window.globalActions["INSTALL_APP"].successfull = false;
            window.globalActions["INSTALL_APP"].available = false;
            rej();
          }
        });
      window.removeEventListener('beforeinstallprompt', fn);
    },
    available: true,
    successfull: null,
    promise: new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    })
  };
};
window.addEventListener('beforeinstallprompt', fn);
window.addEventListener('appinstalled', (evt) => {
  const options = {
      autoClose: 6000,
      type: toast.TYPE.SUCCESS,
      position: toast.POSITION.BOTTOM_RIGHT,
      closeOnClick: true
  };
  toast(<div>Successfully installed app!</div>, options);
});

const NoTransition = cssTransition({
  enter: 'zoomIn',
  exit: 'zoomOut',
  duration: 1,
  appendPosition: false
});

const prefersNoAnimation = window?.matchMedia("(prefers-reduced-motion: reduce)")?.matches;
toast.configure({
  position: "top-right",
  autoClose: 5000,
  closeButton: undefined,
  hideProgressBar: false,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  rtl: document.dir === "rtl",
  closeOnClick: true,
  newestOnTop: false,
  draggable: true,
  draggablePercent: 80,
  transition: prefersNoAnimation ? NoTransition : undefined
});

// import '@babel/polyfill';

// mobx.configure({ enforceActions: "observed" });

window.requestIdleCallback(() => {
  try {
    const observer = new window.ReportingObserver((reports, observer) => {
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
    observer.observe();
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
    const myObserver = new window.ReportingObserver(reportList => {
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


export const onServiceWorkerUpdateReady = () => {
  const options = {
      autoClose: 60000,
      delay: 2000,
      closeButton: false,
      type: toast.TYPE.INFO,
      hideProgressBar: true,
      position: toast.POSITION.BOTTOM_RIGHT,
      closeOnClick: true,
      onClick: window.location.reload
  };
  toast(<div>An update is available. Click to apply update.</div>, options);
}
/*
export const registerServiceWorker = () => true;
*/
