'use strict';

import styled from 'styled-components';
import { iconSize } from '../../../../styles/mixins/elements';

export const DescriptionMarkStyled = styled.span`
  vertical-align: sub;
  ${iconSize('1.2em', '1.2em', '1em', 'font')}
`;

DescriptionMarkStyled.displayName = 'DescriptionMarkStyled';
