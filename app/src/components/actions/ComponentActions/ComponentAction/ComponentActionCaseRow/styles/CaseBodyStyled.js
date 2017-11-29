import styled from 'styled-components';
import constants from './constants';
import { colorBorder } from '../../../../../../styles/themeSelectors';

const paddingLeft =
  constants.markerSize / 2 - constants.borderThickness +
  constants.markerTitleSpacing;

const marginLeft =
  constants.markerSize / 2 - constants.borderThickness / 2;

export const CaseBodyStyled = styled.div`
  padding-left: ${paddingLeft}px;
  margin-left: ${marginLeft}px;
  border-left: ${constants.borderThickness}px solid ${colorBorder};
`;

CaseBodyStyled.displayName = 'CaseBodyStyled';
