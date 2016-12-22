import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';

const
  propTypes = {
    title: PropTypes.string.isRequired,
        /*
         * We should build description automatically
         * Pattern example
         * {trigger} '{subject}' state to {subject state} - Change "Component A" state to "State 1"
         */
    description: PropTypes.string.isRequired,
  },
  defaultProps = {
    title: null,
    description: null,
  };

export const ComponentActionListItem = props => {
  const className = 'component-action-item';

  return (
    <div className={className}>
      <div className="component-action-title-box">
        <div className="component-action-title">{props.title}</div>
        <div className="component-action-description">{props.description}</div>
      </div>

      <div className="component-action-buttons">
        <Button icon="pencil" />
        <Button icon="times" />
      </div>
    </div>
  );
};

ComponentActionListItem.propTypes = propTypes;
ComponentActionListItem.defaultProps = defaultProps;
ComponentActionListItem.displayName = 'ComponentActionListItem';
