import styled from 'styled-components';
import drawerTopConstants from '../../DrawerTop/styles/constants';

import {
  baseModule,
  paletteBlueGrey700,
} from '../../../styles/themeSelectors';

export const BackdropBreadcrumbsStyled = styled.div`  
  background-color: ${paletteBlueGrey700};
  padding: 0 ${baseModule(2)}px;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 9999;
  min-height: ${drawerTopConstants.minHeight};
  display: flex;
  align-items: center;
`;

BackdropBreadcrumbsStyled.displayName = 'BackdropBreadcrumbsStyled';
