import React from "react";
import { Heading, Grid, Box } from "grommet";
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
  promise: Promise.resolve(navigate),
  params: {
    "type": "array",
    "items": [
      {
        "type": "string",
        "description": "Navigation target (url)"
      }
    ]
  }
};
window.globalActions["INSTALL_APP"] = {
  available: false,
  params: {
    "type": "array",
    "items": []
  }
};
window.globalActions["SHARE"] = {
  available: false,
  params: {
    "type": "array",
    "items": [
      {
        "type": "string",
        "description": "title - headline of what you want to share"
      },
      {
        "type": "string",
        "description": "text - some description of what is being shared"
      },
      {
        "type": "string",
        "description": "url - the url you want to share, default is `current url`"
      }
    ]
  }
};

Object.entries({
  available: navigator.share !== undefined,
  trigger: async (title, text, url) => {
    try {
      await navigator.share({ title, text, url: url || `${window.location}` });
      window.globalActions["SHARE"].successfull = true;
    } catch (err) {
      window.globalActions["SHARE"].successfull = false;
      console.warn("Share failed:", err.message);
    }
  },
  successfull: null,
  promise: navigator.share === undefined ? Promise.reject("Share unavailable") : Promise.resolve(navigator.share)
}).forEach(([k, v]) => {
  window.globalActions["SHARE"][k] = v;
});




