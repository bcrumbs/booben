import styled from 'styled-components';
import constants from '../../styles/constants';

export const PageDrawerActionsAreaStyled = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  position: relative;
  z-index: 2;
  overflow: hidden;
  overflow-y: auto;
  min-width: ${constants.actionWidth}px;
  background-color: ${constants.actions.bgColor};
  border-right: 1px solid ${constants.actions.borderColor};
`;

PageDrawerActionsAreaStyled.displayName = 'PageDrawerActionsAreaStyled';
