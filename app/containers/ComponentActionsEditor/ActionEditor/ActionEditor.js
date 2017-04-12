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
import { List, Map } from 'immutable';
import { Button, Dialog } from '@reactackle/reactackle';

import {
  BlockContentBoxItem,
} from '../../../components/BlockContent/BlockContent';

import { LinkPropWindow } from '../../LinkPropWindow/LinkPropWindow';
import { PropsList } from '../../../components/PropsList/PropsList';
import { JssyValueEditor } from '../../JssyValueEditor/JssyValueEditor';

import {
  PropInput,
  PropList,
  PropComponentPicker,
} from '../../../components/props';

import Project from '../../../models/Project';

import ProjectComponent, {
  jssyValueToImmutable,
} from '../../../models/ProjectComponent';

import JssyValue from '../../../models/JssyValue';
import { Action, createActionParams } from '../../../models/SourceDataActions';
import { currentComponentsSelector } from '../../../selectors';
import { pickComponent } from '../../../actions/project';
import { ROUTE_PARAM_VALUE_DEF, SYSTEM_PROPS } from '../../../constants/misc';
import { getLocalizedTextFromState } from '../../../utils';

import {
  getMutationType,
  getMutationField,
  getJssyTypeOfField,
} from '../../../utils/schema';

import {
  buildDefaultValue,
  getComponentMeta,
  getString,
} from '../../../utils/meta';

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
  
  meta: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  project: PropTypes.instanceOf(Project).isRequired,
  currentComponents: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponent),
    PropTypes.number,
  ).isRequired,
  language: PropTypes.string.isRequired,
  pickingComponent: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  pickedComponentId: PropTypes.number.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onPickComponent: PropTypes.func.isRequired,
};

const defaultProps = {
  action: null,
  onSave: noop,
  onCancel: noop,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  schema: state.project.schema,
  project: state.project.data,
  currentComponents: currentComponentsSelector(state),
  language: state.app.language,
  pickingComponent: state.project.pickingComponent,
  pickedComponentId: state.project.pickedComponentId,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onPickComponent: filter => void dispatch(pickComponent(filter)),
});

