/**
 * @author Dmitriy Bizyaev
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon, Checkbox, Tag } from '@reactackle/reactackle';
import { PropLabel } from './PropLabel/PropLabel';
import { PropImage } from './PropImage/PropImage';
import { PropAction } from './PropAction/PropAction';
import { noop } from '../../../utils/misc';
import { MarkWrapperStyled } from './styles/MarkWrapperStyled';
import { MarkStyled } from './styles/MarkStyled';
import { LabelBoxStyled } from './styles/LabelBoxStyled';
import { MessageBoxStyled } from './styles/MessageBoxStyled';
import { ActionsBoxStyled } from './styles/ActionsBoxStyled';
import { SubcomponentBoxStyled } from './styles/SubcomponentBoxStyled';
import { ContentBoxStyled } from './styles/ContentBoxStyled';
import { WrapperStyled } from './styles/WrapperStyled';
import { PropItemStyled } from './styles/PropItemStyled';
import { LinkedDataStyled } from './styles/LinkedDataStyled';

const propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  secondaryLabel: PropTypes.string,
  image: PropTypes.string,
  tooltip: PropTypes.string,
  message: PropTypes.string,
  linkable: PropTypes.bool,
  linked: PropTypes.bool,
  linkedWith: PropTypes.string,
  required: PropTypes.bool,
  requirementFulfilled: PropTypes.bool,
  checkable: PropTypes.bool,
  checked: PropTypes.bool,
  deletable: PropTypes.bool,
  expanded: PropTypes.bool,
  labelPositionTop: PropTypes.bool,
  additionalActions: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      rounded: PropTypes.bool,
      expanded: PropTypes.bool,
      handler: PropTypes.func.isRequired,
    }),
  ])),
  content: PropTypes.element,
  onLink: PropTypes.func,
  onPick: PropTypes.func,
  onUnlink: PropTypes.func,
  onCheck: PropTypes.func,
  onDelete: PropTypes.func,
};

const defaultProps = {
  id: '',
  label: '',
  secondaryLabel: '',
  image: '',
  tooltip: '',
  message: '',
  linkable: false,
  linked: false,
  linkedWith: '',
  required: false,
  requirementFulfilled: false,
  checkable: false,
  checked: false,
  deletable: false,
  expanded: false,
  labelPositionTop: false,
  additionalActions: [],
  content: null,
  onLink: noop,
  onPick: noop,
  onUnlink: noop,
  onCheck: noop,
  onDelete: noop,
};

export class PropBase extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this._handleCheck = this._handleCheck.bind(this);
    this._handleDelete = this._handleDelete.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handlePick = this._handlePick.bind(this);
  }

  /**
   *
   * @return {ReactElement}
   * @private
   */
  _renderLinked() {
    const { linkedWith, onUnlink } = this.props;

    return (
      <LinkedDataStyled title={linkedWith}>
        <Tag
          icon="link"
          text={linkedWith}
          bounded
          removable
          onRemove={onUnlink}
        />
      </LinkedDataStyled>
    );
  }

  /**
   *
   * @param {boolean} value
   * @private
   */
  _handleCheck({ value }) {
    const { id, onCheck } = this.props;
    onCheck({ checked: value, id });
  }

  /**
   *
   * @private
   */
  _handleDelete() {
    const { id, onDelete } = this.props;
    onDelete({ id });
  }

  /**
   *
   * @private
   */
  _handleLink() {
    const { id, onLink } = this.props;
    onLink({ id });
  }

  /**
   *
   * @private
   */
  _handlePick() {
    const { id, onPick } = this.props;
    onPick({ id });
  }

  render() {
    const {
      label,
      secondaryLabel,
      image,
      tooltip,
      message,
      required,
      requirementFulfilled,
      deletable,
      linkable,
      linked,
      checkable,
      checked,
      expanded,
      additionalActions,
      content,
      children,
      labelPositionTop,
    } = this.props;

    let labelElement = null;
    let markColorScheme = null;

    if (label) {
      let requireMark = null;

      if (required) {
        let markIcon = null;

        if (requirementFulfilled) {
          markColorScheme = 'success';
          markIcon = (
            <Icon name="check" size="inherit" color="inherit" />
          );
        } else {
          markColorScheme = 'error';
          markIcon = (
            <Icon name="exclamation" size="inherit" color="inherit" />
          );
        }

        requireMark = (
          <MarkWrapperStyled>
            <MarkStyled colorScheme={markColorScheme}>
              {markIcon}
            </MarkStyled>
          </MarkWrapperStyled>
        );
      }

      labelElement = (
        <LabelBoxStyled>
          {requireMark}

          <PropLabel
            label={label}
            secondaryLabel={secondaryLabel}
            tooltip={tooltip}
            positionTop={labelPositionTop}
            itemCheckable={checkable}
          />
        </LabelBoxStyled>
      );
    }

    let imageElement = null;
    if (image) {
      imageElement = (
        <PropImage src={image} />
      );
    }

    let messageElement = null;
    if (message) {
      messageElement = (
        <MessageBoxStyled>
          {message}
        </MessageBoxStyled>
      );
    }

    let actionsLeftElement = null;
    if (deletable) {
      actionsLeftElement = (
        <ActionsBoxStyled>
          <PropAction
            icon="times"
            onPress={this._handleDelete}
          />
        </ActionsBoxStyled>
      );
    }

    const actionItemsRight = [];

    additionalActions.forEach(action => {
      if (React.isValidElement(action)) {
        actionItemsRight.push(action);
      } else {
        actionItemsRight.push(
          <PropAction
            key={`extra-${action.id}`}
            icon={action.icon}
            rounded={action.rounded}
            expanded={action.expanded}
            onPress={action.handler} // eslint-disable-line react/jsx-handler-names
          />,
        );
      }
    });

    if (linkable && (!checkable || checked)) {
      const linkAction = (
        <PropAction
          key="linking"
          icon="link"
          onPress={this._handleLink}
        />
      );

      actionItemsRight.push(linkAction);
    }
  
    let actionsRightElement = null;
    if (actionItemsRight.length) {
      actionsRightElement = (
        <ActionsBoxStyled>
          {actionItemsRight}
        </ActionsBoxStyled>
      );
    }

    let checkboxElement = null;
    if (checkable) {
      checkboxElement = (
        <SubcomponentBoxStyled>
          <Checkbox
            checked={checked}
            onChange={this._handleCheck}
          />
        </SubcomponentBoxStyled>
      );
    }

    const contentElement = linked ? this._renderLinked() : content;

    return (
      <PropItemStyled sublevelVisible={expanded}>
        <WrapperStyled>
          {checkboxElement}
          {actionsLeftElement}
          {imageElement}

          <ContentBoxStyled>
            {labelElement}
            {messageElement}
            {contentElement}
          </ContentBoxStyled>

          {actionsRightElement}
        </WrapperStyled>

        {children}
      </PropItemStyled>
    );
  }
}

PropBase.propTypes = propTypes;
PropBase.defaultProps = defaultProps;
PropBase.displayName = 'PropBase';
