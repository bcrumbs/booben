import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  ToolBar,
  ToolBarGroup,
  ToolBarAction,
} from '../../../components/ToolBar/ToolBar';

import { IconUndo, IconRedo, IconTrash } from '../../../components/icons';

import {
  canRedoSelector,
  canUndoSelector,
  getLocalizedTextFromState,
} from '../../../selectors';

import { noop } from '../../../utils/misc';
import { INVALID_ID } from '../../../constants/misc';

const propTypes = {
  selectedRouteId: PropTypes.number.isRequired, // store
  indexRouteSelected: PropTypes.bool.isRequired, // store
  canUndo: PropTypes.bool.isRequired, // store
  canRedo: PropTypes.bool.isRequired, // store
  getLocalizedText: PropTypes.func.isRequired, // store
  onDelete: PropTypes.func,
  onUndo: PropTypes.func,
  onRedo: PropTypes.func,
};

const defaultProps = {
  onDelete: noop,
  onUndo: noop,
  onRedo: noop,
};

const mapStateToProps = state => ({
  selectedRouteId: state.project.selectedRouteId,
  indexRouteSelected: state.project.indexRouteSelected,
  canUndo: canUndoSelector(state),
  canRedo: canRedoSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

const volatileProps = [
  'selectedRouteId',
  'indexRouteSelected',
  'canUndo',
  'canRedo',
  'getLocalizedText',
];

class _StructureToolbar extends Component {
  shouldComponentUpdate(nextProps) {
    return volatileProps.some(key => nextProps[key] !== this.props[key]);
  }

  render() {
    const {
      canUndo,
      canRedo,
      selectedRouteId,
      indexRouteSelected,
      getLocalizedText,
      onDelete,
      onUndo,
      onRedo,
    } = this.props;

    const isDeletable = selectedRouteId !== INVALID_ID && !indexRouteSelected;

    return (
      <ToolBar>
        <ToolBarGroup>
          <ToolBarAction
            icon={<IconTrash />}
            tooltipText={getLocalizedText('toolbar.structure.delete')}
            disabled={!isDeletable}
            onPress={onDelete}
          />
        </ToolBarGroup>

        <ToolBarGroup>
          <ToolBarAction
            icon={<IconUndo />}
            tooltipText={getLocalizedText('toolbar.common.undo')}
            disabled={!canUndo}
            onPress={onUndo}
          />

          <ToolBarAction
            icon={<IconRedo />}
            tooltipText={getLocalizedText('toolbar.common.redo')}
            disabled={!canRedo}
            onPress={onRedo}
          />
        </ToolBarGroup>
      </ToolBar>
    );
  }
}

_StructureToolbar.propTypes = propTypes;
_StructureToolbar.defaultProps = defaultProps;
_StructureToolbar.displayName = 'StructureToolbar';

export const StructureToolbar = wrap(_StructureToolbar);
