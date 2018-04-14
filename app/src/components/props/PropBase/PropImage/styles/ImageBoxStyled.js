import styled from 'styled-components';
import { baseModule } from '../../../../../styles/themeSelectors';

const imageSize = 40;

export const ImageBoxStyled = styled.div`
  width: ${imageSize}px;
  height: ${imageSize}px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${baseModule(1.5)}px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  flex-shrink: 0;
  user-select: none;

  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

ImageBoxStyled.displayName = 'ImageBoxStyled';
