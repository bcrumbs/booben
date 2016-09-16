/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { PropTypes } from 'react';
import ButtonType from './Button';

export default PropTypes.shape({
    icon: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
    titleEditable: PropTypes.bool,
    onTitleChange: PropTypes.func,
    subtitle: PropTypes.string,
    undockable: PropTypes.bool.isRequired,
    closable: PropTypes.bool.isRequired,
    docked: PropTypes.bool,
    closed: PropTypes.bool,
    sections: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        component: PropTypes.func.isRequired,
        sideRegionComponent: PropTypes.func
    })).isRequired,
    mainButtons: PropTypes.arrayOf(ButtonType).isRequired,
    secondaryButtons: PropTypes.arrayOf(ButtonType).isRequired,
    windowMaxHeight: PropTypes.number
});
