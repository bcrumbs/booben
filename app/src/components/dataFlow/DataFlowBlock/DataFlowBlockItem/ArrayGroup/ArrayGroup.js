import React from 'react';
import PropTypes from 'prop-types';
import { Button, SelectBox } from '@reactackle/reactackle';
import { ArrayGroupStyled } from './styles/ArrayGroupStyled';
import { TitleStyled } from './styles/TitleStyled';
import { ButtonRowStyled } from './styles/ButtonRowStyled';
import { TypeStyled } from './styles/TypeStyled';

const propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
};

const defaultProps = {
  title: 'idx',
  type: 'string',
};

// TODO в селект запихиваем тип элементов массива
export const ArrayGroup = props => (
  <ArrayGroupStyled>
    <TypeStyled>
      <SelectBox fullWidth dense defaultValue="String" />
    </TypeStyled>
    <TitleStyled>
      {props.title}
    </TitleStyled>

    {props.children}

    <ButtonRowStyled>
      <Button text="Add item" icon={{ name: 'plus' }} narrow />
    </ButtonRowStyled>
  </ArrayGroupStyled>
);

ArrayGroup.displayName = 'ArrayGroup';
ArrayGroup.propTypes = propTypes;
ArrayGroup.defaultProps = defaultProps;
