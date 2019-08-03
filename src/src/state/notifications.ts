import { observable, action } from 'mobx';
import { toast } from 'react-toastify';

export const notifications = observable([]);

export const removeNotification = action(({ nid, idx = -1 }) => {
  const index = notifications.findIndex(i => i.nid && nid === i.nid) || idx;
  if (index > -1) {
    notifications.splice(index, 1);
  }
  toast.dismiss(nid);
});
export const newNotification = action(notification => {
  const index = notifications.findIndex(i => i.nid && notification.nid === i.nid);
  if (index > -1) {
    notifications.splice(index, 1);
  }
  const statusMapping = {
    default: toast.TYPE.DEFAULT,
    info: toast.TYPE.INFO,
    success: toast.TYPE.SUCCESS,
    warning: toast.TYPE.WARNING,
    error: toast.TYPE.ERROR,
    fail: toast.TYPE.ERROR,
    ok: toast.TYPE.SUCCESS,
  };
  notifications.push(notification);
  if(toast.isActive(notification.nid)) {
    toast.update(notification.nid, {
      type: statusMapping[notification.status],
      render: notification.message
    });
  } else {
    toast(notification.message, {
      type: statusMapping[notification.status],
      toastId: notification.nid
    });
  }
});
