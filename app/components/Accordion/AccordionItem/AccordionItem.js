'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Icon } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';

const propTypes = {
  itemId: PropTypes.string,
  title: PropTypes.string,
  expanded: PropTypes.bool,
  contentBlank: PropTypes.bool,
  onToggleExpanded: PropTypes.func,
};

const defaultProps = {
  itemId: '',
  title: '',
  expanded: false,
  contentBlank: false,
  onToggleExpanded: noop,
};

export class AccordionItem extends PureComponent {
  constructor(...args) {
    super(...args);

    this._handleToggleExpand = this._handleToggleExpand.bind(this);
  }

  _handleToggleExpand() {
    this.props.onToggleExpanded(this.props.itemId);
  }

  render() {
    let className = 'accordion-item';

    className += this.props.expanded
      ? ' accordion-item-is-expanded'
      : ' accordion-item-is-collapsed';

    if (this.props.contentBlank) className += ' accordion-content-blank';

    return (
      <div className={className}>
        <div
          className="accordion-title-box"
          onClick={this._handleToggleExpand}
        >
          <div className="accordion-title">
            <span>{this.props.title}</span>
          </div>

          <div className="accordion-title-icon accordion-icon-collapse">
            <Icon name="chevron-down" />
          </div>
        </div>

        <div className="accordion-item-content-box">
          {this.props.children}
        </div>
      </div>
    );
  }
}

AccordionItem.propTypes = propTypes;
AccordionItem.defaultProps = defaultProps;
AccordionItem.displayName = 'AccordionItem';
