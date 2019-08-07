import { tryCatch, identity } from "ramda";

const actions = typeof window !== 'undefined' ? window.globalActions : {};

const parseArgs = tryCatch(
  (p, q) => p.concat([JSON.parse(q)]),
  (e, p, q) => p.concat(q?.split(","))
);

export const getGlobalAction = param => {
  if(!param) return;
  const baseSplit = param.split(";");
  console.log("param", param);
  const [fn, ...args] = baseSplit.reduce(parseArgs, []);
  const gAction = actions[fn.toUpperCase()];
  if(!gAction) {
    if(fn) console.warn(`Couldn't find global action ${fn}`, param, actions);
    return;
  }
  function play() {
    if(!gAction.available) {
      console.warn(`globalAction ${fn} was triggered but is unavailable!`, actions, gAction);
      return;
    }
    return gAction.trigger(...args);
  };
  Object.entries(gAction).forEach(([k, v]) => { play[k] = v; })
  return play;
};
