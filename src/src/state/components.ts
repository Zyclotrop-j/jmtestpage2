import { toJS, observable, flow, action, computed, autorun } from "mobx";
import { groupBy, mergeDeepRight, assocPath, path, is, omit } from "ramda";
import mapValuesSeries from 'async/mapValuesSeries';
import mapSeries from 'async/mapSeries';
import asyncify from 'async/asyncify';
import componentTypes from '../Widget';
import { current as website, websites } from "./websites";
import { componentschemas, ajv } from "./schemas";
import { pages } from "./pages";
import { auth } from "../utils/auth";

export const components = observable.map({});
export const loading = observable.box(false);
export const error = observable.box(null);

export const request = (url, args, options = {}) => fetch(url, {
  ...(args || {}),
  headers: {
    ...(args?.headers || {}),
    "authorization": `Bearer ${auth.getIdToken()}`,
    ...(options.skipClientCheck ? {} : {
      "x-client": website?.get()?._client
    }),
  }
});

autorun(() => {
    console.log("components:", components);
});

const fetchComponents = xcomponentschemas => Promise.all(xcomponentschemas.get().map(i => request(`https://zcmsapi.herokuapp.com/api/v1/${i.title}`, {
  cache: "no-cache"
}).then(j => j.json())));

export const fetchAllComponents = flow(function*() {
    components.clear();
    if(!website.get()) {
      return;
    }
    loading.set(true);
    try {
      const allComponents = yield fetchComponents(componentschemas);
      const data = allComponents.reduce((p, i) => ({
        ...p,
        ...i.data.reduce((p2, j) => ({
          ...p2,
          [j._id]: j
        }), {})
      }), {});
      components.replace(data);
      loading.set(false);
    } catch (err) {
      components.clear();
      error.set(err);
      loading.set(false);
    }
});

export const fetchComponent = flow(function*(type, id, resolve, reject) {
    if(!website.get()) {
      return;
    }
    try {
      const { data } = yield request(`https://zcmsapi.herokuapp.com/api/v1/${type}/${id}`, {
        cache: "no-cache"
      }).then(i => i.json());
      components.set(id, data);
    } catch (err) {
      error.set(err);
    }
});

// aka createComponent = addComponent
export const addComponent = flow(function*(type, data, resolve, reject, options = {}) {
    try {
      const client = options.skipClientCheck ? data._client : website.get()._client;
      if(data._client && client !== data._client) {
        return reject(`Client mismatch - can't put components of client ${data._client} on website domain ${client}`);
      }

      const compP = Object.entries(componentTypes).find(([j]) => type === `component${j.toLowerCase()}`);
      const defaults = compP?.[1]?.defaultProps || {};
      data = mergeDeepRight(defaults, data);

      data._client = client; // Set _client to current domain
      const valid = ajv.validate(type, data);
      if(!valid) {
        console.error("AJV error", ajv.errors);
        return reject(ajv.errors);
      }
      const tmp = yield request(`https://zcmsapi.herokuapp.com/api/v1/${type}`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }, options).then(i => {
        return !i.ok ? Promise.reject(i) : i.json();
      });
      const { data: response } = tmp;
      components.set(response._id, response);
      resolve(response);
      return response;
    } catch (err) {
      error.set(err);
      reject(err);
      return err;
    }
});

