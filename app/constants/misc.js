/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export const NO_VALUE = (() => {
    function NO_VALUE() {}
    NO_VALUE.prototype = Object.create(null);
    return new NO_VALUE();
})();
