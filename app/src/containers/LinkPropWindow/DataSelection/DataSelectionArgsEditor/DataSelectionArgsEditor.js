import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { getJssyValueDefOfQueryArgument } from 'booben-graphql-schema';
import { PropsList } from '../../../../components/PropsList/PropsList';
import { JssyValueEditor } from '../../../JssyValueEditor/JssyValueEditor';
import { jssyValueToImmutable } from '../../../../models/ProjectComponent';
import { buildDefaultValue } from '../../../../lib/meta';
import { noop, returnArg, objectToArray } from '../../../../utils/misc';

const propTypes = {
  field: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  fieldArgs: PropTypes.object,
  getLocalizedText: PropTypes.func,
  onArgsUpdate: PropTypes.func,
  onNestedLink: PropTypes.func,
};

const defaultProps = {
  fieldArgs: null,
  getLocalizedText: returnArg,
  onArgsUpdate: noop,
  onNestedLink: noop,
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
    this._handleLink = this._handleLink.bind(this);
    this._handleLinkDone = this._handleLinkDone.bind(this);
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

  _handleLink({ name, path, targetValueDef, targetUserTypedefs }) {
    const { field, onNestedLink } = this.props;

    const nestedLinkWindowName = `${field.name}(${[name, ...path].join('.')})`;

    this.setState({
      linking: true,
      linkingName: name,
      linkingPath: path,
    });

    onNestedLink({
      name: nestedLinkWindowName,
      valueDef: targetValueDef,
      userTypedefs: targetUserTypedefs,
      onLink: this._handleLinkDone,
    });
  }

  _handleLinkDone({ newValue }) {
    const { fieldArgs, onArgsUpdate } = this.props;
    const { linking, linkingName, linkingPath } = this.state;

    if (!linking) return;

    let newArgs = fieldArgs || Map();

    if (linkingPath.length > 0) {
      newArgs = newArgs.update(
        linkingName,
        oldValue => oldValue.setInStatic(linkingPath, newValue),
      );
    } else {
      newArgs = newArgs.set(linkingName, newValue);
    }

    this.setState({
      linking: false,
      linkingName: '',
      linkingPath: null,
    });

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
          getLocalizedText={getLocalizedText}
          onChange={this._handleUpdateValue}
          onLink={this._handleLink}
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
