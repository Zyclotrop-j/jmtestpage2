import { observable, action } from 'mobx';
import { toast } from 'react-toastify';

export const requests = observable([]);

const toastId = "RequestProgressToastId";
let maxrequests = 0;
const processtoasts = () => {
  const s = requests.length;
  if(toast.isActive(toastId)) {
    toast.update(toastId, {
      render: `${maxrequests - s} of ${maxrequests} done`,
      progress: 1 - (s / maxrequests)
    })
  } else {
    toast(`${maxrequests - s} of ${maxrequests} done`, {
      toastId: toastId,
      autoClose: false,
      progress: 0.01
    });
  }
  if(!s) {
    maxrequests = 0;
    toast.done(toastId)
  }
}

export const add = action(request => {
  requests.push(request);
  maxrequests++;
  processtoasts();
});
export const remove = action((request) => {
  const index = requests.findIndex(i => i === request);
  if (index > -1) {
    requests.splice(index, 1);
    processtoasts();
  }
});

export default (...args) => {
  const req = fetch(...args);
  add(req);
  req.then(() => remove(req));
  return req;
};
