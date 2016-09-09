import './BlockContent.scss';
import React, { PropTypes, Component } from 'react';

export class BlockContent extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let className = 'block-content';

	    const props = this.props;

        if (props.isEmpty) className += ' ' + 'is-empty';

        return (
            <div className={className}>
	            { props.children }
            </div>
        );
    }
}

BlockContent.propTypes = {
	isEmpty: PropTypes.bool
};

BlockContent.defaultProps = {
	isEmpty: false
};

BlockContent.displayName = 'BlockContent';

export * from './BlockContentTitle/BlockContentTitle';
export * from './BlockContentBox/BlockContentBox';
export * from './BlockContentNavigation/BlockContentNavigation';
export * from './BlockContentActions/BlockContentActions';
export * from './BlockContentShortcut/BlockContentShortcut';
export * from './BlockContentPlaceholder/BlockContentPlaceholder';