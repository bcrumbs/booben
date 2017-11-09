import styled from 'styled-components';
import constants from './constants';
import { baseModule } from '../../../../../styles/themeSelectors';

const marginLeft = constants.iconTextSpacing * 2;

export const ActionContentWrapperStyled = styled.div`
  margin-left: ${marginLeft}px;
  padding-bottom: ${baseModule(1.5)}px;
`;

ActionContentWrapperStyled.displayName = 'ActionContentWrapperStyled';
