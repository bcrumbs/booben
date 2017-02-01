/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';
import { PropBase } from '../PropBase/PropBase';
import { noop, returnArg } from '../../../utils/misc';

const propTypes = {
  haveComponent: PropTypes.bool,
  disabled: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onSetComponent: PropTypes.func,
};

const defaultProps = {
  haveComponent: false,
  disabled: false,
  getLocalizedText: returnArg,
  onSetComponent: noop,
};

export class PropComponent extends PropBase {
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {?ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    const { getLocalizedText } = this.props;
    
    //noinspection JSCheckFunctionSignatures
    const text = this.props.haveComponent
      ? getLocalizedText('editComponent')
      : getLocalizedText('setComponent');
    
    //noinspection JSValidateTypes
    return (
      <Button
        kind="link"
        text={text}
        disabled={this.props.disabled}
        onPress={this.props.onSetComponent}
      />
    );
  }
}

PropComponent.propTypes = { ...PropBase.propTypes, ...propTypes };
PropComponent.defaultProps = { ...PropBase.defaultProps, ...defaultProps };
PropComponent.displayName = 'PropComponent';
