'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
  ComponentActionListItem,
} from './ComponentActionListItem/ComponentActionListItem';

const propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  })),
};

const defaultProps = {
  items: [],
};

export const ComponentActionsList = props => {
  const className = 'component-actions-list';

  const actionsList = props.items.map(item => (
    <ComponentActionListItem
      key={item.id}
      title={item.title}
      description={item.description}
    />
  ));

  return (
    <div className={className}>
      {actionsList}
    </div>
  );
};

ComponentActionsList.propTypes = propTypes;
ComponentActionsList.defaultProps = defaultProps;
ComponentActionsList.displayName = 'ComponentActionsList';

export * from './ComponentActionListItem/ComponentActionListItem';
