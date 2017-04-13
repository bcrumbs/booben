'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';
import './ComponentActions.scss';

const propTypes = {
  pathToList: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])),
  addButtonText: PropTypes.string,
  onAdd: PropTypes.func,
};

const defaultProps = {
  pathToList: [],
  addButtonText: '',
  onAdd: noop,
};

export class ComponentActions extends PureComponent {
  constructor(props) {
    super(props);
    
    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
  }
  
  _handleAddButtonPress() {
    const { pathToList, onAdd } = this.props;
    onAdd({ pathToList });
  }
  
  render() {
    const { addButtonText, children } = this.props;
    
    return (
      <div className="component-actions">
        {children}
    
        <div className="component-actions_button">
          <Button
            text={addButtonText}
            icon="plus"
            narrow
            onPress={this._handleAddButtonPress}
          />
        </div>
      </div>
    );
  }
}

ComponentActions.propTypes = propTypes;
ComponentActions.defaultProps = defaultProps;
ComponentActions.displayName = 'ComponentActions';

export * from './ComponentAction/ComponentAction';
