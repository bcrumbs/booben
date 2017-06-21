'use strict';

import styled from 'styled-components';
import { PropTypes } from 'prop-types';
import { baseModule } from '../../../../styles/themeSelectors';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

export const HandlersStyled = styled.div`
  & + & {
    margin-top: ${baseModule(1)}px;
  }
`;

HandlersStyled.propTypes = propTypes;
HandlersStyled.defaultProps = defaultProps;
HandlersStyled.displayName = 'HandlersStyled';
