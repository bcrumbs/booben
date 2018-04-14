import styled from 'styled-components';
import { radiusDefault } from '../../../../styles/themeSelectors';
import constants from '../../styles/constants';

export const ToolBarActionStyled = styled.div`
  display: flex;
  align-items: stretch;
  opacity: 1;
  
  & > * {
    height: ${constants.buttonSize}px;
    min-width: ${constants.buttonSize}px;
    border-radius: ${radiusDefault}px;
  }
`;

ToolBarActionStyled.displayName = 'ToolBarActionStyled';
