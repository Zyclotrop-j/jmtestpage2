export class EventTarget {
  constructor() {
    this.listeners = {};
    this.addEventListener = this.addEventListener.bind(this);
    this.removeEventListener = this.removeEventListener.bind(this);
    this.dispatchEvent = this.dispatchEvent.bind(this);
  }

  addEventListener(type, callback) {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  removeEventListener(type, callback) {
    if (!(type in this.listeners)) {
      return;
    }
    const stack = this.listeners[type];
    const index = stack.findIndex(i => i === callback);
    if(index > -1) {
      stack.splice(index, 1);
      return;
    }
  }

  dispatchEvent(event) {
    if (!(event.type in this.listeners)) {
      return true;
    }
    const stack = this.listeners[event.type].slice();
    stack.forEach(q => q.call(this, event));
    return !event.defaultPrevented;
  }

}
export default EventTarget;
