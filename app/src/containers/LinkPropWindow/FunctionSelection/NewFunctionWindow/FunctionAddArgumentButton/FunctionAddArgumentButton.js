/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { returnArg, noop } from '../../../../../utils/misc';

const propTypes = {
  getLocalizedText: PropTypes.func,
  onPress: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onPress: noop,
};

export const FunctionAddArgumentButton = ({ getLocalizedText, onPress }) => (
  <div className="function-arguments_list-button">
    <Button
      icon={{ name: 'plus' }}
      text={getLocalizedText('linkDialog.function.new.newArg.button')}
      narrow
      onPress={onPress}
    />
  </div>
);

FunctionAddArgumentButton.propTypes = propTypes;
FunctionAddArgumentButton.defaultProps = defaultProps;
FunctionAddArgumentButton.displayName = 'FunctionAddArgumentButton';
