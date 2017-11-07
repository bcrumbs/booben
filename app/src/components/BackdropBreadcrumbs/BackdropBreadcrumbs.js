import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumbs } from '@reactackle/reactackle';
import { BreadcrumbLink } from './BreadcrumbLink';
import { BackdropBreadcrumbsStyled } from './styles/BackdropBreadcrumbsStyled';

const propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    tooltipText: PropTypes.string,
  })),
};
const defaultProps = {
  items: [],
};

export const BackdropBreadcrumbs = props => (
  <BackdropBreadcrumbsStyled>
    <Breadcrumbs
      mode="light"
      items={props.items}
      linkComponent={BreadcrumbLink}
    />
  </BackdropBreadcrumbsStyled>
);

BackdropBreadcrumbs.propTypes = propTypes;
BackdropBreadcrumbs.defaultProps = defaultProps;
BackdropBreadcrumbs.displayName = 'BackdropBreadcrumbs';
