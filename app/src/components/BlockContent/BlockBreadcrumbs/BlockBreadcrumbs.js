import React from 'react';
import { Breadcrumbs } from '@reactackle/reactackle';
import { BlockBreadcrumbsStyled } from './styles/BlockBreadcrumbsStyled';

/* eslint-disable react/prop-types */
const LinkComponent = ({ onClick, children }) => (
  <a style={{ cursor: 'pointer' }} onClick={onClick}>
    {children}
  </a>
);
/* eslint-enable react/prop-types */

export const BlockBreadcrumbs = props => (
  <BlockBreadcrumbsStyled>
    <Breadcrumbs
      {...props}
      linkComponent={LinkComponent}
    />
  </BlockBreadcrumbsStyled>
);

BlockBreadcrumbs.propTypes = Breadcrumbs.propTypes;
BlockBreadcrumbs.defaultProps = Breadcrumbs.defaultProps;
BlockBreadcrumbs.displayName = 'BlockBreadcrumbs';
