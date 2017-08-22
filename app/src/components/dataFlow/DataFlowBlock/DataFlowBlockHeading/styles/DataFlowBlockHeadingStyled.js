import styled from 'styled-components';
import constants from '../../styles/constants';
import { colorBorder } from '../../../../../styles/themeSelectors';

export const DataFlowBlockHeadingStyled = styled.div`
  width: 100%;
  padding: ${constants.itemPadY}px ${constants.itemPadX}px;
  border-bottom: 1px solid ${colorBorder};
`;

DataFlowBlockHeadingStyled.displayName = 'DataFlowBlockHeadingStyled';
