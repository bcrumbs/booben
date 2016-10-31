'use strict';

import IntlMessageFormat from 'intl-messageformat';

export const getLocalizedText = (localization, language, id, values = {}) =>
    Object.keys(localization).length && (new IntlMessageFormat(localization.get(id), language)).format(values) || '';
