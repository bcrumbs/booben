import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactackle-button';
import ProjectRoute from '../../../models/ProjectRoute';
import { noop } from '../../../utils/misc';
import { RouteNewButtonStyled } from './styles/RouteNewButtonStyled';

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
  constructor(props, context) {
    super(props, context);
    this._handlePress = this._handlePress.bind(this);
  }
  
  _handlePress() {
    const { parentRoute, onPress } = this.props;
    onPress({ parentRoute });
  }
  
  render() {
    const { text } = this.props;
    
    return (
      <RouteNewButtonStyled>
        <Button
          text={text}
          colorScheme="primary"
          outlined
          onPress={this._handlePress}
        />
      </RouteNewButtonStyled>
    );
  }
}

RouteNewButton.propTypes = propTypes;
RouteNewButton.defaultProps = defaultProps;
RouteNewButton.displayName = 'RouteNewButton';
