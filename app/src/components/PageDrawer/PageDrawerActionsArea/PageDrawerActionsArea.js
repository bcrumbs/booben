import React from 'react';

import {
  PageDrawerActionsAreaStyled,
} from './styles/PageDrawerActionsAreaStyled';

export const PageDrawerActionsArea = props => (
  <PageDrawerActionsAreaStyled {...props}>
    {props.children}
  </PageDrawerActionsAreaStyled>
);

PageDrawerActionsArea.propTypes = PageDrawerActionsAreaStyled.propTypes;
PageDrawerActionsArea.defaultProps = PageDrawerActionsAreaStyled.defaultProps;
PageDrawerActionsArea.displayName = 'PageDrawerActionsArea';

export * from './PageDrawerActionsGroup/PageDrawerActionsGroup';
export * from './PageDrawerActionItem/PageDrawerActionItem';
export * from './PageDrawerActionPlaceholder/PageDrawerActionPlaceholder';
