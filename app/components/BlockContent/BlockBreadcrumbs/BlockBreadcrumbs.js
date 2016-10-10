import React, { PropTypes } from 'react';
import {
	Icon,
	Breadcrumbs
} from '@reactackle/reactackle';
import './BlockBreadcrumbs.scss';

const
	propTypes = {
		items: PropTypes.arrayOf(),
		mode: PropTypes.oneOf(['light', 'dark']) /* color of elements. if light, breadcrumbs text will be white */
	},
	defaultProps = {
		items: [],
		mode: 'dark'
	};

export const BlockBreadcrumbs = props => {
    let className = 'block-breadcrumbs';

    return (
        <div className={className}>
            <Breadcrumbs
	            mode={props.mode}
                items={props.items}
            />
        </div>
    );
};

BlockBreadcrumbs.propTypes = propTypes;
BlockBreadcrumbs.defaultProps = defaultProps;
BlockBreadcrumbs.displayName = 'BlockBreadcrumbs';
