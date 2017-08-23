import styled from 'styled-components';
import { paletteBlueGrey600 } from '../../../../styles/themeSelectors';

export const RoutesListWrapperStyled = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: stretch;
  overflow-y: auto;
  background-color: ${paletteBlueGrey600};
`;

RoutesListWrapperStyled.displayName = 'RoutesListWrapperStyled';
