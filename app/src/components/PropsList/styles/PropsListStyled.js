import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import constants from './constants';
import { baseModule, colorBorder } from '../../../styles/themeSelectors';

const propTypes = {
  nested: PropTypes.bool,
};

const defaultProps = {
  nested: false,
};

const nested = ({ nested }) => nested
  ? css`
    padding-left: ${baseModule(2.5)}px;
    margin-bottom: ${constants.list.marginBottom}px;
    border-bottom: 1px solid ${colorBorder};
  `
  : '';

export const PropsListStyled = styled.div`
  border-left: 0 solid transparent;
  ${nested}
  
  &:empty {
    margin: 0;
    border-width: 0;
  }
`;

PropsListStyled.displayName = 'PropsListStyled';
PropsListStyled.propTypes = propTypes;
PropsListStyled.defaultProps = defaultProps;
