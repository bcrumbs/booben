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
  onEditActions: PropTypes.func,
};

const defaultProps = {
  ...PropBase.defaultProps,
  disabled: false,
  getLocalizedText: returnArg,
  onEditActions: noop,
};

export class PropAction extends PropBase {
  /**
   *
   * @return {?ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    const { disabled, getLocalizedText, onEditActions } = this.props;
    
    return (
      <Button
        colorScheme="link"
        text={getLocalizedText('valueEditor.action.editActions')}
        disabled={disabled}
        onPress={onEditActions}
      />
    );
  }
}

PropAction.propTypes = propTypes;
PropAction.defaultProps = defaultProps;
PropAction.displayName = 'PropAction';
