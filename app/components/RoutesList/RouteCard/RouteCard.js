'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { Icon } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';

export class RouteCard extends Component {
    constructor(props) {
        super(props);

        this._refCallback = this._refCallback.bind(this);
        this._handleEditIndexClick = this._handleEditIndexClick.bind(this);
    }

    _refCallback(el) {
        if (el) el.addEventListener('dblclick', this.props.onGo);
    }
    
    _handleEditIndexClick() {
        this.props.onEditIndexClick();
    }

    render() {
        let className = 'route-card-wrapper';

        if (this.props.redirect) className += ' has-redirect';
        if (this.props.index) className += ' is-index';
        if (this.props.focused) className += ' is-focused';

        let icon = null;
        if (this.props.redirect) {
            icon = (
                <div className="route-icon">
                    <Icon name="random" />
                </div>
            );
        }

	    // let defaultIndex = null;
	    // if (this.props.haveIndex) {
		 //    defaultIndex =
			//     <li className="route-index-default" tabIndex="1">
			// 	    <div
         //                className="route-index-default-button"
         //                onClick={this._handleEditIndexClick}
         //            >
         //                Edit index
         //            </div>
			//     </li>;
	    // }

	    let subtitle = null;
	    if (this.props.subtitle && !this.props.index) {
	    	subtitle = <div className="route-subtitle">{this.props.subtitle}</div>;
	    }

        return (
            <li className='route-card-item'>
	            <div className={className}>
	                <div
	                    className='route-card'
	                    tabIndex="1"
	                    onClick={this.props.onFocus}
	                    ref={this._refCallback}
	                >
	                    <div className="route-card-content">
	                        <div className="route-title-box">
	                            <span className="route-title">{this.props.title}</span>
	                            {icon}
	                        </div>

		                    { subtitle }
	                    </div>
	                </div>
	            </div>

                {this.props.children}
            </li>
        );
    }
}

RouteCard.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    home: PropTypes.bool,
    haveIndex: PropTypes.bool,
    focused: PropTypes.bool,
    index: PropTypes.bool,
    onFocus: PropTypes.func,
    onGo: PropTypes.func,
    onEditIndexClick: PropTypes.func
};

RouteCard.defaultProps = {
    title: '',
    subtitle: '',
    home: false,
    haveIndex: false,
    focused: false,
    index: false,
    onFocus: noop,
    onGo: noop,
    onEditIndexClick: noop
};

RouteCard.displayName = 'RouteCard';
