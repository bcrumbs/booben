import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import camelCase from 'lodash.camelcase';
import transform from 'lodash.transform';
import { getPlatformName } from 'react-shortcuts/lib/helpers';
import { Dialog, Theme } from '@reactackle/reactackle';
import keymap from '../../keymap';
import { getLocalizedTextFromState } from '../../selectors';

import {
  ShortcutsList,
  ShortcutsGroup,
  ShortcutItem,
} from '../../components/shortcuts';

import { noop } from '../../utils/misc';

const getLocalizedShortcuts = state => {
  const namespace = 'shortcuts';
  const currentPlatform = getPlatformName();
  const localize = getLocalizedTextFromState(state);

  return transform(keymap, (resGroup, shortcuts, groupName) => {
    const camelGroupName = camelCase(groupName);
    const localizedGroupName = localize(`${namespace}.${camelGroupName}`);
    const localizedShortcuts =
      transform(shortcuts, (resShortcuts, key, shortcutName) => {
        const localizedShortcutName =
          localize(`${namespace}.${camelGroupName}.${camelCase(shortcutName)}`);

        const platformKey = key[currentPlatform] || key;
        resShortcuts[localizedShortcutName] =
          platformKey.replace(/\+/g, ` +${String.fromCharCode(160)}`);
      }, {});

    resGroup[localizedGroupName] = localizedShortcuts;
  }, {});
};

const propTypes = {
  open: PropTypes.bool,
  localizedShortcuts: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

const defaultProps = {
  open: false,
  onClose: noop,
};

const mapStateToProps = state => ({
  localizedShortcuts: getLocalizedShortcuts(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

const reactackleThemeMixin = {
  components: {
    dialog: {
      window: {
        maxWidth: 1000,
      },
    },
  },
};

const _ShortcutsDialog = props => {
  const { open, localizedShortcuts, getLocalizedText, onClose } = props;

  const shortcuts =
    Object.entries(localizedShortcuts).map(([groupName, shortcuts]) => {
      const keys = Object.entries(shortcuts).map(([shortcutName, key]) =>
        <ShortcutItem
          key={`${shortcutName}.${key}`}
          shortcut={key}
          description={shortcutName}
        />,
      );

      return (
        <ShortcutsGroup key={groupName} title={groupName}>
          {keys}
        </ShortcutsGroup>
      );
    });

  return (
    <Theme mixin={reactackleThemeMixin}>
      <Dialog
        open={open}
        title={getLocalizedText('shortcuts.dialogTitle')}
        haveCloseButton
        closeOnEscape
        onClose={onClose}
      >
        <ShortcutsList>
          {shortcuts}
        </ShortcutsList>
      </Dialog>
    </Theme>
  );
};

_ShortcutsDialog.propTypes = propTypes;
_ShortcutsDialog.defaultProps = defaultProps;
_ShortcutsDialog.displayName = 'ShortcutsDialog';

export const ShortcutsDialog = wrap(_ShortcutsDialog);
