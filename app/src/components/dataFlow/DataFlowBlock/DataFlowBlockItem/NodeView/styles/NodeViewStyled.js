import styled from 'styled-components';
import constants from '../../../styles/constants';
import { baseModule } from '../../../../../../styles/themeSelectors';

export const NodeViewStyled = styled.div`
  padding: ${constants.itemPadY}px ${constants.itemPadX}px;
  position: relative;
`;

NodeViewStyled.displayName = 'NodeViewStyled';
