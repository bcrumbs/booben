import styled, { css } from 'styled-components';
import componentConstants from '../../styles/constants';

import {
  radiusDefault,
} from '../../../../styles/themeSelectors';

const py = componentConstants.item.paddingY;
const px = componentConstants.item.paddingX;

const selected = ({ selected }) => selected
  ? css`
    &,
    &:hover {      
      cursor: pointer;
      background-color: rgba(255,255,255,0.1);
    }
  `
  : '';

export const ContentBoxStyled = styled.div`
  padding: ${py}px ${px}px;
  flex-grow: 1;
  border-radius: ${radiusDefault}px;
  display: flex;
  ${selected}
`;

ContentBoxStyled.displayName = 'ContentBoxStyled';
