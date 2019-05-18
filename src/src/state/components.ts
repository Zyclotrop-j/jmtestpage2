import { toJS, observable, flow, action, computed, autorun } from "mobx";
import { groupBy, mergeDeepRight, assocPath, path } from "ramda";
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

export const addComponent = flow(function*(type, data, resolve, reject, options = {}) {
    try {
      const client = options.skipClientCheck ? data._client : website.get()._client;
      if(data._client && client !== data._client) {
        throw new Error(`Client mismatch - can't put components of client ${data._client} on website domain ${client}`);
      }
      data._client = client; // Set _client to current domain
      const valid = ajv.validate(type, data);
      if(!valid) {
        console.error("AJV error", ajv.errors);
        throw new Error(ajv.errors);
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

export const editComponent = flow(function*(id, idata, resolve, reject, options) {
  const client = website.get()._client;
  if(idata._client && client !== idata._client) {
    throw new Error(`Client mismatch - can't put components of client ${idata._client} on website domain ${client}`);
  }
  idata._client = client; // Set _client to current domain
  const comp = components.get(id) || pages.find(i => i._id === id) || websites.find(i => i._id === id);
  const prevValue = toJS(comp);
  if(!comp) {
    console.error(`Can't find component for id ${id}`);
    throw new Error(`Component "${id}" not found!`)
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
    const { data } = yield request(`https://zcmsapi.herokuapp.com/api/v1/${comp["x-type"]}/${id}`, {
      method: options?.verb || "POST",
      cache: "no-cache",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(idata)
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
      throw new Error("componentid is a required argument!");
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
      throw new Error("componentid is a required argument!");
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
