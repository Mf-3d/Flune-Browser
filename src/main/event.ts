import { EventEmitter } from "node:events";

type EventMap = {
  /**
   * Fire when the application initialization begins.
   * @returns
   */
  "init": () => void;

  /**
   * Fire when the navigation bar has finished loading.
   * @returns
   */
  "navigation-loaded": () => void;

  /**
   * Fired when the tab has finished loading.
   * @param {string} tabId The ID of the tab that finished loading
   * @returns 
   */
  "tab-loaded": (tabId: string) => void;

  /**
   * Fire when the protocol is accessed.
   * @param {string} url
   * @returns 
   */
  "protocol-accessed": (url: string) => void;
  "setting-opened": (type: "tab" | "window") => void;
  "config-updated": () => void;
  "theme-updated": (themeId: string) => void;
}

const event = new EventEmitter();

export default class {
  /**
   * Add a listener for the event.
   * 
   * @param event - The name of the event to listen for.
   * @param listener - The function to call when the event is emitted.
   */
  on: <K extends keyof EventMap>(event: K, listener: EventMap[K]) => any;

  /**
   * Add a listener for the **one-time** event.
   * 
   * @param event - The name of the event to listen for.
   * @param listener - The function to call when the event is emitted.
   */
  once: <K extends keyof EventMap>(event: K, listener: EventMap[K]) => any;

  /**
   * Remove a listener for the event.
   */
  off: <K extends keyof EventMap>(event: K, listener: EventMap[K]) => void;
  removeAllListeners: <K extends keyof EventMap>(event: K) => void;
  listeners: <K extends keyof EventMap>(event: K) => Function[];
  send: <K extends keyof EventMap>(event: K, ...args: any[]) => any;

  constructor() {
    // this.event = new EventEmitter();

    this.on = function <K extends keyof EventMap>(
      eventName: K,
      listener: EventMap[K]
    ): void {
      event.on(eventName, listener);
    }

    this.once = function <K extends keyof EventMap>(
      eventName: K,
      listener: EventMap[K]
    ): void {
      event.once(eventName, listener);
    }

    this.off = function <K extends keyof EventMap>(
      eventName: K,
      listener: EventMap[K]
    ): void {
      event.removeListener(eventName, listener);
    }

    this.removeAllListeners = function <K extends keyof EventMap>(
      eventName: K
    ): void {
      event.removeAllListeners(eventName);
    }

    this.listeners = function <K extends keyof EventMap>(
      eventName: K
    ): Function[] {
      return event.listeners(eventName);
    }

    this.send = function <K extends keyof EventMap>(
      eventName: K,
      ...args: any[]
    ): void {
      event.emit(eventName, ...args);
    }
  }
}