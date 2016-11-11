'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';

import {
    Button,
    Tooltip
} from '@reactackle/reactackle';

import { noop } from '../../../utils/misc';

const isEllipsisActive = el => el.offsetWidth < el.scrollWidth;

export class ComponentsTreeItem extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            haveTooltip: false
        };

		this._isCursorOnTop = false;
        this._titleRef = null;

        this._onExpand = (...args) =>
			this.props.onExpand(this.props.componentId, ...args);
        this._onSelect = (...args) =>
			this.props.onSelect(this.props.componentId, !this.props.active, ...args);
        this._onHoverIn = (...args) =>
			this.props.onHover(
				this.props.componentId,
				true,
				this._isCursorOnTop,
				...args
			);
        this._onHoverOut = (...args) =>
			this.props.onHover(
				this.props.componentId,
				false,
				this._isCursorOnTop,
				...args
			);
        this._onMouseDown = (...args) =>
			this.props.onMouseDown(this.props.componentId, ...args);
		this._handleMouseMove = this._handleMouseMove.bind(this);
        this._saveTitleRef = this._saveTitleRef.bind(this);
    }

    componentDidMount() {
        this._updateHaveTooltip();
		window.addEventListener('mousemove', this._handleMouseMove);
    }

    componentDidUpdate() {
        this._updateHaveTooltip();
    }

	componentWillUnmount() {
		window.removeEventListener('mousemove', this._handleMouseMove);
	}

    _updateHaveTooltip() {
        const needTooltip = !!this._titleRef && isEllipsisActive(this._titleRef);

        if (needTooltip !== this.state.haveTooltip)
            this.setState({ haveTooltip: true });
    }

    _saveTitleRef(ref) {
        this._titleRef = ref;
    }

	_handleMouseMove(event) {

		const boundingClientRect = this._titleRef.getBoundingClientRect();
		const elementY = event.pageY - boundingClientRect.top;

		if (
			this._titleRef.contains(event.target)
			&&
			this._isCursorOnTop !== elementY < boundingClientRect.height / 2
		) {
			this._isCursorOnTop = elementY < boundingClientRect.height / 2;
			this._onHoverIn(event);
		}

		this._isCursorOnTop = elementY < boundingClientRect.height / 2;
	}

    render() {
        let className = 'components-tree-item';
        className += this.props.expanded ? ' sublevel-is-visible' : ' sublevel-is-hidden';

        let buttonClassName = 'components-tree-item-title-wrapper',
            tooltip = null;
	    if (this.props.active)
	    	buttonClassName += ' is-active';
		    className += ' item-is-active';

        // TODO: Use new tooltip logic from reactackle
        // if (this.state.haveTooltip) {
        //     buttonClassName += ' has-tooltip';
        //     tooltip = <Tooltip text={this.props.title} />;
        // }

        let children = null,
            icon = null;

        if (this.props.children) {
            children = (
                <div className="components-tree-item-sublevel">
                    {this.props.children}
                </div>
            );

            icon = (
                <div className="components-tree-item-icon">
                    <Button
                        icon="chevron-down"
                        onPress={() => this._onExpand(!this.props.expanded)}
                    />
                </div>
            );

            className += ' has-sublevel';
        }

        let titleClassName = 'components-tree-item-title';
        if (this.props.hovered) titleClassName += ' is-hovered';


        return (
            <li className={className}>
                <div className="components-tree-item-content">
                    {icon}

                    <button
                        className={buttonClassName}
                        onFocus={this._onHoverIn}
                        onBlur={this._onHoverOut}
                        onClick={this._onSelect}
                        onMouseDown={this._onMouseDown}
                    >
                        <div
                            ref={this._saveTitleRef}
                            className={titleClassName}
                            onMouseOver={this._onHoverIn}
                            onMouseOut={this._onHoverOut}

                        >
                            {this.props.title}
                        </div>

                        {tooltip}
                    </button>
                </div>

                {this.props.expanded ? children : null}
            </li>
        );
    }
}

ComponentsTreeItem.propTypes = {
    componentId: PropTypes.number.isRequired,
    title: PropTypes.string,
    active: PropTypes.bool,
    expanded: PropTypes.bool,
    hovered: PropTypes.bool,
    onExpand: PropTypes.func,
    onSelect: PropTypes.func,
    onHover: PropTypes.func,
    onMouseDown: PropTypes.func,
};

ComponentsTreeItem.defaultProps = {
    title: '',
    active: false,
    expanded: false,
    hovered: false,
    onExpand: noop,
    onSelect: noop,
    onHover: noop,
    onMouseDown: noop,
};

ComponentsTreeItem.displayName = 'ComponentsTreeItem';
