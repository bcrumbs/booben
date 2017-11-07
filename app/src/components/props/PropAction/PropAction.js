/**
 * @author Dmitriy Bizyaev
 */

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
  onEditActions: PropTypes.func,
};

const defaultProps = {
  ...PropBase.defaultProps,
  disabled: false,
  getLocalizedText: returnArg,
  onEditActions: noop,
};

const baseProps = Object.keys(PropBase.propTypes);

export const PropAction = props => {
  const { disabled, getLocalizedText, onEditActions } = props;

  const propsForBase = _pick(props, baseProps);

  return (
    <PropBase
      {...propsForBase}
      content={
        <Button
          size="small"
          colorScheme="link"
          text={getLocalizedText('valueEditor.action.editActions')}
          disabled={disabled}
          onPress={onEditActions}
        />
      }
    />
  );
};

PropAction.propTypes = propTypes;
PropAction.defaultProps = defaultProps;
PropAction.displayName = 'PropAction';
