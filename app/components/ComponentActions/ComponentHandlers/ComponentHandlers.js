'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
  ComponentHandler,
} from './ComponentHandler/ComponentHandler';

import './ComponentHandlers.scss';

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

export const ComponentHandlers = props => {
  const className = 'component-handlers';
  
  const handlersList = props.items.map(item => (
    <ComponentHandler
      key={item.id}
      {...item}
    />
  ));
  
  return (
    <div className={className}>
      {handlersList}
    </div>
  );
};

ComponentHandlers.propTypes = propTypes;
ComponentHandlers.defaultProps = defaultProps;
ComponentHandlers.displayName = 'ComponentHandlers';

export * from './ComponentHandler/ComponentHandler';
