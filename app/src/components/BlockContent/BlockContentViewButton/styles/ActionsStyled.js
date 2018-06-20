import styled from 'styled-components';
import constants from '../../styles/constants';

export const ActionsStyled = styled.div`
  display: flex;

  & > * {
    margin: 0 ${constants.title.actionsSpacing}px;
  }
`;
