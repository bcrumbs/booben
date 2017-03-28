'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import { Button } from '@reactackle/reactackle';

import {
  ComponentAction,
} from './ComponentAction/ComponentAction';

import './ComponentActions.scss';

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

export const ComponentActions = props => {
  const className = 'component-actions';
  
  const actionsList = props.items.map(item => (
    <ComponentAction
      key={item.id}
      {...item}
    />
  ));
  
  return (
    <div className={className}>
      {actionsList}
      
      <div className="component-actions_button">
        <Button text="Add Action" icon="plus" narrow />
      </div>
    </div>
  );
};

ComponentActions.propTypes = propTypes;
ComponentActions.defaultProps = defaultProps;
ComponentActions.displayName = 'ComponentActions';

export * from './ComponentAction/ComponentAction';
