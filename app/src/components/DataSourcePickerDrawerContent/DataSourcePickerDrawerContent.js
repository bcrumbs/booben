'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {
  DataSourcePickerDrawerContentStyled,
} from './styles/DataSourcePickerDrawerContentStyled';

import { TitleStyled } from './styles/TitleStyled';
import { ButtonWrapperStyled } from './styles/ButtonWrapperStyled';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const DataSourcePickerDrawerContent = props => (
  <DataSourcePickerDrawerContentStyled>
    <TitleStyled>
      {props.title}
    </TitleStyled>
    
    <ButtonWrapperStyled>
      {props.children}
    </ButtonWrapperStyled>
  </DataSourcePickerDrawerContentStyled>
);

DataSourcePickerDrawerContent.propTypes = propTypes;
DataSourcePickerDrawerContent.defaultProps = defaultProps;
DataSourcePickerDrawerContent.displayName = 'DataSourcePickerDrawerContent';
