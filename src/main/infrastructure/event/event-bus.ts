import { EventEmitter } from "node:events";

import type { EventMap } from "./types";

export class EventBus {
  private readonly emitter = new EventEmitter;

  /**
   * Add a listener for the event.
   * 
   * @param event - The name of the event to listen for.
   * @param listener - The function to call when the event is emitted.
   * 
   * @returns Function to clean up registered events.
   */
  on<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => void
  ) {
    this.emitter.on(event, listener);

    return () => {
      this.off(event, listener)
    };
  }

  /**
   * Add a listener for the **one-time** event.
   * 
   * @param event - The name of the event to listen for.
   * @param listener - The function to call when the event is emitted.
   */
  once<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => void
  ) {
    this.emitter.once(event, listener);
  }

  /**
   * Remove a listener for the event.
   */
  off<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => void
  ) {
    this.emitter.off(event, listener);
  }

  removeAllListeners<K extends keyof EventMap>(event: K) {
    this.emitter.removeAllListeners(event);
  };

  send<K extends keyof EventMap>(
    event: K,
    ...args: EventMap[K] extends void ? [] : [EventMap[K]]
  ) {
    this.emitter.emit(event, ...args);
  }
}