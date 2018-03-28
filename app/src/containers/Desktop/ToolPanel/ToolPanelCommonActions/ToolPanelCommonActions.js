/**
 * @author Nikolay Maltsev
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getLocalizedTextFromState } from '../../../../selectors';

import {
  PageDrawerActionsGroup,
  PageDrawerActionItem,
} from '../../../../components/PageDrawer';

import { ShortcutsDialog } from '../../../ShortcutsDialog/ShortcutsDialog';
import { IconExpand, IconShortcut } from '../../../../components/icons';
import { toggleFullscreen } from '../../../../utils/browser';

const propTypes = {
  getLocalizedText: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

class _ToolPanelCommonActions extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isShortcutsDialogOpen: false,
    };

    this._handleOpenShortcutsDialog =
      this._handleOpenShortcutsDialog.bind(this);
    this._handleCloseShortcutsDialog =
      this._handleCloseShortcutsDialog.bind(this);
  }

  _handleOpenShortcutsDialog() {
    this.setState({
      isShortcutsDialogOpen: true,
    });
  }

  _handleCloseShortcutsDialog() {
    this.setState({
      isShortcutsDialogOpen: false,
    });
  }

  render() {
    const { getLocalizedText } = this.props;
    const { isShortcutsDialogOpen } = this.state;

    return (
      <PageDrawerActionsGroup
        key="commonActions"
        style={{
          display: 'flex',
          flexDirection: 'column-reverse',
        }}
      >
        <PageDrawerActionItem
          icon={<IconShortcut />}
          title={getLocalizedText('appHeader.menu.shortcuts')}
          onPress={this._handleOpenShortcutsDialog}
        />

        <PageDrawerActionItem
          icon={<IconExpand />}
          title={getLocalizedText('appFooter.toggleFullScreen')}
          onPress={toggleFullscreen}
        />

        <ShortcutsDialog
          open={isShortcutsDialogOpen}
          onClose={this._handleCloseShortcutsDialog}
        />
      </PageDrawerActionsGroup>
    );
  }
}

_ToolPanelCommonActions.propTypes = propTypes;
_ToolPanelCommonActions.displayName = 'ToolPanelCommonActions';

export const ToolPanelCommonActions = wrap(_ToolPanelCommonActions);
