import React from 'react';
import PropTypes from 'prop-types';
import { PageDrawerStyled } from './styles/PageDrawerStyled';
import { PageDrawerWrapperStyled } from './styles/PageDrawerWrapperStyled';

const propTypes = {
  isExpanded: PropTypes.bool,
  hasActions: PropTypes.bool,
};

const defaultProps = {
  isExpanded: true,
  hasActions: false,
};

export const PageDrawer = props => (
  <PageDrawerStyled
    collapsed={!props.isExpanded}
    hasActions={props.hasActions}
  >
    <PageDrawerWrapperStyled
      collapsed={!props.isExpanded}
      hasActions={props.hasActions}
    >
      {props.children}
    </PageDrawerWrapperStyled>
  </PageDrawerStyled>
);

PageDrawer.propTypes = propTypes;
PageDrawer.defaultProps = defaultProps;
PageDrawer.displayName = 'PageDrawer';
