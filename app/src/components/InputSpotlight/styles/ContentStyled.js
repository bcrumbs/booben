/**
 * @author Ekaterina Marova
 */

import styled from 'styled-components';
import Color from 'color';
import { radiusDefault } from '../../../styles/themeSelectors';

/* Prop receivers */
const backgroundColor = ({ theme }) => {
  const bgColor = Color(theme.jssy.paletteBlueGrey[25]).fade(0.05).string();
  
  return `background-color: ${bgColor};`;
};

const shadow = ({ theme }) => {
  const shadowColor = Color(theme.jssy.paletteBlueGrey[500]).fade(0.7).string();
  
  return `box-shadow: 0 0 30px 2px ${shadowColor};`;
};

/* Styles */
export const ContentStyled = styled.div`
  border-radius: ${radiusDefault}px;
  width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;    
  ${backgroundColor}
  ${shadow}
`;

ContentStyled.displayName = 'ContentStyled';
