import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../utils/misc';
import { IconArrowChevronLeft } from '../../icons';

import {
  BlockContentViewButtonStyled,
  ButtonStyled,
  TextBoxStyled,
  SectionTitleStyled,
  TitleStyled,
  IconBoxStyled,
  ActionsStyled,
} from './styles';

const propTypes = {
  title: PropTypes.string,
  sectionTitle: PropTypes.string,
  actionsSlot: PropTypes.element,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
  onClick: PropTypes.func,
};

const defaultProps = {
  title: '',
  sectionTitle: '',
  actionsSlot: null,
  colorScheme: 'default',
  onClick: noop,
};

export const BlockContentViewButton = ({
  title,
  sectionTitle,
  actionsSlot,
  colorScheme,
  onClick,
}) => {
  const actions = actionsSlot && (
    <ActionsStyled>{actionsSlot}</ActionsStyled>
  );

  const sectionTitleElement = sectionTitle && (
    <SectionTitleStyled colorScheme={colorScheme}>
      {sectionTitle}
    </SectionTitleStyled>
  );

  return (
    <BlockContentViewButtonStyled colorScheme={colorScheme} onClick={onClick}>
      <ButtonStyled>
        <IconBoxStyled colorScheme={colorScheme}>
          <IconArrowChevronLeft />
        </IconBoxStyled>
        <TextBoxStyled>
          {sectionTitleElement}
          <TitleStyled title={title}>{title}</TitleStyled>
        </TextBoxStyled>
      </ButtonStyled>

      {actions}
    </BlockContentViewButtonStyled>
  );
}

BlockContentViewButton.propTypes = propTypes;
BlockContentViewButton.defaultProps = defaultProps;
