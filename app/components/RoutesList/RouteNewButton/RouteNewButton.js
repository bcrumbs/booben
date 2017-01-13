'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';
import ProjectRoute from '../../../models/ProjectRoute';
import { noop } from '../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  parentRoute: PropTypes.instanceOf(ProjectRoute),
  text: PropTypes.string,
  onPress: PropTypes.func,
};

const defaultProps = {
  parentRoute: null,
  text: '',
  onPress: noop,
};

export class RouteNewButton extends PureComponent {
  constructor(props) {
    super(props);
    this._handlePress = this._handlePress.bind(this);
  }
  
  _handlePress() {
    this.props.onPress({
      parentRoute: this.props.parentRoute,
    });
  }
  
  render() {
    return (
      <li className="route-new-button route-new-root-button">
        <Button
          text={this.props.text}
          kind="outline-primary"
          tabIndex="0"
          onPress={this._handlePress}
        />
      </li>
    );
  }
}

RouteNewButton.propTypes = propTypes;
RouteNewButton.defaultProps = defaultProps;
RouteNewButton.displayName = 'RouteNewButton';
