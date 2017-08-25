import styled from 'styled-components';

export const ImageStyled = styled.picture`
  width: 100%;
  min-height: 90px;
  display: flex;
  align-items: center;
  overflow: hidden;

  img {
    width: 100%;
    max-width: 100%;
  }
`;

ImageStyled.displayName = 'ImageStyled';
