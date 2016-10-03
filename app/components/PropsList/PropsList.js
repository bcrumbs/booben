import './PropsList.scss'

import React, { PropTypes } from 'react';

export const PropsList = props => {
    let className = 'props-list';

    return (
        <div className={className}>
	        {props.children}
        </div>
    );
};

PropsList.propTypes = {
};

PropsList.defaultProps = {
};

PropsList.displayName = 'PropsList';

export * from './PropsItem/PropsItem';
