'use strict';

import './Accordion.scss';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { AccordionItem } from './AccordionItem/AccordionItem';
import { Set, Record } from 'immutable';

export class Accordion extends Component {
    constructor(props) {
        super(props);

        this.state = {
            expandedItems: Set()
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.items !== this.props.items ||
            nextState.expandedItems !== this.state.expandedItems;
    }

    _replaceExpanded(idx) {
        this.setState({
            expandedItems: Set([idx])
        });
    }

    _toggleItem(idx) {
        const exclude = this.state.expandedItems.has(idx);

        this.setState({
            expandedItems: exclude
                ? this.state.expandedItems.delete(idx)
                : this.state.expandedItems.add(idx)
        });
    }

    render() {
        const onExpandFn = this.props.single
            ? this._replaceExpanded
            : this._toggleItem;

        const items = this.props.items.map((item, idx) => (
            <AccordionItem
                key={idx}
                title={item.title}
                expanded={this.state.expandedItems.has(idx)}
                onExpand={onExpandFn.bind(this, idx)}
            >
                {item.content}
            </AccordionItem>
        ));

        return (
            <div className="accordion">
                <div className="accordion-list">
                    {items}
                </div>
            </div>
        );
    }
}

export const AccordionItemRecord = Record({
    title: '',
    content: null
});

Accordion.propTypes = {
    items: ImmutablePropTypes.listOf(
        PropTypes.instanceOf(AccordionItemRecord)
    ),

    single: PropTypes.bool
};

Accordion.defaultProps = {
    items: [],
    single: false
};

Accordion.displayName = 'Accordion';
