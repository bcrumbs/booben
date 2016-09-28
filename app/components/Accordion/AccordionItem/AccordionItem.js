'use strict';

import React, { PropTypes } from 'react';
import { Icon } from '@reactackle/reactackle';

export const AccordionItem = props => {
    let className = 'accordion-item';

	props.expanded
		? className += ' ' + 'accordion-item-is-expanded'
		: className += ' ' + 'accordion-item-is-collapsed';

	if (props.contentBlank) className += ' ' + 'accordion-content-blank';

	let icon =
		<div className="accordion-title-icon accordion-icon-collapse">
			<Icon name="chevron-down"/>
		</div>;

    return (
        <div
            className={className}
        >
	        <div className="accordion-title-box">
	            <div className="accordion-title">{props.title}</div>
		        { icon }
	        </div>
	        <div className="accordion-item-content-box">
                {props.children}
            </div>
        </div>
    );
};

AccordionItem.propTypes = {
	title: PropTypes.string,
	expanded: PropTypes.bool,
	contentBlank: PropTypes.bool
};

AccordionItem.defaultProps = {
	title: '',
	expanded: false,
	contentBlank: false
};

AccordionItem.displayName = 'AccordionItem';


