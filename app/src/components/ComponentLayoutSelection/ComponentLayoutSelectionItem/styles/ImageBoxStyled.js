import styled from 'styled-components';
import { paletteBlueGrey200 } from '../../../../styles/themeSelectors';

export const ImageBoxStyled = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${paletteBlueGrey200};

  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

ImageBoxStyled.displayName = 'ImageBoxStyled';
