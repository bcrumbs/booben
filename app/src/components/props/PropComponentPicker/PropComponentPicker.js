/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { PropBase } from '../PropBase/PropBase';
import { noop, returnArg } from '../../../utils/misc';

const propTypes = {
  ...PropBase.propTypes,
  disabled: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onPickComponent: PropTypes.func,
};

const defaultProps = {
  ...PropBase.defaultProps,
  disabled: false,
  getLocalizedText: returnArg,
  onPickComponent: noop,
};

export class PropComponentPicker extends PropBase {
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {?ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    const { disabled, getLocalizedText, onPickComponent } = this.props;
    
    //noinspection JSValidateTypes
    return (
      <Button
        colorScheme="link"
        text={getLocalizedText('valueEditor.componentPicker.pickComponent')}
        disabled={disabled}
        onPress={onPickComponent}
      />
    );
  }
}

PropComponentPicker.propTypes = propTypes;
PropComponentPicker.defaultProps = defaultProps;
PropComponentPicker.displayName = 'PropComponentPicker';
