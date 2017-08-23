/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { PropsList } from '../../../../components/PropsList/PropsList';
import { JssyValueEditor } from '../../../JssyValueEditor/JssyValueEditor';
import { jssyValueToImmutable } from '../../../../models/ProjectComponent';
import { buildDefaultValue } from '../../../../lib/meta';
import { getJssyValueDefOfQueryArgument } from '../../../../lib/schema';
import { noop, returnArg, objectToArray } from '../../../../utils/misc';

const propTypes = {
  field: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  fieldArgs: PropTypes.object,
  getLocalizedText: PropTypes.func,
  onArgsUpdate: PropTypes.func,
};

const defaultProps = {
  fieldArgs: null,
  getLocalizedText: returnArg,
  onArgsUpdate: noop,
};

export class DataSelectionArgsEditor extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      linking: false,
      linkingName: '',
      linkingPath: null,
    };

    this._handleUpdateValue = this._handleUpdateValue.bind(this);
  }
  
  /**
   *
   * @param {string} name
   * @param {*} value
   * @private
   */
  _handleUpdateValue({ name, value }) {
    const { fieldArgs, onArgsUpdate } = this.props;
    
    let newArgs = fieldArgs || Map();
  
    newArgs = value
      ? newArgs.set(name, value)
      : newArgs.delete(name);

    onArgsUpdate({ args: newArgs });
  }
  
  render() {
    const { field, schema, fieldArgs, getLocalizedText } = this.props;
  
    const items = objectToArray(field.args, (arg, argName) => {
      const valueDef = getJssyValueDefOfQueryArgument(arg, schema);
      
      let value = fieldArgs ? fieldArgs.get(argName) || null : null;
      if (arg.nonNull && !value) {
        value = jssyValueToImmutable(buildDefaultValue(valueDef));
      }

      return (
        <JssyValueEditor
          key={argName}
          name={argName}
          value={value}
          valueDef={valueDef}
          optional={!arg.nonNull}
          onlyStatic
          getLocalizedText={getLocalizedText}
          onChange={this._handleUpdateValue}
        />
      );
    });
  
    return (
      <PropsList>
        {items}
      </PropsList>
    );
  }
}

DataSelectionArgsEditor.propTypes = propTypes;
DataSelectionArgsEditor.defaultProps = defaultProps;
DataSelectionArgsEditor.displayName = 'DataSelectionArgsEditor';
