import styled from 'styled-components';
import constants from '../../styles/constants';
import { baseModule } from '../../../../styles/themeSelectors';

export const SubcomponentBoxStyled = styled.div`
  display: flex;
  align-items: center;
  max-height: ${constants.item.baseHeight}px;
  margin-right: ${baseModule(1)}px;
`;

SubcomponentBoxStyled.displayName = 'SubcomponentBoxStyled';
