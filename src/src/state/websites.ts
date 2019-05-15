import { observable, flow, action, autorun } from "mobx";

export const websites = observable([]);
export const current = observable.box(null);
export const loading = observable.box(false);
export const error = observable.box(null);

autorun(() => {
    console.log("websites:", websites);
});

autorun(() => {
    console.log("websites current:", current.get());
});

export const fetchAllWebsites = flow(function* () { // <- note the star, this a generator function!
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

export const setCurrentWebsite = action(website => {
    console.log("Setting current website to", website);
    current.set(website);
});
