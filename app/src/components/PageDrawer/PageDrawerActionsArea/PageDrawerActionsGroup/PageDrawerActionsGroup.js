import React from 'react';

import {
  PageDrawerActionsGroupStyled,
} from './styles/PageDrawerActionsGroupStyled';

export const PageDrawerActionsGroup = props => (
  <PageDrawerActionsGroupStyled {...props}>
    {props.children}
  </PageDrawerActionsGroupStyled>
);

PageDrawerActionsGroup.propTypes = PageDrawerActionsGroupStyled.propTypes;
PageDrawerActionsGroup.defaultProps = PageDrawerActionsGroupStyled.defaultProps;
PageDrawerActionsGroup.displayName = 'PageDrawerActionsGroup';
