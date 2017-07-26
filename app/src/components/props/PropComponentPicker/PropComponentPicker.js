/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import _pick from 'lodash.pick';
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

const baseProps = Object.keys(PropBase.propTypes);

export const PropComponentPicker = props => {
  const { disabled, getLocalizedText, onPickComponent } = props;

  const propsForBase = _pick(props, baseProps);

  return (
    <PropBase
      {...propsForBase}
      content={
        <Button
          colorScheme="link"
          text={getLocalizedText('valueEditor.componentPicker.pickComponent')}
          disabled={disabled}
          onPress={onPickComponent}
        />
      }
    />
  );
};

PropComponentPicker.propTypes = propTypes;
PropComponentPicker.defaultProps = defaultProps;
PropComponentPicker.displayName = 'PropComponentPicker';
