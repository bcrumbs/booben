import styled from 'styled-components';
import { NodeViewStyled } from '../../styles/NodeViewStyled';
import {
  baseModule,
  colorBorder,
} from '../../../../../../../styles/themeSelectors';

export const NodeGroupStyled = styled.div` 
  ${NodeViewStyled} & {
    margin: ${baseModule(0.25)}px;
    padding-left: ${baseModule(1)}px;
    border-left: 1px dashed ${colorBorder};
  }
`;

NodeGroupStyled.displayName = 'NodeGroupStyled';
