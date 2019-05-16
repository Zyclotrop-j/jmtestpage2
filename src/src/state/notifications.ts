import { observable, action } from 'mobx';

export const notifications = observable([]);

export const removeNotification = action(({ nid, idx }) => {
  const index = notifications.findIndex(i => i.nid && nid === i.nid) || idx;
  if (index > -1) {
    notifications.splice(index, 1);
  }
});
export const newNotification = action(notification => {
  const index = notifications.findIndex(i => i.nid && notification.nid === i.nid);
  if (index > -1) {
    notifications.splice(index, 1);
  }
  notifications.push(notification);
});
