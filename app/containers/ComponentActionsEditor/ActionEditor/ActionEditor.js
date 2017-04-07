/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import _startCase from 'lodash.startcase';
import _forOwn from 'lodash.forown';
import _mapValues from 'lodash.mapvalues';
import { Map } from 'immutable';
import { Button, Dialog } from '@reactackle/reactackle';

import {
  BlockContentBoxItem,
} from '../../../components/BlockContent/BlockContent';

import { LinkPropWindow } from '../../LinkPropWindow/LinkPropWindow';

import {
  PropsList,
  Prop,
  jssyValueToPropValue,
  jssyTypedefToPropType,
} from '../../../components/PropsList/PropsList';

import { PropInput, PropList } from '../../../components/props';
import ProjectRoute from '../../../models/ProjectRoute';
import { sourceDataToImmutable } from '../../../models/ProjectComponent';
import JssyValue from '../../../models/JssyValue';
import { Action, createActionParams } from '../../../models/SourceDataActions';
import { ROUTE_PARAM_VALUE_DEF } from '../../../constants/misc';
import { getLocalizedTextFromState } from '../../../utils';

import {
  getMutationType,
  getMutationField,
  getJssyTypeOfField,
} from '../../../utils/schema';

import { buildDefaultValue } from '../../../utils/meta';

import {
  noop,
  returnArg,
  arrayToObject,
  objectToArray,
} from '../../../utils/misc';

const propTypes = {
  action: PropTypes.instanceOf(Action),
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  schema: PropTypes.object.isRequired,
  routes: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectRoute),
    PropTypes.number,
  ).isRequired,
  getLocalizedText: PropTypes.func.isRequired,
};

const defaultProps = {
  action: null,
  onSave: noop,
  onCancel: noop,
};

const mapStateToProps = state => ({
  schema: state.project.schema,
  routes: state.project.data.routes,
  getLocalizedText: getLocalizedTextFromState(state),
});

/**
 *
 * @param {DataFieldArg} arg
 * @param {DataSchema} schema
 * @return {JssyValueDefinition}
 */
const getMutationArgValueDef = (arg, schema) => ({
  ...getJssyTypeOfField(arg, schema),
  source: ['static', 'state'],
  sourceConfigs: {
    static: {
      default: arg.defaultValue,
    },
    state: {},
  },
});

