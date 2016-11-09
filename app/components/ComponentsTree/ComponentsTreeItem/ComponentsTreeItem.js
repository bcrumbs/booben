'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';

import {
    Button,
    Tooltip
} from '@reactackle/reactackle';

import { noop } from '../../../utils/misc';

const isEllipsisActive = el => el.offsetWidth < el.scrollWidth;

export class ComponentsTreeItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            haveTooltip: false
        };

        this._titleRef = null;

        Object.keys(props).forEach(
          name => typeof props[name] === 'function' && (this[`_${name}`] = (...args) => props[name](props.componentId, ...args))
        );

        this._saveTitleRef = this._saveTitleRef.bind(this);

    }

    componentDidMount() {
        this._updateHaveTooltip();
    }

    componentDidUpdate() {
        this._updateHaveTooltip();
    }

    _updateHaveTooltip() {
        const needTooltip = !!this._titleRef && isEllipsisActive(this._titleRef);

        if (needTooltip !== this.state.haveTooltip)
            this.setState({ haveTooltip: true });
    }

    _saveTitleRef(ref) {
        this._titleRef = ref;
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

        const onHoverIn = () => this._onHover(true),
            onHoverOut = () => this._onHover(false);

        const customProps = {
          'data-jssy-id': this.props.componentId
        };
        
        return (
            <li className={className} {...customProps}  >
                <div className="components-tree-item-content">
                    {icon}

                    <button
                        className={buttonClassName}
                        onMouseEnter={onHoverIn}
                        onMouseLeave={onHoverOut}
                        onClick={() => this._onSelect(!this.props.active)}
                        onMouseDown={ this._onMouseDown }
                    >
                        <div
                            ref={this._saveTitleRef}
                            className={titleClassName}
                            onMouseOver={onHoverIn}
                            onMouseOut={onHoverOut}
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
