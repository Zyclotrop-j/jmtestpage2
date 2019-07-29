import { toJS, observable, flow, action, computed, autorun } from "mobx";
import { groupBy, mergeDeepRight, assocPath, path, is, omit } from "ramda";
import mapValuesSeries from 'async/mapValuesSeries';
import mapSeries from 'async/mapSeries';
import asyncify from 'async/asyncify';
import { current as website, websites } from "./websites";
import { schemas, ajv } from "./schemas";
import { auth } from "../utils/auth";
import fetch from "./fetch";

const isArray = is(Array);
const isObject = is(Object);

export const entities = observable.map({});
export const loading = observable.box(false);
export const progress = observable.box(1);
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
    console.log("entities:", entities);
});

const createNewEntitiesDeepHelper = (iidata) => {
  const addedIds = [];
  const fn = (val, key) => {
    const componentToCreate = schemas.find(i => `___NEW_${i.title}` === val);
    if(componentToCreate) {
      return new Promise((res, rej) => addEntity(componentToCreate.title, {
        title: `Group ${key}: ${iidata.title} [${Math.floor(Math.random()*10e10)}]`
      }, res, rej)).then(i => {
        addedIds.push(i);
        return i._id;
      });
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
  const mapValuesDeep = obj => mapValuesSeries(obj, (value, key, cb) => {
    return switchTypes(value, key, cb);
  });
  return new Promise((res, rej) => switchTypes(iidata, null, (err, d) => err ? rej(err) : res({ d, addedIds })));
};

const fetchEntities = xcomponententities => Promise.all(
  xcomponententities.map(
    (i, idx, arr) => request(`https://zcmsapi.herokuapp.com/api/v1/${i.title}`, {
      cache: "no-cache"
    }).then(j => {
      const current = progress.get();
      progress.set(current + 1/(arr.size || arr.length));
      return j.json();
    })
  )
);

export const fetchAllEntities = flow(function*() {
    entities.clear();
    if(!website.get()) {
      console.warn(`Can't load entites without a website filter!`);
      return;
    }
    progress.set(0);
    loading.set(true);
    try {
      const allEntities = yield fetchEntities(schemas);
      progress.set(1);
      const data = allEntities.reduce((p, i) => ({
        ...p,
        ...i.data.reduce((p2, j) => ({
          ...p2,
          [j._id]: j
        }), {})
      }), {});
      entities.replace(data);
      loading.set(false);
    } catch (err) {
      entities.clear();
      error.set(err);
      loading.set(false);
    }
});

export const fetchEntity = flow(function*(type, id, resolve, reject) {
    if(!website.get()) {
      return;
    }
    try {
      const { data } = yield request(`https://zcmsapi.herokuapp.com/api/v1/${type}/${id}`, {
        cache: "no-cache"
      }).then(i => i.json());
      entities.set(id, data);
    } catch (err) {
      error.set(err);
    }
});

// aka createComponent = addComponent
export const addEntity = flow(function*(type, data, resolve, reject, options = {}) {
    try {
      const client = options.skipClientCheck ? data._client : website.get()._client;
      if(data._client && client !== data._client) {
        return reject(`Client mismatch - can't put components of client ${data._client} on website domain ${client}`);
      }

      data._client = client; // Set _client to current domain
      const valid = ajv.validate(type, data);
      if(!valid) {
        console.error("AJV error", ajv.errors);
        return reject(ajv.errors);
      }
      const qdata = yield createNewEntitiesDeepHelper(data);
      const tmp = yield request(`https://zcmsapi.herokuapp.com/api/v1/${type}`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(qdata.d)
      }, options).then(i => {
        return !i.ok ? Promise.reject(i) : i.json();
      });
      const { data: response } = tmp;
      entities.set(response._id, response);
      resolve({ d: response, sub: qdata.addedIds });
      return { d: response, sub: qdata.addedIds };
    } catch (err) {
      error.set(err);
      reject(err);
      return err;
    }
});

export const deleteEntity = flow(function*(id, resolve, reject, options = {}) {
    try {
      const comp = entities.get(id);
      const client = options.skipClientCheck ? comp._client : website.get()._client;
      if(comp._client && client !== comp._client) {
        return reject(`Client mismatch - can't put components of client ${data._client} on website domain ${client}`);
      }

      const tmp = yield request(`https://zcmsapi.herokuapp.com/api/v1/${comp["x-type"]}/${id}`, {
        method: "DELETE",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        }
      }, options).then(i => {
        return !i.ok ? Promise.reject(i) : i.json();
      });
      const { data: response } = tmp;
      entities.delete(response._id);
      resolve(response);
      return response;
    } catch (err) {
      error.set(err);
      reject(err);
      return err;
    }
});

export const editEntity = flow(function*(id, iidata, resolve, reject, options = {}) {
  const client = website.get()._client;
  if(iidata._client && client !== iidata._client) {
    return reject(`Client mismatch - can't put components of client ${iidata._client} on website domain ${client}`);
  }
  iidata._client = client; // Set _client to current domain
  const comp = entities.get(id);
  const idata = yield createNewEntitiesDeepHelper(iidata);
  const prevValue = toJS(comp);
  if(!comp) {
    console.error(`Can't find component for id ${id}`);
    return reject(`Component "${id}" not found!`)
  }
  try {
    if(options?.optimistic) {
      const predicatedNewValue = mergeDeepRight(prevValue, idata.d);
      components.set(id, predicatedNewValue);
    }
    const removeAttrs = omit(Object.keys(prevValue).filter(i => i.startsWith("_") || i.startsWith("x-")));
    const { data } = yield request(`https://zcmsapi.herokuapp.com/api/v1/${comp["x-type"]}/${id}`, {
      method: options?.verb || "PATCH",
      cache: "no-cache",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(options?.verb ? idata : removeAttrs(mergeDeepRight(prevValue, idata.d)))
    }, options).then(i => !i.ok ? Promise.reject(i) : i.json());
    entities.set(id, data);
    resolve({ d: data, sub: idata.addedIds });
    return { d: data, sub: idata.addedIds };
  } catch (err) {
    if(options?.optimistic) { // rollback
      entities.set(id, prevValue);
    }
    console.error(err);
    reject(err);
    return err;
  }
});

website.observe(function(change) {
    fetchAllEntities();
});
schemas.observe(function(change) {
    fetchAllEntities();
});
