import React, { PropTypes } from 'react';
import { ComponentActionListItem } from './ComponentActionListItem/ComponentActionListItem';

const
  propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string.isRequired,
      }),
    ).isRequired,
  },
  defaultProps = {
    items: [],
  };

export const ComponentActionsList = props => {
  const className = 'component-actions-list';

  const ActionsList = props.items.map((item, idx, array) => (
    <ComponentActionListItem
      title={item.title}
      description={item.description}
    />
  ));

  return (
    <div className={className}>
      { ActionsList }
    </div>
  );
};

ComponentActionsList.propTypes = propTypes;
ComponentActionsList.defaultProps = defaultProps;
ComponentActionsList.displayName = 'ComponentActionsList';

export * from './ComponentActionListItem/ComponentActionListItem';