export const editComponent = flow(function*(id, iidata, resolve, reject, options) {
  const client = website.get()._client;
  if(iidata._client && client !== iidata._client) {
    return reject(`Client mismatch - can't put components of client ${iidata._client} on website domain ${client}`);
  }
  iidata._client = client; // Set _client to current domain
  const comp = components.get(id) || pages.find(i => i._id === id) || websites.find(i => i._id === id);
  console.log("iidata", iidata);
  const isArray = is(Array);
  const isObject = is(Object);
  const fn = (val, key) => {
    const componentToCreate = componentschemas.get().find(i => `___NEW_${i.title}` === val);
    if(componentToCreate) {
      const compP = Object.entries(componentTypes).find(([j]) => componentToCreate.title === `component${j.toLowerCase()}`);
      const defaults = compP?.[1]?.defaultProps || {};
      return new Promise((res, rej) => addComponent(componentToCreate.title, {
        title: `Group ${key}: ${iidata.title} [${Math.floor(Math.random()*10e10)}]`,
        ...defaults,
      }, res, rej)).then(i => i._id);
    }
    return Promise.resolve(val);
  };
  const switchTypes = asyncify((value, key) => {
    if(isArray(value)) {
      return mapArrayValues(value)
    }
    if(isObject(value)) {
      return mapValuesDeep(value);
    }
    return fn(value, key);
  });
  const mapArrayValues = arr => {
    return Promise.all(arr.map(
      (j, jdx) => new Promise(
        (res, rej) => switchTypes(j, jdx, (err, val) => err ? rej(err) : res(val))
      )
    ));
  };
  // const mapArrayValues = arr => mapSeries(arr, (value, cb) => {
  //   return switchTypes(value, null, cb);
  // });
  const mapValuesDeep = obj => mapValuesSeries(obj, (value, key, cb) => {
    return switchTypes(value, key, cb);
  });
  const idata = yield new Promise((res, rej) => switchTypes(iidata, null, (err, d) => err ? rej(err) : res(d)));
  const prevValue = toJS(comp);
  if(!comp) {
    console.error(`Can't find component for id ${id}`);
    return reject(`Component "${id}" not found!`)
  }
  try {
    if(options?.optimistic) {
      const predicatedNewValue = mergeDeepRight(prevValue, idata);
      if(comp["x-type"] === "page") {
        pages[pages.findIndex(i => i._id === id)] = predicatedNewValue;
      } else if(comp["x-type"] === "website") {
        websites[websites.findIndex(i => i._id === id)] = predicatedNewValue;
      } else {
        components.set(id, predicatedNewValue);
      }
    }
    const removeAttrs = omit(Object.keys(prevValue).filter(i => i.startsWith("_") || i.startsWith("x-")));
    const { data } = yield request(`https://zcmsapi.herokuapp.com/api/v1/${comp["x-type"]}/${id}`, {
      method: options?.verb || "PATCH",
      cache: "no-cache",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(options?.verb ? idata : removeAttrs(mergeDeepRight(prevValue, idata)))
    }, options).then(i => !i.ok ? Promise.reject(i) : i.json());
    components.set(id, data);
    resolve(data);
    return data;
  } catch (err) {
    if(options?.optimistic) { // rollback
      components.set(id, prevValue);
    }
    console.error(err);
    reject(err);
    return err;
  }
});

export const removeComponentfromGroup = flow(function*(componentid, groupid, resolve, reject, options) {
    if(!componentid) {
      return reject("componentid is a required argument!");
    }
    const obsgroup = components.get(groupid);
    const rindex = obsgroup.components.indexOf(componentid);
    try {
      const group = toJS(obsgroup);
      group.components.splice(rindex, 1);
      if(options?.optimistic) {
        obsgroup.components.splice(rindex, 1);
      }
      const { data } = yield request(`https://zcmsapi.herokuapp.com/api/v1/componentgroup/${groupid}`, {
        method: "PATCH",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          components: group.components
        })
      }, options).then(i => !i.ok ? Promise.reject(i) : i.json());
      components.set(groupid, data);
      resolve(data);
      return data;
    } catch (err) {
      if(options?.optimistic) { // rollback
        obsgroup.components.splice(rindex, 0, componentid);
      }
      console.error(err);
      reject(err);
      return err;
    }
});

export const addComponenttoGroup = flow(function*(componentid, groupid, resolve, reject, options) {
    if(!componentid) {
      return reject("componentid is a required argument!");
    }
    if(!groupid) {
      const newgroup = yield new Promise((res, rej) => addComponent("componentgroup", {
        _draft: false,
        _client: components.get(componentid)._client,
        title: `Autogenerated group ${Math.random().toString()}`,
        groupdesc: `Autogenerated group to contain ${componentid}`,
        components: [componentid]
      }, res, rej, options));
      const newValue = assocPath(options.parentpath, newgroup._id, {});
      const editedcomp = yield new Promise((res, rej) => editComponent(options.parent._id, newValue, res, rej, options));
      // toJS  components.get(options.parent._id)

      return editedcomp;
    }
    const obsgroup = components.get(groupid);
    try {
      const group = toJS(obsgroup);
      group.components.splice(options?.pos === undefined ? -1 : options.pos, 0, componentid);
      if(options?.optimistic) {
        obsgroup.components.splice(options?.pos === undefined ? -1 : options.pos, 0, componentid);
      }
      const { data } = yield request(`https://zcmsapi.herokuapp.com/api/v1/componentgroup/${groupid}`, {
        method: "PATCH",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          components: group.components
        })
      }, options).then(i => !i.ok ? Promise.reject(i) : i.json());
      components.set(groupid, data);
      resolve(data);
      return data;
    } catch (err) {
      if(options?.optimistic) { // rollback
        obsgroup.components.splice(obsgroup.components.indexOf(componentid), 1);
      }
      console.error(err);
      reject(err);
      return err;
    }
});

export const componentsbygroup = computed(() =>
    groupBy(i => i["x-type"], components.get().values())
);

website.observe(function(change) {
    fetchAllComponents();
});
componentschemas.observe(function(change) {
    fetchAllComponents();
});
