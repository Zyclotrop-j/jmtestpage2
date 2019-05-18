import { observable, flow, action, autorun } from "mobx";
import { auth } from "../utils/auth";
import { current as website, websites } from "./websites";

export const pages = observable([]);
export const current = observable.box(null);
export const loading = observable.box(false);
export const error = observable.box(null);

autorun(() => {
    console.log("pages:", pages);
});

export const fetchAllPages = flow(function* () { // <- note the star, this a generator function!
    const { pages: pageids = [] } = website.get();
    loading.set(true);
    error.set(null);
    pages.clear();
    try {
        const pagedata = yield Promise.all(pageids.map(pageid => fetch(`https://zcmsapi.herokuapp.com/api/v1/page/${pageid}`, {
          headers: {
            "authorization": `Bearer ${auth.getIdToken()}`,
            "x-client": website.get()._client,
          },
        }).then(i => i.json())));
        pages.replace(pagedata.map(i => i.data));
        current.set(null);
        loading.set(false);
    } catch (err) {
      console.log("error", err)
        pages.clear();
        error.set(err);
        loading.set(false);
    }
});

export const setCurrentPage = action(page => {
    current.set(page);
});

export const setCurrentPagebyId = action(id => {
    current.set(pages.find(page._id === id));
});

website.observe(function(change) {
  if(website?.get()) {
    fetchAllPages();
  }
});

websites.observe(function(change) {
  if(website?.get()) {
    fetchAllPages();
  }
});
