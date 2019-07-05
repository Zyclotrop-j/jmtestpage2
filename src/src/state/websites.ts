import { observable, flow, action, autorun, toJS } from 'mobx';
import { request } from "./components";

export const websites = observable([]);
export const themes = observable.array([], { deep: false });
export const current = observable.box(null);
export const loading = observable.box(false);
export const error = observable.box(null);

autorun(() => {
  console.log('websites:', websites);
});

autorun(() => {
  console.log('websites current:', current.get());
});

export const addPage = flow(function*(pageid, websiteid, resolve, reject, options) {
    if(!pageid) {
      throw new Error("pageid is a required argument!");
    }
    if(!websiteid) {
      throw new Error("websiteid is a required argument!");
    }
    const obssiteIndex = websites.findIndex(site => site._id === websiteid);
    const obssite = websites[obssiteIndex];
    try {
      const site = toJS(obssite);
      site.pages.splice(options?.pos === undefined ? -1 : options.pos, 0, pageid);
      if(options?.optimistic) {
        obssite.pages.splice(options?.pos === undefined ? -1 : options.pos, 0, pageid);
      }
      const { data } = yield request(`https://zcmsapi.herokuapp.com/api/v1/website/${websiteid}`, {
        method: "PATCH",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pages: site.pages
        })
      }).then(i => !i.ok ? Promise.reject(i) : i.json());
      // Trigger the current-proxy by referenceing by key, not overwriting the entire thing
      Object.entries(data).forEach(([key, val]) => {
          websites[obssiteIndex][key] = val;
      });
      // trigger re-loading of pages
      const tmpid = current.get()._id;
      current.set(null);
      current.set(websites.find(site => site._id === tmpid));
      resolve(data);
      return data;
    } catch (err) {
      if(options?.optimistic) { // rollback
        obssite.pages.splice(obssite.pages.indexOf(pageid), 1);
      }
      console.error(err);
      reject(err);
      return err;
    }
});

export const fetchAllWebsites = flow(function*() {
  // <- note the star, this a generator function!
  loading.set(true);
  error.set(null);
  websites.clear();
  try {
    const { data } = yield fetch(`https://zcmsapi.herokuapp.com/api/v1/website`).then(i => i.json()); // yield instead of await
    websites.replace(data);
    current.set(null);
    loading.set(false);
  } catch (err) {
    websites.clear();
    error.set(err);
    loading.set(false);
  }
});

export const fetchAllThemes = flow(function*() {
  // <- note the star, this a generator function!
  loading.set(true);
  error.set(null);
  themes.clear();
  try {
    const currentThemes = current.get().themes;
    if(!currentThemes) return;
    for(let i = 0; i < currentThemes.length; i++) {
      const { data } = yield fetch(`https://zcmsapi.herokuapp.com/api/v1/theme/${currentThemes[i]}`).then(i => i.json()); // yield instead of await
      themes.push(data);
    }
    loading.set(false);
  } catch (err) {
    themes.clear();
    error.set(err);
    loading.set(false);
  }
});

export const setCurrentWebsite = action(website => {
  console.log('Setting current website to', website);
  current.set(website);
});

current.observe(function(change) {
    fetchAllThemes();
});
