/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import _startCase from 'lodash.startcase';
import _forOwn from 'lodash.forown';

import {
  BlockContentBoxItem,
} from '../../../components/BlockContent/BlockContent';

import { PropsList } from '../../../components/PropsList/PropsList';
import { PropList } from '../../../components/props';
import { getLocalizedTextFromState } from '../../../utils';
import { getMutationType } from '../../../utils/schema';

const propTypes = {
  schema: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
};

const defaultProps = {};

const mapStateToProps = state => ({
  schema: state.project.schema,
  getLocalizedText: getLocalizedTextFromState(state),
});

class NewActionFormComponent extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      actionType: null,
      mutationName: null,
    };
    
    this._handleActionTypeChange = this._handleActionTypeChange.bind(this);
  }
  
  _handleActionTypeChange({ value }) {
    const [actionType, mutationName = null] = value.split('/');
    this.setState({ actionType, mutationName });
  }
  
  _getActionTypeOptions() {
    const { schema, getLocalizedText } = this.props;
    
    const ret = [
      {
        text: getLocalizedText('actionsEditor.actionType.method'),
        value: 'method',
      },
      {
        text: getLocalizedText('actionsEditor.actionType.prop'),
        value: 'prop',
      },
      {
        text: getLocalizedText('actionsEditor.actionType.navigate'),
        value: 'navigate',
      },
      {
        text: getLocalizedText('actionsEditor.actionType.url'),
        value: 'url',
      },
    ];
    
    const mutationType = getMutationType(schema);
    if (mutationType) {
      _forOwn(mutationType.fields, (_, mutationName) => {
        ret.push({
          text: _startCase(mutationName),
          value: `mutation/${mutationName}`,
        });
      });
    }
    
    return ret;
  }
  
  render() {
    const { getLocalizedText } = this.props;
    const { actionType, mutationName } = this.state;
    
    const actionTypeSelectLabel = getLocalizedText('actionsEditor.actionType');
    const actionTypeOptions = this._getActionTypeOptions();
    const actionTypeSelectValue = actionType === 'mutation'
      ? `mutation/${mutationName}`
      : actionType;
    
    return (
      <BlockContentBoxItem>
        <PropsList>
          <PropList
            label={actionTypeSelectLabel}
            options={actionTypeOptions}
            value={actionTypeSelectValue}
            onChange={this._handleActionTypeChange}
          />
        </PropsList>
      </BlockContentBoxItem>
    );
  }
}

NewActionFormComponent.propTypes = propTypes;
NewActionFormComponent.defaultProps = defaultProps;
NewActionFormComponent.displayName = 'NewActionForm';

export const NewActionForm = connect(mapStateToProps)(NewActionFormComponent);
