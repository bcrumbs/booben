/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { PropTypes } from 'react';

export default PropTypes.shape({
    icon: PropTypes.string,
    text: PropTypes.string,
    disabled: PropTypes.bool,
    onPress: PropTypes.func
});
