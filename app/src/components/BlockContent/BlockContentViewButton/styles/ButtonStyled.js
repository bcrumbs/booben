import styled from 'styled-components';
import { baseModule, radiusDefault } from '../../../../styles/themeSelectors';
import constants from '../../styles/constants';

const clickable = ({ clickable }) => clickable
  ? `
    cursor: pointer;
    
    &:hover,
    &:focus {
      background-color: rgba(0,0,0,0.1);
    }
  `
  : 'cursor: default;';

export const ButtonStyled = styled.button`
  display: flex;
  flex-grow: 1;
  align-items: center;
  padding: ${baseModule(0.5)}px ${baseModule(1)}px;
  font-size: ${constants.title.fontSize}px;
  min-width: 0;
  margin: 2px;
  margin-left: -${baseModule(1)}px;
  border-radius: ${radiusDefault}px;
  
  &,
  &:hover,
  &:focus {
    outline: none;
    box-shadow: none;
    border: 0;
    background-color: transparent;
    color: currentColor;
  }
  
  ${clickable}
`;
