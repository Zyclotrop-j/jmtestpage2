import { observable, action } from 'mobx';

export const viewmode = observable.box("default");

export const viewmodes = ["preview", "minimize", "default"];

export const setViewmode = action(mode => {
  if(!viewmodes.includes(mode)) {
    throw new Error(`Unknown viewmode ${mode}`);
  }
  viewmode.set(mode);
});
