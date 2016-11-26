import React, { PropTypes } from 'react';
import {
	Icon,
	Breadcrumbs
} from '@reactackle/reactackle';
import './BlockBreadcrumbs.scss';

export const BlockBreadcrumbs = props => {
    let className = 'block-breadcrumbs';

    return (
        <div className={className}>
            <Breadcrumbs
	            {...props}
            />
        </div>
    );
};

BlockBreadcrumbs.propTypes = Breadcrumbs.propTypes;
BlockBreadcrumbs.defaultProps = Breadcrumbs.defaultProps;
BlockBreadcrumbs.displayName = 'BlockBreadcrumbs';
