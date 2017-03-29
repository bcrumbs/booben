'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';
import './ComponentActions.scss';

const propTypes = {
  addButtonText: PropTypes.string,
  onAdd: PropTypes.func,
};

const defaultProps = {
  addButtonText: '',
  onAdd: noop,
};

export const ComponentActions = props => (
  <div className="component-actions">
    {props.children}
    
    <div className="component-actions_button">
      <Button
        text={props.addButtonText}
        icon="plus"
        narrow
        onPress={props.onAdd}
      />
    </div>
  </div>
);

ComponentActions.propTypes = propTypes;
ComponentActions.defaultProps = defaultProps;
ComponentActions.displayName = 'ComponentActions';

export * from './ComponentAction/ComponentAction';
