/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Map } from 'immutable';
import { PropsList } from '../../../../components/PropsList/PropsList';
import { JssyValueEditor } from '../../../JssyValueEditor/JssyValueEditor';
import { getJssyTypeOfField } from '../../../../utils/schema';
import { noop, returnArg, objectToArray } from '../../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  field: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  fieldArgs: PropTypes.object,
  getLocalizedText: PropTypes.func,
  onArgsUpdate: PropTypes.func,
  onLink: PropTypes.func,
};

const defaultProps = {
  fieldArgs: null,
  getLocalizedText: returnArg,
  onArgsUpdate: noop,
  onLink: noop,
};

export class DataSelectionArgsEditor extends PureComponent {
  constructor(props) {
    super(props);

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

    if (value)
      newArgs = newArgs.set(name, value);
    else
      newArgs = newArgs.delete(name);

    onArgsUpdate({ args: newArgs });
  }
  
  render() {
    const { field, schema, fieldArgs, getLocalizedText, onLink } = this.props;
  
    const items = objectToArray(field.args, (arg, argName) => {
      const jssyValueDef = getJssyTypeOfField(arg, schema);
      const jssyValue = fieldArgs ? fieldArgs.get(argName) || null : null;

      return (
        <JssyValueEditor
          key={argName}
          name={argName}
          value={jssyValue}
          valueDef={jssyValueDef}
          optional={!arg.nonNull}
          getLocalizedText={getLocalizedText}
          onChange={this._handleUpdateValue}
          onLink={onLink}
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
