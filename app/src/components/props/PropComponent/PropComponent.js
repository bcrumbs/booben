/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';
import PropTypes from 'prop-types';
import _pick from 'lodash.pick';
import { Button } from 'reactackle-button';
import { PropBase } from '../PropBase/PropBase';
import { noop, returnArg } from '../../../utils/misc';
import { ButtonRowStyled } from './styles/ButtonRowStyled';

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
        <ButtonRowStyled>
          <Button
            size="small"
            colorScheme="primary"
            text={text}
            disabled={disabled}
            onPress={onSetComponent}
            outlined
          />
        </ButtonRowStyled>
      }
    />
  );
};

PropComponent.propTypes = propTypes;
PropComponent.defaultProps = defaultProps;
PropComponent.displayName = 'PropComponent';
