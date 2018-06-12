import styled from 'styled-components';
import componentConstants from '../../styles/constants';
import { paletteBlueGrey200 } from '../../../../styles/themeSelectors';

const imgSize =
  componentConstants.itemMaxWidth - componentConstants.itemPadding * 2;

export const ImageBoxStyled = styled.div`
  width: ${imgSize}px;
  height: ${imgSize}px;
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
