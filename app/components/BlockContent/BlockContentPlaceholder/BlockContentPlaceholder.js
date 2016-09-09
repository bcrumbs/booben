import React, { PropTypes, Component } from 'react';

export const BlockContentPlaceholder = props => {
    let className = 'block-content-placeholder';

	let text = null;
    if (props.text) {
	    text =
		    <div className="block-content-placeholder-text">
			    { props.text }
		    </div>
    }


    return (
        <div className={className}>
	        <div className="block-content-placeholder-content">
		        { text }
	            { props.children }
            </div>
        </div>
    );

}

BlockContentPlaceholder.propTypes = {
	text: PropTypes.string
};

BlockContentPlaceholder.defaultProps = {
	text: null
};

BlockContentPlaceholder.displayName = 'BlockContentPlaceholder';
