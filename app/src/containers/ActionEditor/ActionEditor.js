/**
 * @author Dmitriy Bizyaev
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _startCase from 'lodash.startcase';
import _forOwn from 'lodash.forown';
import _mapValues from 'lodash.mapvalues';
import { List, Map } from 'immutable';
import { Button } from '@reactackle/reactackle';
import { BlockContentBoxItem } from '@jssy/common-ui';
import { DesignDialog } from '../DesignDialog/DesignDialog';
import { LinkPropWindow } from '../LinkPropWindow/LinkPropWindow';
import { PropsList } from '../../components/PropsList/PropsList';
import { JssyValueEditor } from '../JssyValueEditor/JssyValueEditor';
import { ComponentActionsButtonRow } from '../../components/actions';

import {
  PropInput,
  PropList,
  PropComponentPicker,
} from '../../components/props/index';

import Project from '../../models/Project';
import { jssyValueToImmutable } from '../../models/ProjectComponent';

import JssyValue, {
  SourceDataState,
  Action,
  ActionTypes,
  MutationActionParams,
  NavigateActionParams,
  URLActionParams,
  MethodCallActionParams,
  PropChangeActionParams,
  AJAXActionParams,
  LoadMoreDataActionParams,
} from '../../models/JssyValue';

import {
  currentComponentsSelector,
  ownerPropsSelector,
  ownerUserTypedefsSelector,
  getLocalizedTextFromState,
} from '../../selectors/index';

import {
  pickComponent,
  pickComponentData,
} from '../../actions/project';

import {
  getStateSlotPickerFns,
  getConnectionDataValuePickerFns,
} from '../../actions/helpers/component-picker';

import { setInPath } from '../../lib/path';
import { formatComponentTitle } from '../../lib/components';

import {
  getMutationType,
  getMutationField,
  getJssyValueDefOfMutationArgument,
} from '../../lib/schema';

import {
  buildDefaultValue,
  getComponentMeta,
  getString,
} from '../../lib/meta';

import {
  noop,
  returnArg,
  arrayToObject,
  objectToArray,
} from '../../utils/misc';

import * as JssyPropTypes from '../../constants/common-prop-types';

import {
  INVALID_ID,
  ROUTE_PARAM_VALUE_DEF,
  AJAX_URL_VALUE_DEF,
  AJAX_BODY_VALUE_DEF,
  SYSTEM_PROPS,
} from '../../constants/misc';

const propTypes = {
  actionArgsMeta: PropTypes.arrayOf(PropTypes.object).isRequired,
  actionComponentMeta: PropTypes.object.isRequired,
  action: PropTypes.instanceOf(Action),
  meta: PropTypes.object.isRequired, // state
  schema: PropTypes.object.isRequired, // state
  project: PropTypes.instanceOf(Project).isRequired, // state
  currentComponents: JssyPropTypes.components.isRequired, // state
  ownerProps: PropTypes.object, // state
  ownerUserTypedefs: PropTypes.object, // state
  language: PropTypes.string.isRequired, // state
  pickingComponent: PropTypes.bool.isRequired, // state
  pickingComponentData: PropTypes.bool.isRequired, // state
  // eslint-disable-next-line react/no-unused-prop-types
  pickedComponentId: PropTypes.number.isRequired, // state
  // eslint-disable-next-line react/no-unused-prop-types
  pickedComponentData: PropTypes.string, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  onPickComponent: PropTypes.func.isRequired, // dispatch
  onPickComponentData: PropTypes.func.isRequired, // dispatch
};

const defaultProps = {
  action: null,
  onSave: noop,
  onCancel: noop,
  ownerProps: null,
  ownerUserTypedefs: null,
  pickedComponentData: null,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  schema: state.project.schema,
  project: state.project.data,
  currentComponents: currentComponentsSelector(state),
  ownerProps: ownerPropsSelector(state),
  ownerUserTypedefs: ownerUserTypedefsSelector(state),
  language: state.app.language,
  pickingComponent: state.project.pickingComponent,
  pickingComponentData: state.project.pickingComponentData,
  pickedComponentId: state.project.pickedComponentId,
  pickedComponentData: state.project.pickedComponentData,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onPickComponent: filter =>
    void dispatch(pickComponent(filter)),

  onPickComponentData: (filter, dataGetter) =>
    void dispatch(pickComponentData(filter, dataGetter)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

const addActionArgSourceToValueDef = valueDef => ({
  ...valueDef,
  source: [...valueDef.source, 'actionArg'],
  sourceConfigs: {
    ...(valueDef.sourceConfigs || {}),
    actionArg: {},
  },
});

const createActionParams = type => {
  switch (type) {
    case 'mutation': return new MutationActionParams();
    case 'navigate': return new NavigateActionParams();
    case 'url': return new URLActionParams();
    case 'method': return new MethodCallActionParams();
    case 'prop': return new PropChangeActionParams();
    case 'logout': return null;
    case 'ajax': return new AJAXActionParams({
      url: JssyValue.staticFromJS(''),
    });

    case 'loadMoreData': return new LoadMoreDataActionParams();
    default: return null;
  }
};

class ActionEditorComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      action: props.action || new Action(),
      linkingValue: false,
      linkParams: null,
      pickingPath: null,
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
    
    this._handleAJAXActionURLChange =
      this._handleAJAXActionURLChange.bind(this);
    this._handleAJAXActionMethodChange =
      this._handleAJAXActionMethodChange.bind(this);
    this._handleAJAXActionModeChange =
      this._handleAJAXActionModeChange.bind(this);
    this._handleAJAXActionBodyChange =
      this._handleAJAXActionBodyChange.bind(this);
    this._handleAJAXActionDecodeResponseChange =
      this._handleAJAXActionDecodeResponseChange.bind(this);
    
    this._handleLoadMoreDataActionPickComponent =
      this._handleLoadMoreDataActionPickComponent.bind(this);
    this._handleLoadMoreDataUnlink =
      this._handleLoadMoreDataUnlink.bind(this);
    
    this._handleLink = this._handleLink.bind(this);
    this._handleLinkApply = this._handleLinkApply.bind(this);
    this._handleLinkCancel = this._handleLinkCancel.bind(this);
    this._handlePick = this._handlePick.bind(this);
  
    this._handleSave = this._handleSave.bind(this);
    this._handleCancel = this._handleCancel.bind(this);
  }
  
  componentWillReceiveProps(nextProps) {
    const { pickingComponent, pickingComponentData } = this.props;

    if (nextProps.pickedComponentId === INVALID_ID) return;
    
    if (pickingComponent && !nextProps.pickingComponent) {
      if (nextProps.pickingComponentData) return;
      this._handlePickedComponent(nextProps.pickedComponentId);
    }

    if (pickingComponentData && !nextProps.pickingComponentData) {
      this._handlePickedComponentData(
        nextProps.pickedComponentId,
        nextProps.pickedComponentData,
      );
    }
  }

  _handlePickedComponent(componentId) {
    const { action } = this.state;

    if (action.type === ActionTypes.METHOD) {
      this._handleMethodActionSetComponent({ componentId });
    } else if (action.type === ActionTypes.PROP) {
      this._handlePropActionSetComponent({ componentId });
    }
  }

  _handlePickedComponentData(componentId, data) {
    const { action, pickingPath } = this.state;

    if (action.type === ActionTypes.LOAD_MORE_DATA) {
      this.setState({
        action: action.mergeIn(['params'], {
          componentId,
          pathToDataValue: data,
        }),
      });
    } else {
      const newValue = new JssyValue({
        source: 'state',
        sourceData: new SourceDataState({ componentId, stateSlot: data }),
      });

      this.setState({
        action: setInPath(pickingPath, newValue),
      });
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
            const valueDef = getJssyValueDefOfMutationArgument(arg, schema);
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
        targetComponentMeta.types,
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
  
  _handleAJAXActionURLChange({ value }) {
    const { action } = this.state;
    
    this.setState({
      action: action.setIn(['params', 'url'], value),
    });
  }
  
  _handleAJAXActionMethodChange({ value }) {
    const { action } = this.state;
    
    this.setState({
      action: action.setIn(['params', 'method'], value),
    });
  }
  
  _handleAJAXActionModeChange({ value }) {
    let { action } = this.state;
    
    action = action.setIn(['params', 'mode'], value);
    
    if (
      value === 'no-cors' &&
      !['GET', 'HEAD', 'POST'].includes(action.params.method)
    ) {
      action = action.setIn(['params', 'method'], 'GET');
    }
  
    this.setState({ action });
  }
  
  _handleAJAXActionBodyChange({ value }) {
    const { action } = this.state;
  
    this.setState({
      action: action.setIn(['params', 'body'], value),
    });
  }
  
  _handleAJAXActionDecodeResponseChange({ value }) {
    const { action } = this.state;
  
    this.setState({
      action: action.setIn(['params', 'decodeResponse'], value),
    });
  }
  
  _handleLoadMoreDataActionPickComponent() {
    const {
      meta,
      schema,
      project,
      language,
      currentComponents,
      onPickComponentData,
    } = this.props;

    const { filter, dataGetter } = getConnectionDataValuePickerFns(
      currentComponents,
      meta,
      schema,
      project,
      language,
    );

    onPickComponentData(filter, dataGetter);
  }

  _handleLoadMoreDataUnlink() {
    const { action } = this.state;

    this.setState({
      action: action.setIn(['params', 'componentId'], INVALID_ID),
    });
  }
  
  _handleSave() {
    const { onSave } = this.props;
    const { action } = this.state;
    onSave({ action });
  }
  
  _handleCancel() {
    const { onCancel } = this.props;
    onCancel();
  }
  
  _handleLink(linkParams) {
    this.setState({
      linkingValue: true,
      linkParams,
    });
  }
  
  _handleLinkApply({ newValue }) {
    const { action, linkParams } = this.state;
    
    const stateUpdates = {
      linkingValue: false,
      linkParams: null,
    };
    
    let pathToRootValue;
    if (action.type === ActionTypes.MUTATION) {
      pathToRootValue = ['params', 'args', linkParams.name];
    } else if (action.type === ActionTypes.METHOD) {
      const argIdx = parseInt(linkParams.name, 10);
      pathToRootValue = ['params', 'args', argIdx];
    } else if (action.type === ActionTypes.NAVIGATE) {
      pathToRootValue = ['params', 'routeParams', linkParams.name];
    } else if (action.type === ActionTypes.PROP) {
      pathToRootValue = ['params', 'value'];
    } else if (action.type === ActionTypes.AJAX) {
      pathToRootValue = ['params', linkParams.name];
    }
    
    if (linkParams.path.length > 0) {
      stateUpdates.action = action.updateIn(
        pathToRootValue,
        value => value.setInStatic(linkParams.path, newValue),
      );
    } else {
      stateUpdates.action = action.setIn(pathToRootValue, newValue);
    }
    
    this.setState(stateUpdates);
  }
  
  _handleLinkCancel() {
    this.setState({
      linkingValue: false,
      linkParams: null,
    });
  }

  _handlePick({ name, path, targetValueDef, targetUserTypedefs }) {
    const {
      meta,
      currentComponents,
      language,
      onPickComponentData,
    } = this.props;

    const { action } = this.state;

    const pickingPath = {
      start: {
        object: action,
        expandedPath: [],
      },
      steps: null,
    };

    if (action.type === ActionTypes.METHOD) {
      pickingPath.steps = ['args', name, ...path];
    } else if (action.type === ActionTypes.MUTATION) {
      pickingPath.steps = ['args', name, ...path];
    } else if (action.type === ActionTypes.PROP) {
      pickingPath.steps = ['value', ...path];
    } else if (action.type === ActionTypes.NAVIGATE) {
      pickingPath.steps = ['routeParams', name];
    } else {
      throw new Error(
        `ActionEditor#_handlePick: Wrong action type: ${action.type}`,
      );
    }

    this.setState({ pickingPath });

    const { filter, dataGetter } = getStateSlotPickerFns(
      targetValueDef,
      targetUserTypedefs,
      currentComponents,
      meta,
      language,
    );

    onPickComponentData(filter, dataGetter);
  }
  
  _isCurrentActionValid() {
    const { action } = this.state;
  
    if (!action.type) return false;
  
    if (action.type === ActionTypes.MUTATION) {
      if (!action.params.mutation) return false;
    } else if (action.type === ActionTypes.METHOD) {
      if (action.params.componentId === INVALID_ID || !action.params.method) {
        return false;
      }
    } else if (action.type === ActionTypes.PROP) {
      const paramsAreInvalid =
        action.params.componentId === INVALID_ID || (
          !action.params.propName &&
          !action.params.systemPropName
        );
      
      if (paramsAreInvalid) return false;
    } else if (action.type === ActionTypes.NAVIGATE) {
      if (action.params.routeId === INVALID_ID) return false;
    } else if (action.type === ActionTypes.URL) {
      if (!action.params.url) return false;
    } else if (action.type === ActionTypes.AJAX) {
      if (
        action.params.url.sourceIs(JssyValue.Source.STATIC) &&
        action.params.url.sourceData.value === ''
      ) {
        return false;
      }
    } else if (action.type === ActionTypes.LOAD_MORE_DATA) {
      if (action.params.componentId === INVALID_ID) {
        return false;
      }
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
      {
        text: getLocalizedText('actionsEditor.actionType.ajax'),
        value: 'ajax',
      },
      {
        text: getLocalizedText('actionsEditor.actionType.loadMoreData'),
        value: 'loadMoreData',
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
    const {
      schema,
      ownerProps,
      ownerUserTypedefs,
      language,
      getLocalizedText,
    } = this.props;
    
    const { action } = this.state;
    
    const mutationField = getMutationField(schema, action.params.mutation);
    
    return objectToArray(mutationField.args, (arg, argName) => {
      const key = `mutationArg_${argName}`;
      
      return (
        <JssyValueEditor
          key={key}
          name={argName}
          value={action.params.args.get(argName)}
          valueDef={getJssyValueDefOfMutationArgument(arg, schema)}
          optional={!arg.nonNull}
          language={language}
          ownerProps={ownerProps}
          ownerUserTypedefs={ownerUserTypedefs}
          getLocalizedText={getLocalizedText}
          onChange={this._handleMutationActionArgChange}
          onLink={this._handleLink}
          onPick={this._handlePick}
        />
      );
    });
  }
  
  _renderMethodActionProps() {
    const {
      meta,
      currentComponents,
      ownerProps,
      ownerUserTypedefs,
      language,
      getLocalizedText,
    } = this.props;
    
    const { action } = this.state;
    
    const componentSelected = action.params.componentId !== INVALID_ID;
    const component = componentSelected
      ? currentComponents.get(action.params.componentId)
      : null;
    
    const componentName = component ? formatComponentTitle(component) : '';
    
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
          
          if (value.sourceIs(JssyValue.Source.CONST)) return;
          
          ret.push(
            <JssyValueEditor
              key={key}
              name={String(idx)}
              value={value}
              valueDef={arg}
              optional={!arg.required}
              strings={componentMeta.strings}
              language={language}
              ownerProps={ownerProps}
              ownerUserTypedefs={ownerUserTypedefs}
              getLocalizedText={getLocalizedText}
              onChange={this._handleMethodActionArgValueChange}
              onLink={this._handleLink}
              onPick={this._handlePick}
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
      ownerProps,
      ownerUserTypedefs,
      language,
      getLocalizedText,
    } = this.props;
  
    const { action } = this.state;
  
    const componentSelected = action.params.componentId !== INVALID_ID;
    const component = componentSelected
      ? currentComponents.get(action.params.componentId)
      : null;
  
    const componentName = component ? formatComponentTitle(component) : '';
  
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
      if (action.params.propName) {
        value = action.params.propName;
      } else if (action.params.systemPropName) {
        value = `jssy_system/${action.params.systemPropName}`;
      }
      
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
            ownerProps={ownerProps}
            ownerUserTypedefs={ownerUserTypedefs}
            getLocalizedText={getLocalizedText}
            onChange={this._handlePropActionValueChange}
            onLink={this._handleLink}
            onPick={this._handlePick}
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
    const {
      project,
      ownerProps,
      ownerUserTypedefs,
      language,
      getLocalizedText,
    } = this.props;
    
    const { action } = this.state;
    
    const options = [];
    project.routes.forEach((route, routeId) =>
      void options.push({ text: route.title, value: routeId }));
    
    const value = action.params.routeId === INVALID_ID
      ? null
      : action.params.routeId;
    
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
    
    if (action.params.routeId !== INVALID_ID) {
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
              label={name}
              value={action.params.routeParams.get(name)}
              valueDef={ROUTE_PARAM_VALUE_DEF}
              language={language}
              ownerProps={ownerProps}
              ownerUserTypedefs={ownerUserTypedefs}
              getLocalizedText={getLocalizedText}
              onChange={this._handleNavigateActionRouteParamChange}
              onLink={this._handleLink}
              onPick={this._handlePick}
            />,
          );
        }
      });
    }
    
    return props;
  }
  
  _renderAJAXActionProps() {
    const {
      ownerProps,
      ownerUserTypedefs,
      language,
      getLocalizedText,
    } = this.props;
    
    const { action } = this.state;
    
    const props = [];
    
    props.push(
      <JssyValueEditor
        key="ajax_url"
        name="url"
        label={getLocalizedText('actionsEditor.actionForm.ajax.url')}
        value={action.params.url}
        valueDef={AJAX_URL_VALUE_DEF}
        language={language}
        ownerProps={ownerProps}
        ownerUserTypedefs={ownerUserTypedefs}
        getLocalizedText={getLocalizedText}
        onChange={this._handleAJAXActionURLChange}
        onLink={this._handleLink}
        onPick={this._handlePick}
      />,
    );
    
    let methodOptions;
    
    if (action.params.mode === 'no-cors') {
      methodOptions = [
        { value: 'GET', text: 'GET' },
        { value: 'POST', text: 'POST' },
        { value: 'HEAD', text: 'HEAD' },
      ];
    } else {
      methodOptions = [
        { value: 'GET', text: 'GET' },
        { value: 'POST', text: 'POST' },
        { value: 'PUT', text: 'PUT' },
        { value: 'PATCH', text: 'PATCH' },
        { value: 'DELETE', text: 'DELETE' },
        { value: 'HEAD', text: 'HEAD' },
      ];
    }
  
    props.push(
      <PropList
        key="ajax_method"
        label={getLocalizedText('actionsEditor.actionForm.ajax.method')}
        options={methodOptions}
        value={action.params.method}
        onChange={this._handleAJAXActionMethodChange}
      />,
    );
    
    const modeOptions = [
      { value: 'cors', text: 'cors' },
      { value: 'no-cors', text: 'no-cors' },
      { value: 'same-origin', text: 'same-origin' },
    ];
    
    props.push(
      <PropList
        key="ajax_mode"
        label={getLocalizedText('actionsEditor.actionForm.ajax.mode')}
        options={modeOptions}
        value={action.params.mode}
        onChange={this._handleAJAXActionModeChange}
      />,
    );
    
    if (action.params.method !== 'GET' && action.params.method !== 'HEAD') {
      props.push(
        <JssyValueEditor
          key="ajax_body"
          name="body"
          label={getLocalizedText('actionsEditor.actionForm.ajax.body')}
          value={action.params.body}
          valueDef={AJAX_BODY_VALUE_DEF}
          optional
          language={language}
          ownerProps={ownerProps}
          ownerUserTypedefs={ownerUserTypedefs}
          getLocalizedText={getLocalizedText}
          onChange={this._handleAJAXActionBodyChange}
          onLink={this._handleLink}
          onPick={this._handlePick}
        />,
      );
    }
    
    const textOptionLabel =
      getLocalizedText('actionsEditor.actionForm.ajax.decodeResponse.text');
    
    const decodeResponseOptions = [
      { value: 'text', text: textOptionLabel },
      { value: 'json', text: 'JSON' },
      { value: 'blob', text: 'BLOB' },
      { value: 'arrayBuffer', text: 'ArrayBuffer' },
    ];
    
    props.push(
      <PropList
        key="ajax_decodeResponse"
        label={getLocalizedText('actionsEditor.actionForm.ajax.decodeResponse')}
        options={decodeResponseOptions}
        value={action.params.decodeResponse}
        onChange={this._handleAJAXActionDecodeResponseChange}
      />,
    );
    
    return props;
  }
  
  _renderLoadMoreDataActionProps() {
    const { currentComponents, getLocalizedText } = this.props;
    const { action } = this.state;
    
    const label = getLocalizedText(
      'actionsEditor.actionForm.loadMoreData.componentWithData',
    );

    const isLinked = action.params.componentId !== INVALID_ID;
    let linkedWith = '';

    if (isLinked) {
      const targetComponent = currentComponents.get(action.params.componentId);
      linkedWith = formatComponentTitle(targetComponent);
    }
    
    return [
      <PropComponentPicker
        key="loadMoreData_component"
        label={label}
        linked={isLinked}
        linkedWith={linkedWith}
        getLocalizedText={getLocalizedText}
        onPickComponent={this._handleLoadMoreDataActionPickComponent}
        onUnlink={this._handleLoadMoreDataUnlink}
      />,
    ];
  }
  
  _renderAdditionalProps() {
    const { action } = this.state;
    
    switch (action.type) {
      case 'mutation': return this._renderMutationActionProps();
      case 'method': return this._renderMethodActionProps();
      case 'prop': return this._renderPropActionProps();
      case 'navigate': return this._renderNavigateActionProps();
      case 'url': return this._renderURLActionProps();
      case 'ajax': return this._renderAJAXActionProps();
      case 'loadMoreData': return this._renderLoadMoreDataActionProps();
      default: return [];
    }
  }
  
  render() {
    const {
      actionArgsMeta,
      actionComponentMeta,
      getLocalizedText,
    } = this.props;
    
    const { action, linkingValue, linkParams } = this.state;
    
    const actionTypeLabel = getLocalizedText('actionsEditor.actionType');
    const actionTypeOptions = this._getActionTypeOptions();
    const actionTypeValue = action.type === ActionTypes.MUTATION
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

    const linkWindowName = linkParams
      ? [linkParams.name, ...linkParams.path].join(',')
      : '';

    const linkTargetValueDef = linkParams
      ? addActionArgSourceToValueDef(linkParams.targetValueDef)
      : null;

    const linkTargetUserTypedefs = linkParams
      ? linkParams.targetUserTypedefs
      : null;

    return (
      <BlockContentBoxItem>
        <PropsList>
          {props}
        </PropsList>

        <ComponentActionsButtonRow>
          <Button
            narrow
            size="small"
            text={getLocalizedText('common.save')}
            disabled={isSaveButtonDisabled}
            onPress={this._handleSave}
          />

          <Button
            narrow
            size="small"
            text={getLocalizedText('common.cancel')}
            onPress={this._handleCancel}
          />
        </ComponentActionsButtonRow>

        <DesignDialog
          title="Link attribute value"
          backdrop
          minWidth={420}
          paddingSize="none"
          open={linkingValue}
          haveCloseButton
          onClose={this._handleLinkCancel}
        >
          <LinkPropWindow
            name={linkWindowName}
            valueDef={linkTargetValueDef}
            userTypedefs={linkTargetUserTypedefs}
            actionArgsMeta={actionArgsMeta}
            actionComponentMeta={actionComponentMeta}
            onLink={this._handleLinkApply}
          />
        </DesignDialog>
      </BlockContentBoxItem>
    );
  }
}

ActionEditorComponent.propTypes = propTypes;
ActionEditorComponent.defaultProps = defaultProps;
ActionEditorComponent.displayName = 'ActionEditor';

export const ActionEditor = wrap(ActionEditorComponent);
