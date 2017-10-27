import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';

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
  constructor(props, context) {
    super(props, context);
    
    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
  }
  
  _handleAddButtonPress() {
    const { pathToList, onAdd } = this.props;
    onAdd({ pathToList });
  }
  
  render() {
    const { addButtonText, children } = this.props;
    
    return (
      <div>
        {children}
    
        <div>
          <Button
            text={addButtonText}
            icon={{ name: 'plus' }}
            size="small"
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
