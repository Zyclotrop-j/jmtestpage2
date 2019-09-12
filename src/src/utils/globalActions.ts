import { tryCatch, identity } from "ramda";

const actions = typeof window !== 'undefined' ? window.globalActions : {};

const parseArgs = tryCatch(
  (p, q) => p.concat(Array.isArray(JSON.parse(q)) ? JSON.parse(q) : [JSON.parse(q)]),
  (e, p, q) => p.concat(q?.split(","))
);

function fnGlobalAction(param) {
  if(!param) return;
  const baseSplit = param.split(";");
  console.log("param", param);
  const [fn = "", ...args] = baseSplit.reduce(parseArgs, []);
  console.log("baseSplit", baseSplit, fn, args);
  const gAction = actions[fn.toUpperCase()];
  if(!gAction) {
    if(fn) console.warn(`Couldn't find global action ${fn}`, param, actions);
    return;
  }
  function play(e) {
    if(!gAction.available) {
      console.warn(`globalAction ${fn} was triggered but is unavailable!`, actions, gAction);
      return;
    }
    return gAction.trigger(...args, e);
  };
  Object.entries(gAction).forEach(([k, v]) => { play[k] = v; })
  return play;
};
Object.defineProperty(fnGlobalAction, 'actions', {
  // Using shorthand method names (ES2015 feature).
  // This is equivalent to:
  // get: function() { return bValue; },
  // set: function(newValue) { bValue = newValue; },
  get() { return Object.keys(window?.globalActions); },
  enumerable: false,
  configurable: false
});
Object.defineProperty(fnGlobalAction, 'actionconfigurations', {
  // Using shorthand method names (ES2015 feature).
  // This is equivalent to:
  // get: function() { return bValue; },
  // set: function(newValue) { bValue = newValue; },
  get() { return window?.globalActions; },
  enumerable: false,
  configurable: false
});

export const getGlobalAction = fnGlobalAction;
