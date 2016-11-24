/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

export const PropImage = props => (
    <div className="prop-item-image-box">
        <img src={props.src} />
    </div>
);

PropImage.propTypes = {
    src: PropTypes.string
};

PropImage.defaultProps = {
    src: ''
};

PropImage.diplayName = 'PropImage';
