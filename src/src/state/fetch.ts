import { observable, action } from 'mobx';

export const requests = observable([]);

export const add = action(request => {
  requests.push(request);
});
export const remove = action((request) => {
  const index = requests.findIndex(i => i === request);
  if (index > -1) {
    requests.splice(index, 1);
  }
});

export default (...args) => {
  const req = fetch(...args);
  add(req);
  req.then(() => remove(req));
  return req;
};
