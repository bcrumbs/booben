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

const baseProps = Object.keys(PropBase.propTypes);

export const PropComponent = props => {
  const {
    haveComponent,
    disabled,
    getLocalizedText,
    onSetComponent,
  } = props;

  const propsForBase = _pick(props, baseProps);

  const text = haveComponent
    ? getLocalizedText('valueEditor.component.editComponent')
    : getLocalizedText('valueEditor.component.setComponent');

  return (
    <PropBase
      {...propsForBase}
      content={
        <Button
          size="small"
          colorScheme="link"
          text={text}
          disabled={disabled}
          onPress={onSetComponent}
        />
      }
    />
  );
};

PropComponent.propTypes = propTypes;
PropComponent.defaultProps = defaultProps;
PropComponent.displayName = 'PropComponent';
