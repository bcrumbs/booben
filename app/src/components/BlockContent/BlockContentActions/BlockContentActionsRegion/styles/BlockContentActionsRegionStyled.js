import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { baseModule } from '../../../../../styles/themeSelectors';

const propTypes = {
  type: PropTypes.oneOf(['main', 'secondary']),
};

const defaultProps = {
  type: 'main',
};

const type = ({ type }) => type === 'main'
  ? `
    justify-content: flex-end;
    flex-grow: 1;
  `
  : `
    justify-content: flex-start;
  `;

const margin = ({ theme, type }) => {
  const itemsSpacing = theme.reactackle.baseModule * 0.25;
  const margin =
    itemsSpacing + theme.reactackle.components.button.size.normal.textPaddingX;

  return css`
    margin-top: -${itemsSpacing}px;
    margin-bottom: -${itemsSpacing}px;
    
    ${
      type === 'main'
        ? `margin-right: -${margin}px;`
        : `margin-left: -${margin}px;`
    }
  
    & > * {
        margin: ${itemsSpacing}px;
    }    
  `;
};

export const BlockContentActionsRegionStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap; 
  ${type}
  ${margin}
    
  & + & {
    padding-left: ${baseModule(1)}px;
  } 
`;

BlockContentActionsRegionStyled.propTypes = propTypes;
BlockContentActionsRegionStyled.defaultProps = defaultProps;
BlockContentActionsRegionStyled.displayName = 'BlockContentActionsRegionStyled';
