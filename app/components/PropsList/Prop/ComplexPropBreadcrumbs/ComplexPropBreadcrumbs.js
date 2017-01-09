/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Breadcrumbs } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';

const propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
  })),
  onItemSelect: PropTypes.func,
};

const defaultProps = {
  items: [],
  onItemSelect: noop,
};

/* eslint-disable react/prop-types */
const LinkComponent = ({ className, onClick, children }) => (
  <span className={className} style={{ cursor: 'pointer' }} onClick={onClick}>
    {children}
  </span>
);
/* eslint-enable react/prop-types */

export class ComplexPropBreadcrumbs extends PureComponent {
  constructor(props) {
    super(props);
    this._handleItemSelect = this._handleItemSelect.bind(this);
  }
  
  /**
   *
   * @param {number} index
   * @private
   */
  _handleItemSelect(index) {
    this.props.onItemSelect({ index });
  }
  
  render() {
    const { items } = this.props;
    
    return (
      <div className="prop-tree-breadcrumbs">
        <Breadcrumbs
          items={items}
          linkComponent={LinkComponent}
          mode="dark"
          onItemClick={this._handleItemSelect}
        />
      </div>
    );
  }
}

ComplexPropBreadcrumbs.propTypes = propTypes;
ComplexPropBreadcrumbs.defaultProps = defaultProps;
ComplexPropBreadcrumbs.displayName = 'ComplexPropBreadcrumbs';
