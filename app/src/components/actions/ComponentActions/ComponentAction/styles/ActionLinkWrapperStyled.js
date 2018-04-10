import styled from 'styled-components';

import {
  radiusDefault,
  colorHover,
} from '../../../../../styles/themeSelectors';

export const ActionLinkWrapperStyled = styled.a`
  display: flex;
  flex-grow: 1;
  border-radius: ${radiusDefault}px;
  cursor: pointer;

  &:hover {
    background-color: ${colorHover};
  }
`;

ActionLinkWrapperStyled.displayName = 'ActionLinkWrapperStyled';
