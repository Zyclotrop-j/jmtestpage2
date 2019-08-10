import React from "react";
import { RenderingContext, BROWSER } from "./src/utils/renderingContext";
import * as Comlink from "comlink";
import { navigate } from "gatsby";
// import mobx from "mobx";
import { toast, cssTransition, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Layout, Provider } from "./src/components/Layout";

/*
if(`${window.location}`.indexOf("A11Y") > -1) {
  import("a11y.css/css/a11y-en.css").then((arg) => {
    console.log("ARG", arg)
  });
  import("@khanacademy/tota11y").then((arg) => {
    console.log("ARG2", arg)
  });
}
*/

window.globalActions = window.globalActions || {};
window.globalActions["NAVIGATE"] = {
  available: true,
  trigger: target => navigate(target),
  successfull: null,
  promise: Promise.resolve(navigate)
};
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

// // TODO: Listen to online and offline, then enable setting callback for re-online with notification

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

export const onServiceWorkerActive = () => {
  toast(<div>Content avalable offline.</div>, {
      autoClose: 1000,
      delay: 1000,
      closeButton: false,
      type: toast.TYPE.INFO,
      hideProgressBar: true,
      position: toast.POSITION.BOTTOM_RIGHT,
      closeOnClick: true,
  });
};

if(process.env.NODE_ENV !== "development") {
  import('worker-loader?name=swaddition.js!./src/utils/swaddition');
}

const getNotificationPermission = () => {
  if (!("Notification" in window)) {
    return Promise.resolve({
      supported: false,
      permission: false
    });
  }
  else if (Notification.permission === "granted") {
    return Promise.resolve({
      supported: true,
      permission: true,
    });
  }
  else if (Notification.permission !== "denied") {
    return Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        return {
          supported: true,
          permission: true,
        };
      }
      return {
        supported: true,
        permission: false
      };
    });
  }
  return Promise.resolve({
    supported: true,
    permission: false
  });
}

window.globalActions["NOTIFY_BACKONLINE"] = (() => {
  if(process.env.NODE_ENV === "development") {
    return {
      trigger: () => null,
      available: false,
      successfull: null,
      promise: Promise.reject("Unavailable in develop")
    };
  }
  function initComlink() {
    const { port1, port2 } = new MessageChannel();
    const msg = {
      comlinkInit: true,
      port: port1
    };
    navigator.serviceWorker.controller.postMessage(msg, [ port1 ]);
    return Comlink.wrap(port2);
  }
  const comlinkobj = new Promise((resolve, reject) => {
    if (navigator.serviceWorker.controller) {
      return resolve(initComlink());
    }
    navigator.serviceWorker.addEventListener('controllerchange', () => resolve(initComlink()), { once: true });
  });

  return {
    trigger: async (msg, {
      returnURL,
      ...options
    } = {}) => {
      const hasPermission = await getNotificationPermission();
      if(!hasPermission.permission) {
        toast(<div>Can't scedule notification - please allow the display of notifications!</div>, {
            autoClose: 60000,
            closeButton: true,
            type: toast.TYPE.ERROR,
            hideProgressBar: false,
        });
      }
      const proxy = await comlinkobj;
      await proxy.set("NOTIFY_BACKONLINE_MESSAGE", {
        type: "online",
        message: msg || "",
        opt: {
          returnURL: returnURL || "",
          ...options
        }
      });
      const returnvalue = await proxy.get("NOTIFY_BACKONLINE_MESSAGE");
      if(!returnvalue) {
        window.globalActions["NOTIFY_BACKONLINE"].successfull = false;
        window.globalActions["NOTIFY_BACKONLINE"].available = false;
        return Promise.reject();
      }
      if(!hasPermission.permission) {
        toast(<div>Successfully sceduled back online reminder!</div>, {
            type: toast.TYPE.SUCCESS,
        });
      }
      return returnvalue;
    },
    available: !!navigator.connection,
    successfull: null,
    promise: comlinkobj
  }
})();

/*
// TODO: Do something more useful with this!
document.addEventListener('visibilitychange', function(){
  if(!document.hidden) {
    toast(<div>Welcome back</div>, {
        autoClose: 1000,
        delay: 1000,
        closeButton: false,
        type: toast.TYPE.INFO,
        hideProgressBar: true,
        position: toast.POSITION.BOTTOM_RIGHT,
        closeOnClick: true,
    });
  }
});
*/

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
  const toastId = 'loremIpsum';;
  const options = {
      autoClose: 60000,
      delay: 2000,
      closeButton: false,
      type: toast.TYPE.INFO,
      hideProgressBar: true,
      position: toast.POSITION.BOTTOM_RIGHT,
      closeOnClick: false,
      toastId: toastId,
      onClick: () => {
        toast.update(toastId, {
          render: "Updating in 3",
          type: toast.TYPE.SUCCESS,
          transition: Flip
        });
        window.setTimeout(() => {
          toast.update(toastId, {
            render: "Updating in 2",
            type: toast.TYPE.SUCCESS,
            transition: Flip
          });
          window.setTimeout(() => {
            toast.update(toastId, {
              render: "Updating in 1",
              type: toast.TYPE.SUCCESS,
              transition: Flip
            });
            window.setTimeout(() => {
              toast.update(toastId, {
                render: "Reload",
                type: toast.TYPE.SUCCESS,
                transition: Flip
              });
              window.location.reload()
            }, 1000);
          }, 1000);
        }, 1000);
      }
  };
  toast(<div>An update is available. Click to apply update.</div>, options);
}
/*
export const registerServiceWorker = () => true;
*/
