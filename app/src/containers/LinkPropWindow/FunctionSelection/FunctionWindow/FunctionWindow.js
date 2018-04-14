import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { Button } from 'reactackle-button';

import {
  BlockContent,
  BlockContentNavigation,
  BlockBreadcrumbs,
  BlockContentBox,
  BlockContentBoxGroup,
  BlockContentBoxItem,
  BlockContentActions,
  BlockContentActionsRegion,
} from '../../../../components/BlockContent';

import ProjectFunctionRecord from '../../../../models/ProjectFunction';
import JssyValue, { SourceDataState } from '../../../../models/JssyValue';
import { jssyValueToImmutable } from '../../../../models/ProjectComponent';

import {
  getLocalizedTextFromState,
  currentComponentsSelector,
} from '../../../../selectors';

import { pickComponentData } from '../../../../actions/project';

import {
  getStateSlotPickerFns,
} from '../../../../actions/helpers/component-picker';

import { DataWindowTitle } from '../../../../components/DataWindow/DataWindow';
import { PropsList } from '../../../../components/PropsList/PropsList';
import { JssyValueEditor } from '../../../JssyValueEditor/JssyValueEditor';
import { buildDefaultValue } from '../../../../lib/meta';
import { noop, returnArg, mapListToArray } from '../../../../utils/misc';
import * as JssyPropTypes from '../../../../constants/common-prop-types';
import { ButtonWrapperStyled } from './styles/ButtonWrapperStyled';

import {
  PropExpandable,
} from '../../../../components/props/PropExpandable/PropExpandable';

const propTypes = {
  meta: PropTypes.object.isRequired,
  currentComponents: JssyPropTypes.components.isRequired,
  pickingComponentData: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  pickedComponentId: PropTypes.number.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  pickedComponentData: PropTypes.string,
  targetValueDef: PropTypes.object.isRequired,
  functionDef: PropTypes.instanceOf(ProjectFunctionRecord).isRequired,
  language: PropTypes.string.isRequired,
  getLocalizedText: PropTypes.func,
  onApply: PropTypes.func,
  onReturn: PropTypes.func,
  onReturnToList: PropTypes.func,
  onNestedLink: PropTypes.func,
  onPickComponentData: PropTypes.func.isRequired,
};

