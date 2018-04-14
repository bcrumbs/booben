import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  ToolBar,
  ToolBarGroup,
  ToolBarAction,
} from '../../../components/ToolBar/ToolBar';

import {
  IconCopy,
  IconDuplicate,
  IconCut,
  IconPaste,
  IconTrash,
  IconUndo,
  IconRedo,
  IconList,
} from '../../../components/icons';

import {
  componentClipboardSelector,
  canCopyComponentSelector,
  canMoveComponentSelector,
  canDeleteComponentSelector,
  canRedoSelector,
  canUndoSelector,
  getLocalizedTextFromState,
} from '../../../selectors';

import Clipboard from '../../../models/Clipboard';
import { INVALID_ID } from '../../../constants/misc';
import { noop } from '../../../utils/misc';

const propTypes = {
  componentClipboard: PropTypes.instanceOf(Clipboard).isRequired, // state
  showInvisibleComponents: PropTypes.bool.isRequired, // state
  showContentPlaceholders: PropTypes.bool.isRequired, // state
  canCopy: PropTypes.bool.isRequired, // state
  canMove: PropTypes.bool.isRequired, // state
  canDelete: PropTypes.bool.isRequired, // state
  canUndo: PropTypes.bool.isRequired, // state
  canRedo: PropTypes.bool.isRequired, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onDuplicate: PropTypes.func,
  onCopy: PropTypes.func,
  onCut: PropTypes.func,
  onPaste: PropTypes.func,
  onDelete: PropTypes.func,
  onUndo: PropTypes.func,
  onRedo: PropTypes.func,
  onConvertToList: PropTypes.func,
  onToggleInvisible: PropTypes.func,
  onTogglePlaceholders: PropTypes.func,
};

const defaultProps = {
  onDuplicate: noop,
  onCopy: noop,
  onCut: noop,
  onPaste: noop,
  onDelete: noop,
  onUndo: noop,
  onRedo: noop,
  onConvertToList: noop,
  onToggleInvisible: noop,
  onTogglePlaceholders: noop,
};

const mapStateToProps = state => ({
  componentClipboard: componentClipboardSelector(state),
  showInvisibleComponents: state.app.showInvisibleComponents,
  showContentPlaceholders: state.app.showContentPlaceholders,
  canCopy: canCopyComponentSelector(state),
  canMove: canMoveComponentSelector(state),
  canDelete: canDeleteComponentSelector(state),
  canUndo: canUndoSelector(state),
  canRedo: canRedoSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

const volatileProps = [
  'componentClipboard',
  'showInvisibleComponents',
  'showContentPlaceholders',
  'canCopy',
  'canMove',
  'canDelete',
  'canUndo',
  'canRedo',
  'getLocalizedText',
];

class _DesignToolbar extends Component {
  shouldComponentUpdate(nextProps) {
    return volatileProps.some(key => nextProps[key] !== this.props[key]);
  }

  render() {
    const {
      componentClipboard,
      showInvisibleComponents,
      showContentPlaceholders,
      canCopy,
      canMove,
      canDelete,
      canUndo,
      canRedo,
      getLocalizedText,
      onDuplicate,
      onCopy,
      onCut,
      onPaste,
      onDelete,
      onUndo,
      onRedo,
      onConvertToList,
      onToggleInvisible,
      onTogglePlaceholders,
    } = this.props;

    return (
      <ToolBar>
        <ToolBarGroup>
          <ToolBarAction
            icon={<IconDuplicate />}
            tooltipText={getLocalizedText('toolbar.design.duplicate')}
            disabled={!canCopy}
            onPress={onDuplicate}
          />

          <ToolBarAction
            icon={<IconCopy />}
            tooltipText={getLocalizedText('toolbar.design.copy')}
            disabled={!canCopy}
            onPress={onCopy}
          />

          <ToolBarAction
            icon={<IconCut />}
            tooltipText={getLocalizedText('toolbar.design.cut')}
            disabled={!canMove}
            onPress={onCut}
          />

          <ToolBarAction
            icon={<IconPaste />}
            tooltipText={getLocalizedText('toolbar.design.paste')}
            disabled={componentClipboard.componentId === INVALID_ID}
            onPress={onPaste}
          />

          <ToolBarAction
            icon={<IconTrash />}
            tooltipText={getLocalizedText('toolbar.design.delete')}
            disabled={!canDelete}
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

        <ToolBarGroup>
          <ToolBarAction
            icon={<IconList />}
            tooltipText={getLocalizedText('toolbar.design.convertToList')}
            disabled={!canCopy} // Same condition as for copying
            onPress={onConvertToList}
          />
        </ToolBarGroup>

        <ToolBarGroup>
          <ToolBarAction
            text={getLocalizedText(showContentPlaceholders
              ? 'toolbar.design.hideEmpty'
              : 'toolbar.design.showEmpty')}

            onPress={onTogglePlaceholders}
          />

          <ToolBarAction
            text={getLocalizedText(showInvisibleComponents
              ? 'toolbar.design.hideHidden'
              : 'toolbar.design.showHidden')}

            onPress={onToggleInvisible}
          />
        </ToolBarGroup>
      </ToolBar>
    );
  }
}

_DesignToolbar.propTypes = propTypes;
_DesignToolbar.defaultProps = defaultProps;
_DesignToolbar.displayName = 'DesignToolbar';

export const DesignToolbar = wrap(_DesignToolbar);
