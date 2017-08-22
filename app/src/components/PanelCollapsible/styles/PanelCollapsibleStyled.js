import styled from 'styled-components';
import { boxShadow } from '../../../styles/mixins';
import constants from './constants';

import {
  colorWhite,
  paletteBlueGrey600,
  bodyFontFamily,
  fontSizeBody,
  radiusDefault,
} from '../../../styles/themeSelectors';

const boxShadow3 = boxShadow(3);

export const PanelCollapsibleStyled = styled.div`
  background-color: ${paletteBlueGrey600};
  border: 1px solid ${constants.borderColor};
  border-radius: ${radiusDefault}px;
  color: ${colorWhite};
  width: 100%;
  font-size: ${fontSizeBody}px;
  font-family: ${bodyFontFamily};
  ${boxShadow3}
`;

PanelCollapsibleStyled.displayName = 'PanelCollapsibleStyled';
