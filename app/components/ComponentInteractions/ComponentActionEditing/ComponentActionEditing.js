import React, { PropTypes } from 'react';
import {
  Button,
  Input,
  SelectBox,
} from '@reactackle/reactackle';

import {
  PropsItem,
} from '../../PropsList/PropsList';

const
  propTypes = {
    editingOn: PropTypes.bool,
  },
  defaultProps = {
    editingOn: false,
  };

export const ComponentActionEditing = props => {
  const className = 'component-action-editing-box';

  const title = props.editingOn
    ? 'Edit Action'
    : 'New Action';

  return (
    <div className={className}>
      <div className="component-action-editing-title">{ title }</div>
      <div className="component-action-editing-body">
        <PropsItem type="list" label="Trigger" />
        <PropsItem type="list" label="Action" />
        <PropsItem type="input" label="Anchor" value="route: ItemRoute" linkable />
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
