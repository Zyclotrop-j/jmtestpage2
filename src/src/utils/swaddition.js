import * as Comlink from "comlink";
import { is } from "ramda";

const isObject = is(Object);

function notificationclick(event) {
  const returnURL = event.notification?.data?.returnURL;
  const path = returnURL.split("#")[0];
  event.notification.close();

  if(returnURL) {
    event.waitUntil(clients.matchAll({
      type: "window"
    }).then(clientList => {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === path && 'focus' in client)
          return client.focus().then(wc => wc.navigate(returnURL));
      }
      if (clients.openWindow)
        return clients.openWindow(returnURL);
    }));
  }
};
self.addEventListener("notificationclick", notificationclick);

const display = (msg, opts) => self.registration.showNotification(msg, opts);

const onBackonline = () => {
  if(navigator.onLine) {
    const notis = Object.entries(xobj)
      .filter(([k, { type, __shown }]) => !__shown && `${type}`.toLowerCase() === "online");
    if(notis.length === 0) return;
    notis.forEach(([k, { message, opt, __shown }]) => {
      if(__shown) return;
      display(message, opt || {});
      xobj[k].__shown = true;
    });
  }
};
navigator.connection.addEventListener("change", onBackonline)
navigator.connection.addEventListener("typechange", onBackonline);

let xobj = {};
const fns = {};
const notifications = {
  exec(key, ...args) {return fns[key](...args);},
  set(key, value) {
    if(value && (!value.type || !value.message)) {
      return false;
    }
    if(isObject(value)) {
      const fnid = Math.random().toString(36);
      value.__show = fnid;
      fns[fnid] = () => display(value.message, value.opt || {});
      value.__shown = false;
    }
    xobj[key] = value;
    return true;
  },
  get(key) {return xobj[key]},
  keys() {return Object.keys(xobj)},
  values() {return Object.values(xobj)},
  entries() {return Object.entries(xobj)},
  delete(key) {
    delete xobj[key];
  },
  clear() {xobj = {}},
}

self.addEventListener('message', (event) => {
  if (event.data.comlinkInit) {
    Comlink.expose(notifications, event.data.port);
    return;
  }
});
