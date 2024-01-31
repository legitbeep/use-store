import { useMemo, useState } from "react";

class EventEmitter {
  eventsMap = {};

  addEvent(eventName, callback) {
    if (!this.eventsMap[eventName]) this.eventsMap[eventName] = new Set();
    this.eventsMap[eventName].add(callback);
    return () => {
      if (this.eventsMap[eventName]) {
        this.eventsMap[eventName].delete(callback);
      }
    };
  }

  emit(event) {
    if (this.eventsMap[event]) {
      (this.eventsMap[event] ?? []).forEach((cb) => {
        cb();
      });
    }
  }
}

const createStore = (initialState = {}) => {
  const eventEmitter = new EventEmitter();

  return (key) => {
    const [, reRender] = useState(0);
    let removeEvent = null;

    // whenever key changes add event for that key
    useMemo(() => {
      removeEvent = eventEmitter.addEvent(key, () => {
        // cause re render when new value added, will emit this later
        reRender((prev) => (prev + 1) % Number.MAX_SAFE_INTEGER);
      });
    }, [key]);

    return [
      initialState[key],
      (cb) => {
        initialState[key] = cb(initialState[key]);
        // emit event to cause re render
        eventEmitter.emit(key);
      },
      removeEvent,
    ];
  };
};

export default createStore;
