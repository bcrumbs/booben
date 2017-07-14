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
  id: PropTypes.string.isRequired,
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

export const PropAction = ({ id, icon, onPress, expanded, rounded }) => (
  <PropActionStyled expanded={expanded} className={`prop_action-${id}`}>
    <Button
      icon={{ name: icon }}
      onPress={onPress}
      radius={rounded ? 'rounded' : 'default'}
    />
  </PropActionStyled>
);

PropAction.propTypes = propTypes;
PropAction.defaultProps = defaultProps;
PropAction.displayName = 'PropAction';
