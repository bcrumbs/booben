/**
 * @author Dmitriy Bizyaev
 */

export const on = (element, eventName, listener, useCapture) =>
  element.addEventListener(eventName, listener, useCapture);

export const off = (element, eventName, listener, useCapture) =>
  element.removeEventListener(eventName, listener, useCapture);

export const stopPropagation = event => void event.stopPropagation();
