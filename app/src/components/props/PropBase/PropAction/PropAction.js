/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';
import { PropActionStyled } from './styles/PropActionStyled';

const propTypes = {
  icon: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  rounded: PropTypes.bool,
  onPress: PropTypes.func,
};

const defaultProps = {
  expanded: false,
  rounded: false,
  onPress: noop,
};

export const PropAction = ({ icon, onPress, expanded, rounded }) => (
  <PropActionStyled expanded={expanded}>
    <Button
      icon={{ name: icon }}
      radius={rounded ? 'rounded' : 'default'}
      onPress={onPress}
      size="small"
      colorScheme='flatLight'
    />
  </PropActionStyled>
);

PropAction.propTypes = propTypes;
PropAction.defaultProps = defaultProps;
PropAction.displayName = 'PropAction';
