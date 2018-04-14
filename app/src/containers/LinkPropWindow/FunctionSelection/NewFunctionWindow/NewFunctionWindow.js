import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TypeNames } from '@jssy/types';

import { Form, FormItem } from 'reactackle-form';
import { TextField } from 'reactackle-text-field';
import { SelectBox } from 'reactackle-selectbox';
import { Button } from 'reactackle-button';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxHeading,
  BlockContentBoxItem,
  BlockContentActions,
  BlockContentActionsRegion,
} from '../../../../components/BlockContent';

import { DataWindowTitle } from '../../../../components/DataWindow/DataWindow';
import { PropEmpty } from '../../../../components/props';
import { PropsList } from '../../../../components/PropsList/PropsList';

import {
  FunctionArgumentNew,
} from './FunctionArgumentNew/FunctionArgumentNew';

import {
  FunctionAddArgumentButton,
} from './FunctionAddArgumentButton/FunctionAddArgumentButton';

import {
  FunctionEditor,
} from '../../../../components/FunctionEditor/FunctionEditor';

import {
  ArgumentsPlaceholderStyled,
} from './styles/ArgumentsPlaceholderStyled';

import { functionNameFromTitle } from '../../../../lib/functions';
import { noop, returnArg } from '../../../../utils/misc';
import { IconArrowChevronLeft } from '../../../../components/icons';

const propTypes = {
  existingFunctionNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  getLocalizedText: PropTypes.func,
  onCreate: PropTypes.func,
  onCancel: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onCreate: noop,
  onCancel: noop,
};

const without = (array, idx) => {
  const ret = [];

  for (let i = 0; i < array.length; i++) {
    if (i !== idx) ret.push(array[i]);
  }

  return ret;
};

const Views = {
  DEFINITION: 0,
  CODE: 1,
};

