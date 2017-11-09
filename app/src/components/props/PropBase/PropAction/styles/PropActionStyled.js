import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';
import constants from '../../../styles/constants';

const expanded = ({ expanded }) => expanded ? 'transform: rotate(90deg);' : '';

export const PropActionStyled = styled.div`
  display: flex;
  flex-shrink: 0;
  margin: ${constants.action.marginY}px ${constants.action.marginX}px;
  ${expanded}
  ${transition('transform')}
`;

PropActionStyled.displayName = 'PropActionStyled';
