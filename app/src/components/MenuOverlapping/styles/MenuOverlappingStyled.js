'use strict';

import styled from 'styled-components';
import { boxShadow } from '../../../styles/mixins';
import { colorWhite, radiusDefault } from '../../../styles/themeSelectors';

const boxShadow3 = boxShadow(3);

export const MenuOverlappingStyled = styled.div`
  background-color: $grey-200;
  color: $color-text-medium;
  padding: $base-module rem-calc(30); // 30 - CodeMirror ruler width + border
  //border-top: 1px solid $color-border;
  //border-bottom: 1px solid $color-border;

  @include user-select;

  pre {
      padding: 0;
      margin: 0;
  }
`;

MenuOverlappingStyled.displayName = 'MenuOverlappingStyled';
