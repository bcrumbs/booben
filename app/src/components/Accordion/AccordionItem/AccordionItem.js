'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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
    const { itemId, onToggleExpanded } = this.props;
    onToggleExpanded(itemId);
  }

  render() {
    const { expanded, contentBlank, title, children } = this.props;

    let className = 'accordion-item';

    className += expanded
      ? ' accordion-item-is-expanded'
      : ' accordion-item-is-collapsed';

    if (contentBlank) className += ' accordion-content-blank';

    return (
      <div className={className}>
        <div
          className="accordion-title-box"
          onClick={this._handleToggleExpand}
        >
          <div className="accordion-title">
            <span>{title}</span>
          </div>

          <div className="accordion-title-icon accordion-icon-collapse">
            <Icon name="chevron-down" />
          </div>
        </div>

        <div className="accordion-item-content-box">
          {children}
        </div>
      </div>
    );
  }
}

AccordionItem.propTypes = propTypes;
AccordionItem.defaultProps = defaultProps;
AccordionItem.displayName = 'AccordionItem';
