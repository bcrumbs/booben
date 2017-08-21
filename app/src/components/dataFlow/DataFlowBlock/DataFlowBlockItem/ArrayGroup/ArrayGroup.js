import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { ArrayGroupStyled } from './styles/ArrayGroupStyled';
import { TitleStyled } from './styles/TitleStyled';
import { ButtonRowStyled } from './styles/ButtonRowStyled';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: 'idx',
};

export const ArrayGroup = props => (
  <ArrayGroupStyled>
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
