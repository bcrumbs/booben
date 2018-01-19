/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} cX
 * @param {number} cY
 * @param {number} r
 * @return {boolean}
 */
export const pointIsInCircle = (x, y, cX, cY, r) =>
  (x - cX) ** 2 + (y - cY) ** 2 <= r ** 2;

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} cX
 * @param {number} cY
 * @param {number} r
 * @return {number}
 */
export const pointPositionRelativeToCircle = (x, y, cX, cY, r) =>
  ((x - cX) ** 2 + (y - cY) ** 2) / (r ** 2);

/**
 *
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @return {number}
 */
export const distance = (x1, y1, x2, y2) =>
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

/**
 *
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @return {number}
 */
export const tiltAngle = (x1, y1, x2, y2) => x1 >= x2
  ? Math.atan((y1 - y2) / (x1 - x2))
  : Math.atan((y1 - y2) / (x1 - x2)) - Math.PI;

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} rx
 * @param {number} ry
 * @param {number} rw
 * @param {number} rh
 * @return {boolean}
 */
export const pointIsInRect = (x, y, rx, ry, rw, rh) =>
  x >= rx &&
  x <= rx + rw &&
  y >= ry &&
  y <= ry + rh;

/**
 *
 * @type {Object<string, number>}
 */
export const PointPositions = {
  INSIDE: 0x00,
  NORTH: 0x01,
  NORTH_EAST: 0x11,
  EAST: 0x10,
  SOUTH_EAST: 0x12,
  SOUTH: 0x02,
  SOUTH_WEST: 0x22,
  WEST: 0x20,
  NORTH_WEST: 0x21,
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} rx
 * @param {number} ry
 * @param {number} rw
 * @param {number} rh
 * @return {number}
 */
export const pointPositionRelativeToRect = (x, y, rx, ry, rw, rh) => {
  let horizontal = PointPositions.INSIDE;
  let vertical = PointPositions.INSIDE;

  if (x < rx) horizontal = PointPositions.WEST;
  else if (x > rx + rw) horizontal = PointPositions.EAST;

  if (y < ry) vertical = PointPositions.NORTH;
  else if (y > ry + rh) vertical = PointPositions.SOUTH;

  return horizontal | vertical;
};
