import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactackle-button';

import { getLocalizedTextFromState } from '../../selectors';
import { BlockContentViewButton, IconAdd } from '../../components';
import { noop } from '../../utils/misc';

const mapStateToProps = state => ({
  getLocalizedText: getLocalizedTextFromState(state),
});

const AddButton = props => (
  <Button
    colorScheme="flatLight"
    icon={<IconAdd size="custom" color="currentColor" />}
    {...props}
  />
);

const wrap = connect(
  mapStateToProps,
  null,
);

const colorScheme = 'default';

const propTypes = {
  getLocalizedText: PropTypes.func.isRequired,
  addButtonAction: PropTypes.func,
};

const defaultProps = {
  addButtonAction: noop,
};

const RoutesListHeaderComponent = ({
  getLocalizedText,
  addButtonAction,
}) => {
  const title = getLocalizedText('structure.routeTreeEditorTitle');

  const changeViewButtonProps = {
    title,
    actionsSlot: addButtonAction && <AddButton onPress={addButtonAction} />,
  };

  return (
    <BlockContentViewButton
      colorScheme={colorScheme}
      clickable={false}
      {...changeViewButtonProps}
    />
  );
};

RoutesListHeaderComponent.propTypes = propTypes;
RoutesListHeaderComponent.defaultProps = defaultProps;

export const RoutesListHeader = wrap(RoutesListHeaderComponent);
