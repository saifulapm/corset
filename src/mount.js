// @ts-check

/**
 * @typedef {import('./sheet').SheetWithValues} SheetWithValues
 * @typedef {Record<string, any>} State 
 * @typedef {import('./types').MountedBehavior} MountedBehavior
 * @typedef {import('./types').MountedBehaviorType} MountedBehaviorType
*/

/** @type {Map<string, MountedBehaviorType>} */
export let registry = new Map();

/**
 * @typedef {(...args: any[]) => any} CallbackFunction
 * @typedef {(...args: any[]) => Promise<any>} AsyncCallbackFunction
 */

/**
 * 
 * @param {Mountpoint} mp 
 * @param {CallbackFunction} fn
 * @param {...any[]} args
 * @returns {any}
 */
function scopedCallback(mp, fn, ...args) {
  let res = fn.call(mp.behavior, ...args);
  mp.update();
  return res;
}

/**
 * 
 * @param {Mountpoint} mp 
 * @param {CallbackFunction} fn
 * @param {...any[]} args
 * @returns {Promise<any>}
 */
 async function scopedAsyncCallback(mp, fn, ...args) {
  let res = await Promise.resolve(fn.call(mp.behavior, ...args));
  mp.update();
  return res;
}

/**
 * 
 * @param {Mountpoint} mp 
 */
export function BehaviorContext(mp) {
  /** @type {Element | Document} */
  this.element = mp.rootElement;
  /** @type {() => void} */
  this.rebind = mp.update.bind(mp);
  /** @type {Map<string, Map<string, any>>} */
  this.stores = new Map();
}

export class Mountpoint {
  /**
   * 
   * @param {HTMLElement | Document} rootElement 
   * @param {MountedBehaviorType} Behavior 
   * @param {Map<string, any> | null} props
   */
  constructor(rootElement, Behavior, props) {
    /** @type {HTMLElement | Document} */
    this.rootElement = rootElement;
    /** @type {Map<string, any> | null} */
    this.props = props;
    /** @type {BehaviorContext} */
    this.context = new BehaviorContext(this);
    /** @type {MountedBehavior} */
    this.behavior = new Behavior(/** @type {never} */(props), this.context);
    /** @type {SheetWithValues | null} */
    this.bindings = null;
    /** @type {WeakMap<CallbackFunction, CallbackFunction>} */
    this.callbacks = new WeakMap();
  }
  /**
   * 
   * @param {(...args: any[]) => any} callbackFn 
   * @returns {CallbackFunction}
   */
  getCallback(callbackFn) {
    if(this.callbacks.has(callbackFn))
      return /** @type {CallbackFunction} */(this.callbacks.get(callbackFn));
    let listener = scopedCallback.bind(null, this, callbackFn);
    this.callbacks.set(callbackFn, listener);
    return listener;
  }
  /**
   * 
   */
  update() {
    this.bindings = this.behavior.bind(this.props, this.context);
    this.bindings.update(this);
  }

  unmount() {
    if(this.bindings)
      this.bindings.unmount(this);
  }
}

/**
 * 
 * @param {HTMLElement | Document} element 
 * @param {MountedBehaviorType} behavior 
 * @returns {void}
 */
export function mount(element, behavior) {
  let mp = new Mountpoint(element, behavior, null);
  mp.update();
}

/**
 * 
 * @param {string} name 
 * @param {MountedBehaviorType} behavior
 * @returns {void} 
 */
export function registerBehavior(name, behavior) {
  registry.set(name, behavior);
}