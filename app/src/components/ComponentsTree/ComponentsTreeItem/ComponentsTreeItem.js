'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';
import './ComponentsTreeItem.scss';

const propTypes = {
  componentId: PropTypes.number.isRequired,
  itemElement: PropTypes.element,
  active: PropTypes.bool,
  expanded: PropTypes.bool,
  onExpand: PropTypes.func,
};

const defaultProps = {
  itemElement: null,
  active: false,
  expanded: false,
  onExpand: noop,
};

export class ComponentsTreeItem extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._expandButtonElement = null;
  
    this._saveExpandButtonRef = this._saveExpandButtonRef.bind(this);
  }
  
  componentDidMount() {
    if (this._expandButtonElement) {
      this._expandButtonElement.addEventListener('click', event => {
        if (event.button === 0) this._handleExpand();
      });
    }
  }
  
  _saveExpandButtonRef(ref) {
    this._expandButtonElement = ref;
  }
  
  _handleExpand() {
    const { componentId, expanded, onExpand } = this.props;
    onExpand({ componentId, expanded: !expanded });
  }

  render() {
    const { expanded, active, itemElement, children } = this.props;

    let className = 'components-tree-item';
    className += expanded ? ' sublevel-is-visible' : ' sublevel-is-hidden';
    if (active) className += ' item-is-active';

    let content = null;
    let icon = null;

    if (children) {
      if (expanded) {
        content = (
          <div className="components-tree-item-sublevel">
            {children}
          </div>
        );
      }

      icon = (
        <div
          className="components-tree-item-icon"
          ref={this._saveExpandButtonRef}
        >
          <Button icon="chevron-down" size="small" />
        </div>
      );

      className += ' has-sublevel';
    }

    return (
      <li
        className={className}
      >
        <div className="components-tree-item-content">
          {icon}
          {itemElement}
        </div>

        {content}
      </li>
    );
  }
}

ComponentsTreeItem.propTypes = propTypes;
ComponentsTreeItem.defaultProps = defaultProps;
ComponentsTreeItem.displayName = 'ComponentsTreeItem';

export * from './ComponentsTreeItemTitle/ComponentsTreeItemTitle';
