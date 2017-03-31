'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';
import './ComponentActions.scss';

const propTypes = {
  actionPath: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number.isRequired,
    branch: PropTypes.string,
  })),
  branch: PropTypes.string,
  addButtonText: PropTypes.string,
  onAdd: PropTypes.func,
};

const defaultProps = {
  actionPath: [],
  branch: '',
  addButtonText: '',
  onAdd: noop,
};

export class ComponentActions extends PureComponent {
  constructor(props) {
    super(props);
    
    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
  }
  
  _handleAddButtonPress() {
    const { actionPath, branch, onAdd } = this.props;
    onAdd({ actionPath, branch });
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
