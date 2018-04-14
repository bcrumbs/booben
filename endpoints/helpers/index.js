/**
 *
 * @param {Object} res
 * @param {number} code
 * @param {Object} data
 */
exports.sendJSON = (res, code, data) => {
  res.writeHead(code, {
    'content-type': 'application/json',
  });

  res.end(typeof data === 'string' ? data : JSON.stringify(data));
};

/**
 *
 * @param {Object} res
 * @param {number} [code]
 * @param {string} [text]
 * @param {Object} [extraFields]
 */
exports.sendError = (res, code, text, extraFields) => {
  exports.sendJSON(res, code || 500, Object.assign({
    error: text || 'An evil error has occurred. Sorry about that.',
  }, extraFields || {}));
};