const fn = deferredPrompt => {
  // Prevent Chrome 76 and later from showing the mini-infobar
  // deferredPrompt.preventDefault();
  let res = () => null;
  let rej = () => null;
  Object.entries({
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
  }).forEach(([k, v]) => {
    window.globalActions["INSTALL_APP"][k] = v;
  });
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

const notificationparams = {
  "badge": {
    "type": "string",
    "description": "The URL of the image used to represent the notification when there is not enough space to display the notification itself."
  },
  "dir": {
    "type": "string",
    "description": "The direction in which to display the notification. It defaults to auto, which just adopts the browser's language setting behavior, but you can override that behaviour by setting values of ltr and rtl (although most browsers seem to ignore these settings.)"
  },
  "lang": {
    "type": "string",
    "description": "The notification's language, as specified using a DOMString representing a BCP 47 language tag. See the Sitepoint ISO 2 letter language codes page for a simple reference."
  },
  "body": {
    "type": "string",
    "description": "A DOMString representing the body text of the notification, which is displayed below the title."
  },
  "icon": {
    "type": "string",
    "description": "A USVString containing the URL of an icon to be displayed in the notification."
  },
  "image": {
    "type": "string",
    "description": "a USVString containing the URL of an image to be displayed in the notification."
  },
  "vibrate": {
    "type": "string",
    "description": "A vibration pattern for the device's vibration hardware to emit with the notification."
  },
  "renotify": {
    "type": "boolean",
    "default": false,
    "description": "A Boolean specifying whether the user should be notified after a new notification replaces an old one. The default is false, which means they won't be notified."
  },
  "requireInteraction": {
    "type": "boolean",
    "default": false,
    "description": "Indicates that a notification should remain active until the user clicks or dismisses it, rather than closing automatically. The default value is false."
  },
  "silent": {
    "type": "boolean",
    "default": false,
    "description": "A Boolean specifying whether the notification is silent  (no sounds or vibrations  issued), regardless of the device settings. The default is false, which means it won't be silent."
  },
  /*
  // difficult to implement and somewhat useless
  "actions": {
    "type": "string",
    "description": "An array of NotificationActions representing the actions available to the user when the notification is presented. These are options the user can choose among in order to act on the action within the context of the notification itself. The action's name is sent to the service worker notification handler to let it know the action was selected by the user."
  },
  */
  "noscreen": {
    "type": "boolean",
    "default": false,
    "description": "A Boolean specifying whether the notification firing enable the device's screen or not. The default is false, which means it enables the screen."
  },
  "sticky": {
    "type": "boolean",
    "default": false,
    "description": "A Boolean specifying whether the notification is 'sticky', i.e. not easily clearable by the user. The default is false, which means it won't be sticky."
  }
};
const notifyBackOnlineParams = {
  "type": "array",
  "items": [
    {
      "type": "string",
      "description": "msg - the text to display when the user is back online"
    },
    {
      "type": "object",
      "description": "The settings",
      "properties": {
        "returnURL": {
          "type": "string",
          "description": "none or a url to return to when notification is clicked. Defaults to `current url`"
        },
        ...notificationparams
      }
    }
  ]
};

window.globalActions["NOTIFY_BACKONLINE"] = (() => {
  if(process.env.NODE_ENV === "development") {
    return {
      trigger: () => null,
      available: false,
      successfull: null,
      promise: Promise.reject("Unavailable in develop"),
      params: notifyBackOnlineParams
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
          returnURL: `${returnURL}`.toLowerCase() === "none" ? "" : `${returnURL || window.location}`,
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
    promise: comlinkobj,
    params: notifyBackOnlineParams
  }
})();

let documentvisible = document.hidden;
document.addEventListener('visibilitychange', () => {
  documentvisible = document.hidden
});
window.globalActions["NOTIFICATION"] = {
  available: false,
  params: {
    "type": "array",
    "items": [
      {
        "type": "string",
        "description": "title - headline of the notification"
      },
      {
        "type": "object",
        "properties": notificationparams
      }
    ]
  }
};
const notificationPromiseCbs = [];
const notificationPromise = new Promise((resolve, reject) => {
  if (Notification.permission === "denied") return reject();
  if (Notification.permission === "granted") return resolve();
  notificationPromiseCbs.push({ resolve, reject });
});
Object.entries({
  available: "Notification" in window && Notification.permission !== "denied",
  trigger: async (title, opts) => {
    if(documentvisible) {
      const options = {
          hideProgressBar: true,
          autoClose: opts.requireInteraction ? false : 5000
      };
      toast(<div dir={opts.dir} lang={opts.lang}>
              <Grid
                rows={['auto', 'flex', 'auto']}
                columns={['auto', 'flex']}
                gap={
                  {"row": opts.image || opts.body ? "small" : "none", "column": opts.image ? "small" : "none"}
                }
                areas={[
                    { name: 'icon', start: [0, 0], end: [0, 1] },
                    { name: 'headline', start: [1, 0], end: [1, 0] },
                    { name: 'text', start: [1, 1], end: [1, 1] },
                    { name: 'image', start: [0, 2], end: [1, 2] },
                ]}
              >
                {opts.icon && <Box gridArea="icon">
                  <img style={{width: 80, height: 80}} src={opts.icon} alt="" />
                </Box>}
                <Box gridArea="headline">
                  <Heading level={2} margin="none" size="small">{title}</Heading>
                </Box>
                {opts.body && <Box gridArea="text">
                  {opts.body}
                </Box>}
                {opts.image && <Box gridArea="image">
                  <img style={{width: "auto", "max-height": 80}} src={opts.image} alt="" />
                </Box>}
              </Grid>
      </div>, options);
      return;
    }
    if (Notification.permission === "denied") {
      window.globalActions["NOTIFICATION"].successfull = false;
      window.globalActions["NOTIFICATION"].available = false;
      return;
    } else if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      notificationPromiseCbs.forEach(({ resolve, reject }) => permission !== "granted" ? reject() : resolve());
      if(permission !== "granted") {
        window.globalActions["NOTIFICATION"].successfull = false;
        window.globalActions["NOTIFICATION"].available = false;
        return;
      }
    }
    // Permission is granted now
    new Notification(title, opts);
    window.globalActions["NOTIFICATION"].successfull = true;
  },
  successfull: null,
  promise: notificationPromise,
}).forEach(([k, v]) => {
  window.globalActions["NOTIFICATION"][k] = v;
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
              window.location.reload(true)
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
