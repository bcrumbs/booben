import './ComponentBreadcrumbs.scss';

import React, { PropTypes } from 'react';

export const ComponentBreadcrumbs = props => {
  const className = 'component-breadcrumbs';

  return (
    <div className={className}>
      { props.children }
    </div>
  );
};

ComponentBreadcrumbs.propTypes = {
};

ComponentBreadcrumbs.defaultProps = {
};

ComponentBreadcrumbs.displayName = 'ComponentBreadcrumbs';

export * from './ComponentBreadcrumbItem/ComponentBreadcrumbItem';
