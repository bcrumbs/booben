import React from 'react';
import PropTypes from 'prop-types';
import { PageDrawerStyled } from './styles/PageDrawerStyled';
import { PageDrawerWrapperStyled } from './styles/PageDrawerWrapperStyled';

const propTypes = {
  isExpanded: PropTypes.bool,
  hasActions: PropTypes.bool,
  position: PropTypes.oneOf(['left', 'right']),
};

const defaultProps = {
  isExpanded: true,
  hasActions: false,
  position: 'right',
};

export const PageDrawer = props => (
  <PageDrawerStyled
    collapsed={!props.isExpanded}
    hasActions={props.hasActions}
    position={props.position}
  >
    <PageDrawerWrapperStyled
      collapsed={!props.isExpanded}
      hasActions={props.hasActions}
      position={props.position}
    >
      {props.children}
    </PageDrawerWrapperStyled>
  </PageDrawerStyled>
);

PageDrawer.propTypes = propTypes;
PageDrawer.defaultProps = defaultProps;
PageDrawer.displayName = 'PageDrawer';
