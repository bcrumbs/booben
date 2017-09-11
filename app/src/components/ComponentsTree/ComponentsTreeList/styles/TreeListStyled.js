import styled, { css } from 'styled-components';
import constants from '../../styles/constants';

const offsetGenerator = ({ level = 20 }) => {
  const selectorsArray = ['li'];
  let itemSelectors = '';
  const selectorItem = '& li';
  
  const levels = [...Array(level).keys()];
  
  return levels.map(idx => {
    selectorsArray.push(selectorItem);
    itemSelectors = selectorsArray.join(' > ');
  
    return css`
      ${itemSelectors} > div {
        padding-left:
          ${constants.levelOffset * (idx + 1) + constants.itemPaddingX}px;
      }
    `;
  });
};

export const TreeListStyled = styled.ul`
  margin: 0;
  list-style-type: none;
  padding: 0;
  ${offsetGenerator}
`;

TreeListStyled.displayName = 'TreeListStyled';
