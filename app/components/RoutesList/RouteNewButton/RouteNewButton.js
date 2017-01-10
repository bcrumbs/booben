'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';

const propTypes = {
  text: PropTypes.string,
  onPress: PropTypes.func,
};

const defaultProps = {
  text: '',
  onPress: noop,
};

export const RouteNewButton = props => (
  <li className="route-new-button route-new-root-button">
    <Button
      text={props.text}
      kind="outline-primary"
      tabIndex="0"
      onPress={props.onPress}
    />
  </li>
);

RouteNewButton.propTypes = propTypes;
RouteNewButton.defaultProps = defaultProps;
RouteNewButton.displayName = 'RouteNewButton';
