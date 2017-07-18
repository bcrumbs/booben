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
  haveComponent: PropTypes.bool,
  disabled: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onSetComponent: PropTypes.func,
};

const defaultProps = {
  ...PropBase.defaultProps,
  haveComponent: false,
  disabled: false,
  getLocalizedText: returnArg,
  onSetComponent: noop,
};

export class PropComponent extends PropBase {
  /**
   *
   * @return {?ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    const {
      haveComponent,
      disabled,
      getLocalizedText,
      onSetComponent,
    } = this.props;

    const text = haveComponent
      ? getLocalizedText('valueEditor.component.editComponent')
      : getLocalizedText('valueEditor.component.setComponent');

    return (
      <Button
        colorScheme="link"
        text={text}
        disabled={disabled}
        onPress={onSetComponent}
      />
    );
  }
}

PropComponent.propTypes = propTypes;
PropComponent.defaultProps = defaultProps;
PropComponent.displayName = 'PropComponent';