const defaultProps = {
  pickedComponentData: null,
  getLocalizedText: returnArg,
  onApply: noop,
  onReturn: noop,
  onReturnToList: noop,
  onNestedLink: noop,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  currentComponents: currentComponentsSelector(state),
  pickingComponentData: state.project.pickingComponentData,
  pickedComponentId: state.project.pickedComponentId,
  pickedComponentData: state.project.pickedComponentData,
  language: state.app.language,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onPickComponentData: (filter, dataGetter) =>
    void dispatch(pickComponentData(filter, dataGetter)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

/**
 *
 * @param {Object} arg - FunctionArgument Record
 * @param {JssyValueDefinition} targetValueDef
 * @return {JssyValueDefinition}
 */
const getValueDef = (arg, targetValueDef) => ({
  ...arg.typedef,
  label: arg.name,
  description: arg.description,
  source: [...targetValueDef.source],
});

/**
 *
 * @param {Object} functionDef - ProjectFunction Record
 * @param {JssyValueDefinition} targetValueDef
 * @return {JssyValueDefinition[]}
 */
const getValueDefs = (functionDef, targetValueDef) =>
  mapListToArray(functionDef.args, arg => getValueDef(arg, targetValueDef));

/**
 *
 * @param {JssyValueDefinition[]} argValueDefs
 * @return {Immutable.List<Object>} - List of JssyValues
 */
const makeDefaultValues = argValueDefs => List(argValueDefs.map(
  valueDef => jssyValueToImmutable(buildDefaultValue(valueDef)),
));

class _FunctionWindow extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._argsValueDefs = getValueDefs(props.functionDef, props.targetValueDef);

    this.state = {
      values: this.getArgsDefaultValues(),
      restArgValues: this.getRestArgDefaultValues(),
      restArgEnabled: true,
      restArgExpanded: true,
      linking: false,
      linkingRest: false,
      linkingName: '',
      linkingPath: null,
      picking: false,
      pickingRest: false,
      pickingName: '',
      pickingPath: null,
    };

    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleArgChange = this._handleChange.bind(this, false);
    this._handleRestArgChange = this._handleChange.bind(this, true);
    this._handleRestArgAdd = this._handleRestArgAdd.bind(this);
    this._handleRestArgDelete = this._handleRestArgDelete.bind(this);
    this._handleRestArgsEnable = this._handleRestArgsEnable.bind(this);
    this._handleRestArgsExpand = this._handleRestArgsExpand.bind(this);
    this._handleArgLink = this._handleLink.bind(this, false);
    this._handleRestArgLink = this._handleLink.bind(this, true);
    this._handleLinkDone = this._handleLinkDone.bind(this);
    this._handleArgPick = this._handlePick.bind(this, false);
    this._handleRestArgPick = this._handlePick.bind(this, true);
    this._handleBackButtonPress = this._handleBackButtonPress.bind(this);
    this._handleApplyButtonPress = this._handleApplyButtonPress.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.functionDef !== this.props.functionDef ||
      nextProps.targetValueDef !== this.props.targetValueDef
    ) {
      this._argsValueDefs = getValueDefs(
        nextProps.functionDef,
        nextProps.targetValueDef,
      );

      this.setState({
        values: this.getArgsDefaultValues(),
        restArgValues: this.getRestArgDefaultValues(),
      });
    }

    if (
      this.props.pickingComponentData &&
      !nextProps.pickingComponentData
    ) {
      this._handlePickDone({
        componentId: nextProps.pickedComponentId,
        stateSlot: nextProps.pickedComponentData,
      });
    }
  }

  getArgsValueDefs() {
    return this.props.functionDef.spreadLastArg
      ? this._argsValueDefs.slice(-1)
      : this._argsValueDefs;
  }

  getRestArgValueDef() {
    return this.props.functionDef.spreadLastArg
      ? this._argsValueDefs[this._argsValueDefs.length - 1]
      : null;
  }

  getArgsDefaultValues() {
    return makeDefaultValues(this.getArgsValueDefs());
  }

  getRestArgDefaultValues() {
    const valueDef = this.getRestArgValueDef();
    return valueDef ? makeDefaultValues([valueDef]) : null;
  }

  _handleBreadcrumbsClick({ index }) {
    const { onReturn, onReturnToList } = this.props;

    if (index === 0) onReturn();
    else if (index === 1) onReturnToList();
  }

  _handleChange(isRestArg, { name, value }) {
    const valuesKey = isRestArg ? 'restArgValues' : 'values';

    const argIndex = parseInt(name, 10);

    this.setState({
      [valuesKey]: this.state[valuesKey].set(argIndex, value),
    });
  }

  _handleRestArgsEnable({ checked }) {
    this.setState({ restArgEnabled: checked });
  }

  _handleRestArgsExpand({ expanded }) {
    this.setState({ restArgExpanded: expanded });
  }

  _handleRestArgAdd() {
    const { restArgValues } = this.state;

    this.setState({
      restArgValues: restArgValues.push(this._restArgDefaultValue),
    });
  }

  _handleRestArgDelete({ id }) {
    const { restArgValues } = this.state;

    this.setState({
      restArgValues: restArgValues.delete(id),
    });
  }

  _handleBackButtonPress() {
    this.props.onReturnToList();
  }

  _handleApplyButtonPress() {
    const { values, restArgValues } = this.state;
    const { onApply } = this.props;

    let appliedValues = values;

    if (this.props.functionDef.spreadLastArg) {
      appliedValues = values.concat(restArgValues);
    }

    onApply({ argValues: appliedValues });
  }

  _handleLink(isRestArg, { name, path, targetValueDef, targetUserTypedefs }) {
    const { functionDef, onNestedLink } = this.props;

    let argName;

    if (isRestArg) {
      argName = `${functionDef.args.last().name} ${name}`;
    } else {
      const argIndex = parseInt(name, 10);
      argName = functionDef.args.get(argIndex).name;
    }

    const nestedLinkWindowName =
      `${functionDef.title}(${[argName, ...path].join('.')})`;

    this.setState({
      linking: true,
      linkingName: name,
      linkingPath: path,
      linkingRest: isRestArg,
    });

    onNestedLink({
      name: nestedLinkWindowName,
      valueDef: targetValueDef,
      userTypedefs: targetUserTypedefs,
      onLink: this._handleLinkDone,
    });
  }

  _handleLinkDone({ newValue }) {
    const { linking, linkingName, linkingPath, linkingRest } = this.state;
    const valuesKey = linkingRest ? 'restArgValues' : 'values';

    if (!linking) return;

    const argIndex = parseInt(linkingName, 10);

    this.setState({
      linking: false,
      linkingName: '',
      linkingPath: [],
      [valuesKey]: linkingPath.length > 0
        ? this.state[valuesKey].update(
          argIndex,
          oldValue => oldValue.setInStatic(linkingPath, newValue),
        )
        : this.state[valuesKey].set(argIndex, newValue),
    });
  }

  _handlePick(isRestArg, { name, path, targetValueDef, targetUserTypedefs }) {
    const {
      meta,
      currentComponents,
      language,
      onPickComponentData,
    } = this.props;

    const { filter, dataGetter } = getStateSlotPickerFns(
      targetValueDef,
      targetUserTypedefs,
      currentComponents,
      meta,
      language,
    );

    this.setState({
      picking: true,
      pickingName: name,
      pickingPath: path,
      pickingRest: isRestArg,
    });

    onPickComponentData(filter, dataGetter);
  }

  _handlePickDone({ componentId, stateSlot }) {
    const { picking, pickingName, pickingPath, pickingRest } = this.state;
    const valuesKey = pickingRest ? 'restArgValues' : 'values';

    if (!picking) return;

    const argIndex = parseInt(pickingName, 10);
    const newValue = new JssyValue({
      source: 'state',
      sourceData: new SourceDataState({
        componentId,
        stateSlot,
      }),
    });

    this.setState({
      picking: false,
      pickingName: '',
      pickingPath: [],
      [valuesKey]: pickingPath.length > 0
        ? this.state[valuesKey].update(
          argIndex,
          oldValue => oldValue.setInStatic(pickingPath, newValue),
        )
        : this.state[valuesKey].set(argIndex, newValue),
    });
  }

  _getBreadcrumbsItems() {
    const { functionDef, getLocalizedText } = this.props;

    return [{
      title: getLocalizedText('linkDialog.sources'),
    }, {
      title: getLocalizedText('linkDialog.source.function'),
    }, {
      title: functionDef.title,
    }];
  }

  _renderRestArgForm() {
    const { restArgValues, restArgEnabled, restArgExpanded } = this.state;
    const { getLocalizedText } = this.props;
    const valueDef = this.getRestArgValueDef();

    const restArgElements = restArgValues.map((value, idx) => {
      return (
        <JssyValueEditor
          id={idx}
          key={String(idx)}
          name={String(idx)}
          value={value}
          valueDef={{ ...valueDef, label: `${idx}` }}
          optional={false}
          getLocalizedText={getLocalizedText}
          onChange={this._handleRestArgChange}
          onLink={this._handleRestArgLink}
          onPick={this._handleRestArgPick}
          deletable={idx}
          simulateLeftOffset={idx === 0}
          onDelete={this._handleRestArgDelete}
        />
      );
    });

    return (
      <PropExpandable
        label={`...${valueDef.label}`}
        secondaryLabel={valueDef.type}
        expanded={restArgExpanded}
        onToggle={this._handleRestArgsExpand}
        checkable
        checked={restArgEnabled}
        onCheck={this._handleRestArgsEnable}
      >
        {restArgElements}
        <ButtonWrapperStyled>
          <Button
            narrow
            text="Add rest arg"
            onPress={this._handleRestArgAdd}
          />
        </ButtonWrapperStyled>
      </PropExpandable>
    );
  }

  _renderArgsForm() {
    const { functionDef, getLocalizedText } = this.props;
    const { values } = this.state;
    const argsCount = functionDef.args.size;

    const props = functionDef.args.map((arg, idx) => {
      if (
        functionDef.spreadLastArg &&
        idx + 1 === argsCount
      ) return this._renderRestArgForm();

      const valueDef = this._argsValueDefs[idx];

      return (
        <JssyValueEditor
          key={String(idx)}
          name={String(idx)}
          value={values.get(idx)}
          valueDef={valueDef}
          optional={!arg.isRequired}
          getLocalizedText={getLocalizedText}
          onChange={this._handleArgChange}
          onLink={this._handleArgLink}
          onPick={this._handleArgPick}
        />
      );
    });

    return (
      <PropsList>
        {props}
      </PropsList>
    );
  }

  render() {
    const { functionDef, getLocalizedText } = this.props;

    const breadcrumbsItems = this._getBreadcrumbsItems();
    const argsForm = this._renderArgsForm();

    return (
      <BlockContent>
        <BlockContentNavigation isBordered>
          <BlockBreadcrumbs
            items={breadcrumbsItems}
            colorScheme="dark"
            onItemClick={this._handleBreadcrumbsClick}
          />
        </BlockContentNavigation>

        <BlockContentBox isBordered>
          <BlockContentBoxGroup shading="dim" colorScheme="alt">
            <BlockContentBoxItem>
              <DataWindowTitle
                title={functionDef.title}
                subtitle={functionDef.description}
              />
            </BlockContentBoxItem>
          </BlockContentBoxGroup>

          <BlockContentBoxItem>
            {argsForm}
          </BlockContentBoxItem>
        </BlockContentBox>

        <BlockContentActions>
          <BlockContentActionsRegion type="main">
            <Button
              text={getLocalizedText('common.apply')}
              onPress={this._handleApplyButtonPress}
            />
          </BlockContentActionsRegion>

          <BlockContentActionsRegion type="secondary">
            <Button
              text={getLocalizedText('linkDialog.function.backToList')}
              onPress={this._handleBackButtonPress}
            />
          </BlockContentActionsRegion>
        </BlockContentActions>
      </BlockContent>
    );
  }
}

_FunctionWindow.propTypes = propTypes;
_FunctionWindow.defaultProps = defaultProps;
_FunctionWindow.displayName = 'FunctionWindow';

export const FunctionWindow = wrap(_FunctionWindow);
