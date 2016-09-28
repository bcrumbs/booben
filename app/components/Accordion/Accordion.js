'use strict';

import './Accordion.scss';
import React, { PropTypes } from 'react';

export const Accordion = props => {
    let className = 'accordion';

    return (
        <div
            className={className}
        >
	        <div className="accordion-list">
                {props.children}
            </div>
        </div>
    );
};

Accordion.propTypes = {
};

Accordion.defaultProps = {
};

Accordion.displayName = 'Accordion';

export * from './AccordionItem/AccordionItem';

