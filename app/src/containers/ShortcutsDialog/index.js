import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import camelCase from 'lodash.camelcase';
import transform from 'lodash.transform';
import {
  Dialog,
} from '@reactackle/reactackle';
import { getPlatformName } from 'react-shortcuts/lib/helpers';

import keymap from '../../keymap';
import { getLocalizedTextFromState } from '../../selectors';

const getLocalizedShortcuts = state => {
  const NAMESPACE = 'shortcuts';
  const currentPlatform = getPlatformName();
  const localize = getLocalizedTextFromState(state);

  return transform(keymap, (resG, shortcuts, groupName) => {
    const camelGroupName = camelCase(groupName);
    const localizedGroupName = localize(`${NAMESPACE}.${camelGroupName}`);
    const localizedShortcuts =
      transform(shortcuts, (resS, key, shortcutName) => {
        const localizedShortcutName =
          localize(`${NAMESPACE}.${camelGroupName}.${camelCase(shortcutName)}`);

        const platformKey = key[currentPlatform] || key;
        resS[localizedShortcutName] = platformKey;
      }, {});
    resG[localizedGroupName] = localizedShortcuts;
  }, {});
};

const propTypes = {
  ...Dialog.propTypes,
  ButtonComponent: PropTypes.func.isRequired,
  localizedShortcuts: PropTypes.object.isRequired,
};

const defaultProps = Dialog.defaultProps;


const wrap = connect(
  state => ({ localizedShortcuts: getLocalizedShortcuts(state) }),
);

export class ShortcutsDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };

    this._handleClose = this._handleClose.bind(this);
    this._handleOpen = this._handleOpen.bind(this);
  }

  _handleOpen() {
    this.setState({ isOpen: true });
  }

  _handleClose() {
    this.setState({ isOpen: false });
  }

  render() {
    const {
      ButtonComponent,
      localizedShortcuts,
    } = this.props;

    const shortcuts =
      Object.entries(localizedShortcuts).map(([groupName, shortcuts]) => {
        const keys = Object.entries(shortcuts).map(([shortcutName, key]) =>
          <div key={`${shortcutName}.${key}`}>{shortcutName}: {key}</div>,
        );
        return (
          <div key={groupName} style={{ color: 'white' }}>
            <h3>{groupName}</h3>
            {keys}
          </div>
        );
      });

    return (
      <div style={{ display: 'inherit' }}>
        <ButtonComponent onClick={this._handleOpen} />
        <Dialog
          open={this.state.isOpen}
          onClose={this._handleClose}
          haveCloseButton
        >
          {shortcuts}
        </Dialog>
      </div>
    );
  }
}

ShortcutsDialog.propTypes = propTypes;
ShortcutsDialog.defaultProps = defaultProps;
ShortcutsDialog.displayName = 'ShortcutsDialog';

export default wrap(ShortcutsDialog);
