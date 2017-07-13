/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumbs } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';
import { BreadcrumbsStyled } from './styles/BreadcrumbsStyled';
import { LinkStyled } from './styles/LinkStyled';

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
const LinkComponent = ({ onClick, children }) => (
  <LinkStyled onClick={onClick}>
    {children}
  </LinkStyled>
);
/* eslint-enable react/prop-types */

export class ComplexPropBreadcrumbs extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this._handleItemSelect = this._handleItemSelect.bind(this);
  }
  
  /**
   *
   * @param {number} index
   * @private
   */
  _handleItemSelect({ index }) {
    this.props.onItemSelect({ index });
  }
  
  render() {
    const { items } = this.props;
    
    return (
      <BreadcrumbsStyled>
        <Breadcrumbs
          items={items}
          linkComponent={LinkComponent}
          mode="dark"
          onItemClick={this._handleItemSelect}
        />
      </BreadcrumbsStyled>
    );
  }
}

ComplexPropBreadcrumbs.propTypes = propTypes;
ComplexPropBreadcrumbs.defaultProps = defaultProps;
ComplexPropBreadcrumbs.displayName = 'ComplexPropBreadcrumbs';