export class NewFunctionWindow extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      view: Views.DEFINITION,
      title: '',
      description: '',
      returnType: TypeNames.STRING,
      args: [],
      code: '',
      creatingNewArgument: false,
      creatingRestArg: false,
      restArgCreated: false,
    };

    this._handleTitleChange = this._handleTitleChange.bind(this);
    this._handleDescriptionChange = this._handleDescriptionChange.bind(this);
    this._handleReturnTypeChange = this._handleReturnTypeChange.bind(this);
    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
    this._handleCancelAddArgument = this._handleCancelAddArgument.bind(this);
    this._handleRestArgsToggle = this._handleRestArgsToggle.bind(this);
    this._handleAddArg = this._handleAddArg.bind(this);
    this._handleDeleteArg = this._handleDeleteArg.bind(this);
    this._handleCancel = this._handleCancel.bind(this);
    this._handleNext = this._handleNext.bind(this);
    this._handleBack = this._handleBack.bind(this);
    this._handleCreate = this._handleCreate.bind(this);
    this._handleCodeChange = this._handleCodeChange.bind(this);
  }

  _getTypeSelectOptions() {
    const { getLocalizedText } = this.props;

    return [
      { value: TypeNames.STRING, text: getLocalizedText('types.string') },
      { value: TypeNames.INT, text: getLocalizedText('types.int') },
      { value: TypeNames.FLOAT, text: getLocalizedText('types.float') },
      { value: TypeNames.BOOL, text: getLocalizedText('types.bool') },
    ];
  }

  _isNextButtonDisabled() {
    return !this.state.title;
  }

  _handleTitleChange({ value }) {
    this.setState({ title: value });
  }

  _handleDescriptionChange({ value }) {
    this.setState({ description: value });
  }

  _handleReturnTypeChange({ value }) {
    this.setState({ returnType: value });
  }

  _handleAddButtonPress() {
    this.setState({ creatingNewArgument: true });
  }

  _handleCancelAddArgument() {
    this.setState({ creatingNewArgument: false });
  }

  _handleRestArgsToggle({ value }) {
    this.setState({ creatingRestArg: value });
  }

  _handleAddArg(arg) {
    const { args, restArgCreated, creatingRestArg } = this.state;

    let newArgs;
    if (restArgCreated) {
      newArgs = [...args];
      newArgs.splice(-1, 0, arg);
    } else {
      newArgs = [...args, arg];
    }

    this.setState({
      args: newArgs,
      creatingNewArgument: false,
      restArgCreated: restArgCreated || creatingRestArg,
    });
  }

  _handleDeleteArg({ id }) {
    const { args, restArgCreated } = this.state;

    const idx = parseInt(id, 10);

    const deletingRestArg = restArgCreated && idx === args.length - 1;

    this.setState({
      args: without(args, idx),
      restArgCreated: !deletingRestArg,
    });
  }

  _handleCancel() {
    this.props.onCancel();
  }

  _handleNext() {
    this.setState({ view: Views.CODE });
  }

  _handleBack() {
    this.setState({ view: Views.DEFINITION });
  }

  _handleCreate() {
    const { onCreate } = this.props;
    const {
      args,
      title,
      description,
      returnType,
      code,
      restArgCreated,
    } = this.state;

    onCreate({
      title,
      description,
      args,
      returnType,
      code,
      spreadLastArg: restArgCreated,
    });
  }

  _handleCodeChange(code) {
    this.setState({ code });
  }

  _renderDefinitionForm() {
    const { getLocalizedText } = this.props;

    const {
      title,
      description,
      returnType,
      args,
      creatingNewArgument,
      creatingRestArg,
      restArgCreated,
    } = this.state;

    const typeSelectOptions = this._getTypeSelectOptions();
    const isNextButtonDisabled = this._isNextButtonDisabled();

    let newArgumentButton = null;
    let newArgumentForm = null;

    if (creatingNewArgument) {
      newArgumentForm = (
        <FunctionArgumentNew
          existingArgNames={args.map(item => item.name)}
          getLocalizedText={getLocalizedText}
          onAdd={this._handleAddArg}
          onCancel={this._handleCancelAddArgument}
          restArgDisabled={restArgCreated}
          restArgChecked={creatingRestArg}
          onRestArgCheckToogle={this._handleRestArgsToggle}
        />
      );
    } else {
      newArgumentButton = (
        <FunctionAddArgumentButton
          getLocalizedText={getLocalizedText}
          onPress={this._handleAddButtonPress}
        />
      );
    }

    let argsList = null;
    if (args.length > 0) {
      const list = args.map(({ name, type }, idx) => {
        let secondaryLabel = getLocalizedText(`types.${type}`);

        if (restArgCreated && idx === args.length - 1) {
          secondaryLabel =
            `${secondaryLabel}, ${getLocalizedText(
              'linkDialog.function.new.restArg',
            )}`;
        }

        return (
          <PropEmpty
            key={name}
            id={String(idx)}
            label={name}
            secondaryLabel={secondaryLabel}
            deletable
            onDelete={this._handleDeleteArg}
          />
        );
      });

      argsList = (
        <PropsList>
          {list}
        </PropsList>
      );
    } else {
      argsList = (
        <ArgumentsPlaceholderStyled>
          {getLocalizedText('linkDialog.function.new.argsEmpty')}
        </ArgumentsPlaceholderStyled>
      );
    }

    return (
      <BlockContent>
        <BlockContentBox spread>
          <BlockContentBoxItem isBordered>
            <DataWindowTitle
              title={getLocalizedText('linkDialog.function.new.windowTitle')}
            />
          </BlockContentBoxItem>

          <BlockContentBoxItem>
            <Form>
              <FormItem>
                <TextField
                  label={getLocalizedText('linkDialog.function.new.title')}
                  value={title}
                  onChange={this._handleTitleChange}
                />
              </FormItem>

              <FormItem>
                <TextField
                  multiline
                  multilineRows={{ min: 1 }}
                  label={getLocalizedText('linkDialog.function.new.desc')}
                  value={description}
                  onChange={this._handleDescriptionChange}
                />
              </FormItem>

              <FormItem>
                <SelectBox
                  label={getLocalizedText('linkDialog.function.new.returnType')}
                  value={returnType}
                  options={typeSelectOptions}
                  onChange={this._handleReturnTypeChange}
                />
              </FormItem>
            </Form>
          </BlockContentBoxItem>

          <BlockContentBoxHeading>
            {getLocalizedText('linkDialog.function.new.argsList')}
          </BlockContentBoxHeading>

          <BlockContentBoxItem>
            {argsList}
            {newArgumentButton}
          </BlockContentBoxItem>

          {newArgumentForm}
        </BlockContentBox>

        <BlockContentActions>
          <BlockContentActionsRegion type="main">
            <Button
              text={getLocalizedText('common.cancel')}
              onPress={this._handleCancel}
              outlined
              size="small"
            />

            <Button
              text={getLocalizedText('common.next')}
              disabled={isNextButtonDisabled}
              onPress={this._handleNext}
              outlined
              size="small"
            />
          </BlockContentActionsRegion>
        </BlockContentActions>
      </BlockContent>
    );
  }

  _renderCodeEditor() {
    const { existingFunctionNames, getLocalizedText } = this.props;
    const { args, title, code, restArgCreated } = this.state;

    const functionName = functionNameFromTitle(title, existingFunctionNames);

    return (
      <BlockContent>
        <BlockContentBox isBordered>
          <BlockContentBoxItem blank>
            <FunctionEditor
              name={functionName}
              args={args}
              spreadLastArg={restArgCreated}
              code={code}
              onChange={this._handleCodeChange}
            />
          </BlockContentBoxItem>
        </BlockContentBox>

        <BlockContentActions>
          <BlockContentActionsRegion type="secondary">
            <Button
              text={getLocalizedText('common.back')}
              icon={<IconArrowChevronLeft />}
              onPress={this._handleBack}
            />
          </BlockContentActionsRegion>
          <BlockContentActionsRegion type="main">
            <Button
              text={getLocalizedText('common.cancel')}
              onPress={this._handleCancel}
            />
            <Button
              text={getLocalizedText('common.create')}
              onPress={this._handleCreate}
            />
          </BlockContentActionsRegion>
        </BlockContentActions>
      </BlockContent>
    );
  }

  render() {
    const { view } = this.state;

    switch (view) {
      case Views.DEFINITION: return this._renderDefinitionForm();
      case Views.CODE: return this._renderCodeEditor();
      default: return null;
    }
  }
}

NewFunctionWindow.propTypes = propTypes;
NewFunctionWindow.defaultProps = defaultProps;
NewFunctionWindow.displayName = 'NewFunctionWindow';
