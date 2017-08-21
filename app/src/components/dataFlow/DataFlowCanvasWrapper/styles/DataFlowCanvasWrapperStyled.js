import styled from 'styled-components';

import {
  paletteBlueGrey500,
} from '../../../../styles/themeSelectors';

export const DataFlowCanvasWrapperStyled = styled.div`
  overflow: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${paletteBlueGrey500};
`;

DataFlowCanvasWrapperStyled.displayName = 'DataFlowCanvasWrapperStyled';