class ActionEditorComponent extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      action: props.action || new Action(),
      linkingValue: false,
      linkingValueDef: null,
      linkingUserTypedefs: null,
    };
    
    this._handleActionTypeChange = this._handleActionTypeChange.bind(this);
    this._handleURLActionURLChange = this._handleURLActionURLChange.bind(this);
    this._handleURLActionNewWindowChange =
      this._handleURLActionNewWindowChange.bind(this);
    this._handleNavigateActionRouteChange =
      this._handleNavigateActionRouteChange.bind(this);
    this._handleNavigateActionRouteParamChange =
      this._handleNavigateActionRouteParamChange.bind(this);
    this._handleSave = this._handleSave.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handleLinkApply = this._handleLinkApply.bind(this);
    this._handleLinkCancel = this._handleLinkCancel.bind(this);
  }
  
  _handleActionTypeChange({ value }) {
    const { schema } = this.props;
    const { action } = this.state;
    
    const [actionType, mutationName = null] = value.split('/');
    const willUpdateAction =
      actionType !== action.type || (
        actionType === 'mutation' &&
        mutationName !== action.params.mutation
      );
    
    if (willUpdateAction) {
      let params = createActionParams(actionType);
      if (actionType === 'mutation') {
        const mutationField = getMutationField(schema, mutationName);
        
        params = params.merge({
          mutation: mutationName,
          args: Map(_mapValues(mutationField.args, arg => {
            const valueDef = getMutationArgValueDef(arg, schema);
            const { source, sourceData } = buildDefaultValue(valueDef);
            
            return new JssyValue({
              source,
              sourceData: sourceDataToImmutable(source, sourceData),
            });
          })),
        });
      }
      
      this.setState({
        action: action.merge({
          type: actionType,
          params,
        }),
      });
    }
  }
  
  _handleURLActionURLChange({ value }) {
    const { action } = this.state;
    
    this.setState({
      action: action.setIn(['params', 'url'], value),
    });
  }
  
  _handleURLActionNewWindowChange({ value }) {
    const { action } = this.state;
    
    this.setState({
      action: action.setIn(['params', 'newWindow'], value),
    });
  }
  
  _handleNavigateActionRouteChange({ value }) {
    const { routes } = this.props;
    const { action } = this.state;
    
    const route = routes.get(value);
    const paramNames = route.path
      .split('/')
      .filter(part => part.startsWith(':'))
      .map(part => part.slice(1));
    
    this.setState({
      action: action.update('params', params => params.merge({
        routeId: value,
        routeParams: Map(arrayToObject(
          paramNames,
          returnArg,
          () => JssyValue.staticFromJS(''),
        )),
      })),
    });
  }
  
  _handleNavigateActionRouteParamChange({ propName: paramName, value }) {
    
  }
  
  _handleSave() {
    const { onSave } = this.props;
    const { action } = this.state;
    
    onSave({ action });
  }
  
  _handleLink({ path }) {
  
  }
  
  _handleLinkApply({ newValue, queryArgs }) {
  
  }
  
  _handleLinkCancel() {
    this.setState({
      linkingValue: false,
      linkingValueDef: null,
      linkingUserTypedefs: null,
    });
  }
  
  _isCurrentActionValid() {
    const { action } = this.state;
  
    if (!action.type) return false;
  
    if (action.type === 'mutation') {
      if (!action.params.mutation) return false;
    } else if (action.type === 'method') {
      if (action.params.componentId === -1 || !action.params.method)
        return false;
    } else if (action.type === 'prop') {
      const paramsAreInvalid =
        action.params.componentId === -1 || (
          !action.params.propName &&
          !action.params.systemPropName
        );
      
      if (paramsAreInvalid) return false;
    } else if (action.type === 'navigate') {
      if (action.params.routeId === -1) return false;
    } else if (action.type === 'url') {
      if (!action.params.url) return false;
    }
  
    return true;
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
  
  _renderMutationActionProps() {
    const { schema } = this.props;
    const { action } = this.state;
    
    const mutationField = getMutationField(schema, action.params.mutation);
    
    return objectToArray(mutationField.args, (arg, argName) => {
      const jssyTypedef = getJssyTypeOfField(arg, schema);
      const propType = {
        ...jssyTypedefToPropType(jssyTypedef),
        label: argName,
        tooltip: arg.description,
        linkable: true,
      };
      
      const value = jssyValueToPropValue(
        action.params.args.get(argName),
        jssyTypedef,
      );
      
      const key = `mutationArg_${argName}`;
      
      return (
        <Prop
          key={key}
          propName={argName}
          propType={propType}
          value={value}
        />
      );
    });
  }
  
  _renderMethodActionProps() {
    return [];
  }
  
  _renderPropActionProps() {
    return [];
  }
  
  _renderURLActionProps() {
    const { getLocalizedText } = this.props;
    const { action } = this.state;
    
    const windowOptions = [
      {
        text: getLocalizedText('actionsEditor.actionForm.urlWindow.new'),
        value: true,
      },
      {
        text: getLocalizedText('actionsEditor.actionForm.urlWindow.same'),
        value: false,
      },
    ];
    
    return [
      <PropInput
        key="url"
        label={getLocalizedText('actionsEditor.actionForm.url')}
        value={action.params.url}
        onChange={this._handleURLActionURLChange}
      />,
      <PropList
        key="urlWindow"
        label={getLocalizedText('actionsEditor.actionForm.urlWindow')}
        options={windowOptions}
        value={action.params.newWindow}
        onChange={this._handleURLActionNewWindowChange}
      />,
    ];
  }
  
  _renderNavigateActionProps() {
    const { routes, getLocalizedText } = this.props;
    const { action } = this.state;
    
    const options = [];
    routes.forEach((route, routeId) =>
      void options.push({ text: route.title, value: routeId }));
    
    const value = action.params.routeId === -1 ? null : action.params.routeId;
    
    const routeProp = (
      <PropList
        key="route"
        label={getLocalizedText('actionsEditor.actionForm.route')}
        options={options}
        value={value}
        onChange={this._handleNavigateActionRouteChange}
      />
    );
    
    const props = [routeProp];
    
    if (action.params.routeId !== -1) {
      const route = routes.get(action.params.routeId);
      const pathParts = route.path.split('/');
  
      pathParts.forEach(pathPart => {
        const isParam = pathPart.startsWith(':');
        if (isParam) {
          const name = pathPart.slice(1);
          const key = `routeParam_${name}`;
          const propType = {
            ...jssyTypedefToPropType(ROUTE_PARAM_VALUE_DEF),
            label: name,
            linkable: true,
          };
          
          const value = jssyValueToPropValue(
            action.params.routeParams.get(name),
            ROUTE_PARAM_VALUE_DEF,
          );
          
          props.push(
            <Prop
              key={key}
              propName={name}
              propType={propType}
              value={value}
              onChange={this._handleNavigateActionRouteParamChange}
            />,
          );
        }
      });
    }
    
    return props;
  }
  
  _renderAdditionalProps() {
    const { action } = this.state;
    
    switch (action.type) {
      case 'mutation': return this._renderMutationActionProps();
      case 'method': return this._renderMethodActionProps();
      case 'prop': return this._renderPropActionProps();
      case 'navigate': return this._renderNavigateActionProps();
      case 'url': return this._renderURLActionProps();
      default: return [];
    }
  }
  
  render() {
    const { onCancel, getLocalizedText } = this.props;
    const {
      action,
      linkingValue,
      linkingValueDef,
      linkingUserTypedefs,
    } = this.state;
    
    const actionTypeLabel = getLocalizedText('actionsEditor.actionType');
    const actionTypeOptions = this._getActionTypeOptions();
    const actionTypeValue = action.type === 'mutation'
      ? `mutation/${action.params.mutation}`
      : action.type || null;
    
    const additionalProps = this._renderAdditionalProps();
    
    const props = [
      <PropList
        key="type"
        label={actionTypeLabel}
        options={actionTypeOptions}
        value={actionTypeValue}
        onChange={this._handleActionTypeChange}
      />,
      
      ...additionalProps,
    ];
    
    const isSaveButtonDisabled = !this._isCurrentActionValid();
    
    return (
      <BlockContentBoxItem>
        <PropsList>
          {props}
        </PropsList>
        
        <Button
          text="Save"
          disabled={isSaveButtonDisabled}
          onPress={this._handleSave}
        />
        
        <Button
          text="Cancel"
          onPress={onCancel}
        />
        
        <Dialog
          title="Link attribute value"
          backdrop
          minWidth={420}
          paddingSize="none"
          visible={linkingValue}
          haveCloseButton
          onClose={this._handleLinkCancel}
        >
          <LinkPropWindow
            valueDef={linkingValueDef}
            userTypedefs={linkingUserTypedefs}
            onLink={this._handleLink}
          />
        </Dialog>
      </BlockContentBoxItem>
    );
  }
}

ActionEditorComponent.propTypes = propTypes;
ActionEditorComponent.defaultProps = defaultProps;
ActionEditorComponent.displayName = 'ActionEditor';

export const ActionEditor = connect(mapStateToProps)(ActionEditorComponent);