class ActionEditorComponent extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      action: props.action || new Action(),
      linkingValue: false,
      linkParams: null,
    };
    
    this._handleActionTypeChange = this._handleActionTypeChange.bind(this);
    
    this._handleURLActionURLChange = this._handleURLActionURLChange.bind(this);
    this._handleURLActionNewWindowChange =
      this._handleURLActionNewWindowChange.bind(this);
    
    this._handleNavigateActionRouteChange =
      this._handleNavigateActionRouteChange.bind(this);
    this._handleNavigateActionRouteParamChange =
      this._handleNavigateActionRouteParamChange.bind(this);
    
    this._handleMutationActionArgChange =
      this._handleMutationActionArgChange.bind(this);
    
    this._handleMethodActionPickComponent =
      this._handleMethodActionPickComponent.bind(this);
    this._handleMethodActionSetComponent =
      this._handleMethodActionSetComponent.bind(this);
    this._handleMethodActionUnpickComponent =
      this._handleMethodActionUnpickComponent.bind(this);
    this._handleMethodActionMethodChange =
      this._handleMethodActionMethodChange.bind(this);
    this._handleMethodActionArgValueChange =
      this._handleMethodActionArgValueChange.bind(this);
    
    this._handlePropActionPickComponent =
      this._handlePropActionPickComponent.bind(this);
    this._handlePropActionUnpickComponent =
      this._handlePropActionUnpickComponent.bind(this);
    this._handlePropActionSetComponent =
      this._handlePropActionSetComponent.bind(this);
    this._handlePropActionPropChange =
      this._handlePropActionPropChange.bind(this);
    this._handlePropActionValueChange =
      this._handlePropActionValueChange.bind(this);
    
    this._handleLink = this._handleLink.bind(this);
    this._handleLinkApply = this._handleLinkApply.bind(this);
    this._handleLinkCancel = this._handleLinkCancel.bind(this);
  
    this._handleSave = this._handleSave.bind(this);
  }
  
  componentWillReceiveProps(nextProps) {
    const { pickingComponent } = this.props;
    const { action } = this.state;
    
    if (pickingComponent && !nextProps.pickingComponent) {
      if (action.type === 'method') {
        this._handleMethodActionSetComponent({
          componentId: nextProps.pickedComponentId,
        });
      } else if (action.type === 'prop') {
        this._handlePropActionSetComponent({
          componentId: nextProps.pickedComponentId,
        });
      }
    }
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
            const valueDef = getJssyTypeOfField(arg, schema);
            return jssyValueToImmutable(buildDefaultValue(valueDef));
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
    const { project } = this.props;
    const { action } = this.state;
    
    const route = project.routes.get(value);
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
  
  _handleNavigateActionRouteParamChange({ name, value }) {
    const { action } = this.state;
  
    this.setState({
      action: action.setIn(['params', 'routeParams', name], value),
    });
  }
  
  _handleMutationActionArgChange({ name, value }) {
    const { action } = this.state;

    if (value) {
      this.setState({
        action: action.setIn(['params', 'args', name], value),
      });
    } else {
      this.setState({
        action: action.deleteIn(['params', 'args', name]),
      });
    }
  }
  
  _handleMethodActionPickComponent() {
    const { meta, currentComponents, onPickComponent } = this.props;
    
    const filter = componentId => {
      const component = currentComponents.get(componentId);
      const componentMeta = getComponentMeta(component.name, meta);
      return !!componentMeta.methods;
    };
    
    onPickComponent(filter);
  }
  
  _handleMethodActionSetComponent({ componentId }) {
    const { action } = this.state;
    
    this.setState({
      action: action.setIn(['params', 'componentId'], componentId),
    });
  }
  
  _handleMethodActionUnpickComponent() {
    const { action } = this.state;
    
    this.setState({
      action: action.set('params', createActionParams('method')),
    });
  }
  
  _handleMethodActionMethodChange({ value }) {
    const { meta, currentComponents, language } = this.props;
    const { action } = this.state;
    
    if (action.params.method === value) return;
    
    const targetComponent = currentComponents.get(action.params.componentId);
    const targetComponentMeta = getComponentMeta(targetComponent.name, meta);
    const method = targetComponentMeta.methods[value];
    const argValues = List(method.args.map(
      arg => jssyValueToImmutable(buildDefaultValue(
        arg,
        targetComponentMeta.strings,
        language,
      )),
    ));
    
    this.setState({
      action: action.update('params', params => params.merge({
        method: value,
        args: argValues,
      })),
    });
  }
  
  _handleMethodActionArgValueChange({ name, value }) {
    const { action } = this.state;
    
    const idx = parseInt(name, 10);
    
    this.setState({
      action: action.setIn(['params', 'args', idx], value),
    });
  }
  
  _handlePropActionPickComponent() {
    this.props.onPickComponent();
  }
  
  _handlePropActionSetComponent({ componentId }) {
    const { action } = this.state;
    
    this.setState({
      action: action.setIn(['params', 'componentId'], componentId),
    });
  }
  
  _handlePropActionUnpickComponent() {
    const { action } = this.state;
    
    this.setState({
      action: action.set('params', createActionParams('prop')),
    });
  }
  
  _handlePropActionPropChange({ value }) {
    const { currentComponents } = this.props;
    const { action } = this.state;
    
    let [prefix, propName] = value.split('/');
    if (!propName) {
      propName = prefix;
      prefix = '';
    }
    
    const isSystemProp = prefix === 'jssy_system';
    
    const component = currentComponents.get(action.params.componentId);
    const propValue = isSystemProp
      ? component.systemProps.get(propName)
      : component.props.get(propName);
    
    this.setState({
      action: action.update('params', params => params.merge({
        propName: isSystemProp ? '' : propName,
        systemPropName: isSystemProp ? propName : '',
        value: propValue,
      })),
    });
  }
  
  _handlePropActionValueChange({ value }) {
    const { action } = this.state;
    
    this.setState({
      action: action.setIn(['params', 'value'], value),
    });
  }
  
  _handleSave() {
    const { onSave } = this.props;
    const { action } = this.state;
    
    onSave({ action });
  }
  
  _handleLink(linkParams) {
    this.setState({
      linkingValue: true,
      linkParams,
    });
  }
  
  _handleLinkApply({ newValue, queryArgs }) {
  
  }
  
  _handleLinkCancel() {
    this.setState({
      linkingValue: false,
      linkParams: null,
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
    const { project, schema, getLocalizedText } = this.props;
    
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
    
    if (project.auth && project.auth.type === 'jwt') {
      ret.push({
        text: getLocalizedText('actionsEditor.actionType.logout'),
        value: 'logout',
      });
    }
    
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
    const { schema, getLocalizedText } = this.props;
    const { action } = this.state;
    
    const mutationField = getMutationField(schema, action.params.mutation);
    
    return objectToArray(mutationField.args, (arg, argName) => {
      const key = `mutationArg_${argName}`;
      
      return (
        <JssyValueEditor
          key={key}
          name={argName}
          value={action.params.args.get(argName)}
          valueDef={getJssyTypeOfField(arg, schema)}
          optional={!arg.nonNull}
          getLocalizedText={getLocalizedText}
          onChange={this._handleMutationActionArgChange}
          onLink={this._handleLink}
        />
      );
    });
  }
  
  _renderMethodActionProps() {
    const {
      meta,
      currentComponents,
      language,
      getLocalizedText,
    } = this.props;
    
    const { action } = this.state;
    
    const componentSelected = action.params.componentId !== -1;
    const component = componentSelected
      ? currentComponents.get(action.params.componentId)
      : null;
    
    const componentName = component ? component.title || component.name : '';
    
    const ret = [
      <PropComponentPicker
        key="component"
        label={getLocalizedText('actionsEditor.actionForm.targetComponent')}
        linked={componentSelected}
        linkedWith={componentName}
        getLocalizedText={getLocalizedText}
        onPickComponent={this._handleMethodActionPickComponent}
        onUnlink={this._handleMethodActionUnpickComponent}
      />,
    ];
    
    if (componentSelected) {
      const componentMeta = getComponentMeta(component.name, meta);
      const options = objectToArray(
        componentMeta.methods || {},
        
        (method, methodName) => {
          const nameString = getString(
            componentMeta.strings,
            method.textKey,
            language,
          );
          
          return {
            text: nameString || methodName,
            value: methodName,
          };
        },
      );
      
      const disabled = !options.length;
      
      const label =
        getLocalizedText('actionsEditor.actionForm.method');
      
      const placeholder =
        getLocalizedText('actionsEditor.actionForm.method.placeholder');
      
      ret.push(
        <PropList
          key="method"
          label={label}
          placeholder={placeholder}
          value={action.params.method || null}
          options={options}
          disabled={disabled}
          onChange={this._handleMethodActionMethodChange}
        />,
      );
      
      if (action.params.method) {
        const method = componentMeta.methods[action.params.method];
        
        method.args.forEach((arg, idx) => {
          const key = `methodArg_${idx}`;
          const value = action.params.args.get(idx);
          
          ret.push(
            <JssyValueEditor
              key={key}
              name={String(idx)}
              value={value}
              valueDef={arg}
              optional={!arg.required}
              strings={component.strings}
              language={language}
              onChange={this._handleMethodActionArgValueChange}
              onLink={this._handleLink}
            />,
          );
        });
      }
    }
    
    return ret;
  }
  
  _renderPropActionProps() {
    const {
      meta,
      currentComponents,
      language,
      getLocalizedText,
    } = this.props;
  
    const { action } = this.state;
  
    const componentSelected = action.params.componentId !== -1;
    const component = componentSelected
      ? currentComponents.get(action.params.componentId)
      : null;
  
    const componentName = component ? component.title || component.name : '';
  
    const ret = [
      <PropComponentPicker
        key="component"
        label={getLocalizedText('actionsEditor.actionForm.targetComponent')}
        linked={componentSelected}
        linkedWith={componentName}
        getLocalizedText={getLocalizedText}
        onPickComponent={this._handlePropActionPickComponent}
        onUnlink={this._handlePropActionUnpickComponent}
      />,
    ];
    
    if (componentSelected) {
      const componentMeta = getComponentMeta(component.name, meta);
      
      const propsOptions = objectToArray(
        componentMeta.props,
        
        (propMeta, propName) => {
          const nameString = getString(
            componentMeta.strings,
            propMeta.textKey,
            language,
          );
          
          return {
            text: nameString || propName,
            value: propName,
          };
        },
      );
      
      const systemPropsOptions = objectToArray(
        SYSTEM_PROPS,
        
        (propMeta, propName) => {
          const nameKey = `propsEditor.systemProps.${propName}.name`;
          const nameString = getLocalizedText(nameKey);
    
          return {
            text: nameString || propName,
            value: `jssy_system/${propName}`,
          };
        },
      );
      
      const options = systemPropsOptions.concat(propsOptions);
      
      let value = null;
      if (action.params.propName)
        value = action.params.propName;
      else if (action.params.systemPropName)
        value = `jssy_system/${action.params.systemPropName}`;
      
      const label =
        getLocalizedText('actionsEditor.actionForm.prop');
      
      const placeholder =
        getLocalizedText('actionsEditor.actionForm.prop.placeholder');
      
      ret.push(
        <PropList
          key="prop"
          label={label}
          placeholder={placeholder}
          value={value}
          options={options}
          onChange={this._handlePropActionPropChange}
        />,
      );
      
      const propSelected =
        !!action.params.propName ||
        !!action.params.systemPropName;
      
      if (propSelected) {
        const systemPropSelected = !!action.params.systemPropName;
        
        const propValueDef = systemPropSelected
          ? SYSTEM_PROPS[action.params.systemPropName]
          : componentMeta.props[action.params.propName];
        
        const label = getLocalizedText('actionsEditor.actionForm.propValue');
        
        ret.push(
          <JssyValueEditor
            key="propValue"
            name="propValue"
            valueDef={propValueDef}
            value={action.params.value}
            label={label}
            userTypedefs={systemPropSelected ? null : componentMeta.types}
            strings={systemPropSelected ? null : componentMeta.strings}
            language={language}
            onChange={this._handlePropActionValueChange}
            onLink={this._handleLink}
          />,
        );
      }
    }
    
    return ret;
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
    const { project, getLocalizedText } = this.props;
    const { action } = this.state;
    
    const options = [];
    project.routes.forEach((route, routeId) =>
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
      const route = project.routes.get(action.params.routeId);
      const pathParts = route.path.split('/');
  
      pathParts.forEach(pathPart => {
        const isParam = pathPart.startsWith(':');
        if (isParam) {
          const name = pathPart.slice(1);
          const key = `routeParam_${name}`;
          
          props.push(
            <JssyValueEditor
              key={key}
              name={name}
              value={action.params.routeParams.get(name)}
              valueDef={ROUTE_PARAM_VALUE_DEF}
              onChange={this._handleNavigateActionRouteParamChange}
              onLink={this._handleLink}
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
      linkParams,
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
            valueDef={linkParams ? linkParams.targetValueDef : null}
            userTypedefs={linkParams ? linkParams.targetUserTypedefs : null}
            onLink={this._handleLinkApply}
          />
        </Dialog>
      </BlockContentBoxItem>
    );
  }
}

ActionEditorComponent.propTypes = propTypes;
ActionEditorComponent.defaultProps = defaultProps;
ActionEditorComponent.displayName = 'ActionEditor';

export const ActionEditor = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActionEditorComponent);
