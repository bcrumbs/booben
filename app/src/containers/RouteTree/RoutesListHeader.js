import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactackle-button';

import { currentRouteSelector } from '../../selectors/index';

import { getLocalizedTextFromState } from '../../selectors';

import { BlockContentViewButton, IconAdd } from '../../components';

const mapStateToProps = state => ({
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({});

const AddButton = props => (
  <Button
    radius="rounded"
    colorScheme="flatLight"
    icon={<IconAdd size="custom" color="currentColor" />}
    {...props}
  />
);

const wrap = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const colorScheme = 'default';

const RoutesListHeaderComponent = ({
  getLocalizedText,
  currentRoute,
  onToggleTreeViewMode,
  addButtonAction,
}) => {
  const title = getLocalizedText('structure.routeTreeEditorTitle');

  const changeViewButtonProps = {
    title: title,
    actionsSlot: addButtonAction && <AddButton onPress={addButtonAction} />,
  };

  return (
    <BlockContentViewButton
      colorScheme={colorScheme}
      {...changeViewButtonProps}
    />
  );
};

export const RoutesListHeader = wrap(RoutesListHeaderComponent);
