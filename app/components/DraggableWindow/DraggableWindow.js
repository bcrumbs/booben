import './DraggableWindow.scss';
import React, { PropTypes, Component } from 'react';

export class DraggableWindow extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let className = 'draggable-window';

	    if(this.props.isDragged) className += ' ' + 'is-dragged';

        return (
            <div className={className}>
	            { this.props.children }
            </div>
        );
    }
}

DraggableWindow.propTypes = {
	isDragged: PropTypes.bool
};

DraggableWindow.defaultProps = {
	isDragged: false
};

DraggableWindow.displayName = 'DraggableWindow';

export * from './DraggableWindowRegion/DraggableWindowRegion'
