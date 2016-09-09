import React, { PropTypes, Component } from 'react';

export class PageDrawerContentArea extends Component {
    render() {
        let className = 'page-drawer-content';

        return (
            <div className={className}>
	                {this.props.children}
            </div>
        );
    }
}

PageDrawerContentArea.displayName = 'PageDrawerContentArea';
