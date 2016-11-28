/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '1234567890';
const LETTERS = UPPERCASE_LETTERS + LOWERCASE_LETTERS;
const LETTERS_LEN = LETTERS.length;
const ALL_CHARS = LETTERS + NUMBERS;
const ALL_CHARS_LEN = ALL_CHARS.length;

/**
 *
 * @param {number} [len=12]
 * @return {string}
 */
export const randomName = (len = 12) => {
    let ret = '';

    ret += LETTERS[Math.floor(Math.random() * LETTERS_LEN)];

    for (let i = len - 2; i >= 0; i--)
        ret += ALL_CHARS[Math.floor(Math.random() * ALL_CHARS_LEN)];

    return ret;
};
