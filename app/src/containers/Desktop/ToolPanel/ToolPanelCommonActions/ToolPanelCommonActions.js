/**
 * @author Nickolay Maltsev
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  getLocalizedTextFromState,
} from '../../../../selectors';

import {
  PageDrawerActionsGroup,
  PageDrawerActionItem,
} from '../../../../components/PageDrawer';

import { ShortcutsDialog } from '../../../ShortcutsDialog/ShortcutsDialog';
import { toggleFullscreen } from '../../../../routes/AppRoute';

const propTypes = {
  getLocalizedText: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

const _ToolPanelCommonActions = ({ getLocalizedText }) => (
  <PageDrawerActionsGroup
    key="commonActions"
    style={{
      display: 'flex',
      flexDirection: 'column-reverse',
    }}
  >
    <ShortcutsDialog
      ButtonComponent={props =>
        <PageDrawerActionItem
          // eslint-disable-next-line react/prop-types
          onPress={props.onClick}
          icon="question"
          title={getLocalizedText('appHeader.menu.shortcuts')}
        />
      }
    />
    <PageDrawerActionItem
      icon="arrows-alt"
      title={getLocalizedText('appFooter.toggleFullScreen')}
      onPress={toggleFullscreen}
    />
    <PageDrawerActionItem
      icon="question"
      title={getLocalizedText('appFooter.help')}
    />
  </PageDrawerActionsGroup>
);

_ToolPanelCommonActions.propTypes = propTypes;

export const ToolPanelCommonActions = wrap(_ToolPanelCommonActions);
