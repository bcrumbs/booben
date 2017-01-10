'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';
import { PropList, PropInput } from '../../props';

const propTypes = {
  editingOn: PropTypes.bool,
};

const defaultProps = {
  editingOn: false,
};

export const ComponentActionEditing = props => {
  const title = props.editingOn
    ? 'Edit Action'
    : 'New Action';

  return (
    <div className="component-action-editing-box">
      <div className="component-action-editing-title">
        {title}
      </div>
      
      <div className="component-action-editing-body">
        <PropList label="Trigger" />
        <PropList label="Action" />
        <PropInput label="Anchor" value="route: ItemRoute" linkable />
      </div>
      
      <div className="component-action-buttons-wrapper">
        <Button text="Cancel" narrow />
        <Button text="Save Action" narrow />
      </div>
    </div>
  );
};

ComponentActionEditing.propTypes = propTypes;
ComponentActionEditing.defaultProps = defaultProps;
ComponentActionEditing.displayName = 'ComponentActionEditing';
