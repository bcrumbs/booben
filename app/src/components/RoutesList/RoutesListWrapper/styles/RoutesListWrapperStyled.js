import styled from 'styled-components';
import { patternBlueprint } from '../../../../styles/mixins/style';
import { paletteBlueGrey600 } from '../../../../styles/themeSelectors';

export const RoutesListWrapperStyled = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: stretch;
  background-color: ${paletteBlueGrey600};
  
  ${patternBlueprint(
    'rgba(255, 255, 255, 0.1)', 
    1,
    20,
    'rgba(255, 255, 255, 0)',
    1,
    100,
    -1,
    -1,
  )}
`;

RoutesListWrapperStyled.displayName = 'RoutesListWrapperStyled';
