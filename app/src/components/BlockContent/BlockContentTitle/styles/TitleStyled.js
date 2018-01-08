import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from 'reactackle-core';
import constants from '../../styles/constants';

const propTypes = {
  disabled: PropTypes.string,
  editable: PropTypes.bool,
  editing: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  disabled: '',
  editable: false,
  editing: false,
  colorScheme: 'default',
};

const disabled = ({ disabled }) => disabled
  ? `
    &,
    &[disabled] {
      background-color: transparent;
      border: 0;
      box-shadow: none;
    }
  `
  : '';

const editable = ({ editable, editing, colorScheme }) => editable
  ? css`
    border-bottom: 1px dotted ${constants[colorScheme].title.borderColor};
    background-color: transparent;
    outline: none;
    
    ${editing
      ? css`
        border-bottom-style: solid;
        border-bottom-color: ${constants[colorScheme].title.borderColorActive};
      `
      : ''
    }
    
    &:focus {
      border-bottom-style: solid;
      border-bottom-color: ${constants[colorScheme].title.borderColorActive};
    }
  `
  : '';

const colorScheme = ({ colorScheme }) => css`
  color: ${constants[colorScheme].title.color};
  
  &::placeholder {
    color: ${constants[colorScheme].title.placeholderColor};
  }
`;

export const TitleStyled = styled.input`
  padding: 0;
  width: 100%;
  line-height: ${constants.title.lineHeight};
  font-size: ${constants.title.fontSize}px;
  ${disabled}
  ${colorScheme}
  ${editable}  
  ${transition('border')}
  
  &,
  &:hover,
  &:focus {
    border-left: 0;
    border-right: 0;
    border-top: 0;
    box-shadow:none;
  }
`;

TitleStyled.propTypes = propTypes;
TitleStyled.defaultProps = defaultProps;
TitleStyled.displayName = 'TitleStyled';
