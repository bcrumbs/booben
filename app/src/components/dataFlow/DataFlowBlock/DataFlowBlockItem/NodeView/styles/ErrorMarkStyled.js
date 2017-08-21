import styled from 'styled-components';
import { iconSize } from '../../../../../../styles/mixins/elements';

import {
  colorError,
  colorWhite,
} from '../../../../../../styles/themeSelectors';

export const ErrorMarkStyled = styled.div`
  background-color: ${colorError};
  color: ${colorWhite};
  border-radius: 50%;
  ${iconSize('16px', '16px', '12px', 'font')}
`;

ErrorMarkStyled.displayName = 'ErrorMarkStyled';
