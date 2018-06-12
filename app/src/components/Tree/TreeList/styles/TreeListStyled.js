import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';

const propTypes = {
  level: PropTypes.number,
};

const defaultProps = {
  level: 0,
};

const offsetGenerator = () => {
  const selectorsArray = ['li'];
  let itemSelectors = '';
  const selectorItem = '& li';
  const result = [];

  for (let index = 0; index < 20; index++) {
    selectorsArray.push(selectorItem);
    itemSelectors = selectorsArray.join(' > ');
    const cssItem = css`
      ${itemSelectors} > div {
        padding-left:
          ${constants.levelOffset * (index + 1) + constants.itemPaddingX}px;
      }
    `;
    result.push(cssItem);
  }

  return result;
};

export const TreeListStyled = styled.ul`
  margin: 0;
  list-style-type: none;
  padding: 0;
  
  ${offsetGenerator}
`;

TreeListStyled.propTypes = propTypes;
TreeListStyled.defaultProps = defaultProps;
