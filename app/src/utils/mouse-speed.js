/**
 * @author Dmitriy Bizyaev
 */

let interval = 0;
let consumers = 0;
let lastX = -1;
let lastY = -1;
let travelX = 0;
let travelY = 0;
let speedX = 0;
let speedY = 0;

const MEASURE_INTERVAL = 50;

const mouseMoveListener = event => {
  if (lastX > -1 && lastY > -1) {
    travelX += event.pageX - lastX;
    travelY += event.pageY - lastY;
  }
  
  lastX = event.pageX;
  lastY = event.pageY;
};

const updateSpeed = () => {
  // Speed is in px/msec
  speedX = travelX / MEASURE_INTERVAL;
  speedY = travelY / MEASURE_INTERVAL;
  travelX = 0;
  travelY = 0;
};

export const startMouseSpeedMeasuring = () => {
  if (consumers === 0) {
    window.addEventListener('mousemove', mouseMoveListener);
    interval = setInterval(updateSpeed, MEASURE_INTERVAL);
  }
  
  consumers++;
};

export const stopMouseSpeedMeasuring = () => {
  consumers--;
  
  if (consumers === 0) {
    window.removeEventListener('mousemove', mouseMoveListener);
    clearInterval(interval);
    interval = 0;
    lastX = -1;
    lastY = -1;
    travelX = 0;
    travelY = 0;
    speedX = 0;
    speedY = 0;
  }
};

export const getMouseSpeed = () => consumers > 0
  ? { x: speedX, y: speedY }
  : null;
