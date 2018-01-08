import styled from 'styled-components';
import constants from '../../styles/constants';
import { baseModule } from '../../../../styles/themeSelectors';

export const ActionsBoxStyled = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: -${constants.action.marginX}px;
  margin-right: -${constants.action.marginX}px;
  min-height: ${constants.item.baseHeight}px;
  max-height: ${constants.item.baseHeight}px;
  padding: 0 ${baseModule(0.5)}px;
`;

ActionsBoxStyled.displayName = 'ActionsBoxStyled';
