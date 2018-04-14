import styled from 'styled-components';

import {
  paletteBlueGrey500,
  paletteBlueGrey300,
  paletteBlueGrey25,
} from '../../../../styles/themeSelectors';

const iconLeftSize = 17;
const iconSize = 23;

export const LinkedDataStyled = styled.div`
  margin-top: 6px;

  .tag-remove-icon {
    cursor: pointer;
    color: ${paletteBlueGrey300};
    
    &:hover {
      color: ${paletteBlueGrey25};
    }
  }
  
  .tag-icon {
    color: ${paletteBlueGrey300};
    margin: 0 3px;
  }
  
  .tag-content {
    border-left: 1px solid ${paletteBlueGrey500};
  }
  
  .tag-icon > * {
    width: ${iconLeftSize}px !important;
    height: ${iconLeftSize}px !important;
    line-height: ${iconLeftSize}px !important;
    font-size: 14px !important;
    color: currentColor;
  }
  
  .tag-remove-icon > * {
    width: ${iconSize}px !important;
    height: ${iconSize}px !important;
    line-height: ${iconSize}px !important;
    font-size: 14px !important;
    color: currentColor;
  }
  
  .tag {
    display: inline-flex;
    align-items: center;
  }
  
  .tag-content,
  .tag-remove-icon {
    display: flex;
    align-items: center;
  }
`;

LinkedDataStyled.displayName = 'LinkedDataStyled';
