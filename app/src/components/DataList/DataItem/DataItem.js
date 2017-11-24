import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, TooltipIcon } from '@reactackle/reactackle';
import { noop, returnArg } from '../../../utils/misc';
import { DataListItemStyled } from './styles/DataListItemStyled';
import { ContentBoxStyled } from './styles/ContentBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { DescriptionStyled } from './styles/DescriptionStyled';
import { TypeStyled } from './styles/TypeStyled';
import { ContentStyled } from './styles/ContentStyled';
import { ActionsStyled } from './styles/ActionsStyled';
import { ButtonsStyled } from './styles/ButtonsStyled';

const propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  type: PropTypes.string,
  tooltip: PropTypes.string,
  data: PropTypes.any,
  argsButton: PropTypes.bool,
  selected: PropTypes.bool,
  connection: PropTypes.bool,
  canBeApplied: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onSelect: PropTypes.func,
  onSetArgumentsClick: PropTypes.func,
  onApplyClick: PropTypes.func,
  onJumpIntoClick: PropTypes.func,
};

const defaultProps = {
  description: '',
  type: '',
  tooltip: '',
  data: null,
  argsButton: false,
  selected: false,
  connection: false,
  canBeApplied: false,
  getLocalizedText: returnArg,
  onSelect: noop,
  onSetArgumentsClick: noop,
  onApplyClick: noop,
  onJumpIntoClick: noop,
};

export class DataItem extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._handleSelect = this._handleSelect.bind(this);
    this._handleJumpInto = this._handleJumpInto.bind(this);
    this._handleApplyClick = this._handleApplyClick.bind(this);
    this._handleSetArgumentsClick = this._handleSetArgumentsClick.bind(this);
  }
  
  _handleSelect() {
    const { id, data, onSelect } = this.props;
    onSelect({ id, data });
  }
  
  _handleJumpInto() {
    const { id, data, onJumpIntoClick } = this.props;
    onJumpIntoClick({ id, data });
  }
  
  _handleApplyClick() {
    const { id, data, onApplyClick } = this.props;
    onApplyClick({ id, data });
  }
  
  _handleSetArgumentsClick() {
    const { id, data, onSetArgumentsClick } = this.props;
    onSetArgumentsClick({ id, data });
  }
  
  render() {
    const {
      title,
      description,
      tooltip,
      selected,
      argsButton,
      connection,
      canBeApplied,
      type,
      getLocalizedText,
    } = this.props;
      
    let tooltipElement = null;
    if (tooltip) {
      tooltipElement = (
        <TooltipIcon text={tooltip} />
      );
    }
  
    let argsButtonElement = null;
    if (argsButton) {
      argsButtonElement = (
        <Button
          narrow
          text={getLocalizedText('linkDialog.data.setArguments')}
          onPress={this._handleSetArgumentsClick}
        />
      );
    }
  
    let actionsRight = null;
    if (connection) {
      actionsRight = (
        <ActionsStyled>
          <Button
            icon={{ name: 'chevron-right' }}
            onPress={this._handleJumpInto}
            radius="rounded"
            size="small"
          />
        </ActionsStyled>
      );
    }
  
    let descriptionElement = null;
    if (description) {
      descriptionElement = (
        <DescriptionStyled>
          {description}
        </DescriptionStyled>
      );
    }
  
    let content = null;
    if (descriptionElement || argsButtonElement || canBeApplied) {
      let applyButton = null;
      if (canBeApplied) {
        applyButton = (
          <Button
            narrow
            text={getLocalizedText('common.apply')}
            onPress={this._handleApplyClick}
          />
        );
      }
    
      content = (
        <ContentStyled>
          {descriptionElement}
          <ButtonsStyled selected={selected}>
            {argsButtonElement}
            {applyButton}
          </ButtonsStyled>
        </ContentStyled>
      );
    }
  
    let typeElement = null;
    if (type) {
      typeElement = (
        <TypeStyled>{type}</TypeStyled>
      );
    }
  
    return (
      <DataListItemStyled selected={selected} onClick={this._handleSelect}>
        <ContentBoxStyled selected={selected}>
          <div>
            <TitleStyled>{title}</TitleStyled>
            {typeElement}
            {tooltipElement}
          </div>
          {content}
        </ContentBoxStyled>
        {actionsRight}
      </DataListItemStyled>
    );
  }
}

DataItem.propTypes = propTypes;
DataItem.defaultProps = defaultProps;
DataItem.displayName = 'DataItem';
