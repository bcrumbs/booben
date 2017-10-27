import PropTypes from 'prop-types';
import styled from 'styled-components';
import { baseModule } from '../../../../../styles/themeSelectors';
import constants from '../../../styles/constants';

const propTypes = {
  nested: PropTypes.bool,
};

const defaultProps = {
  nested: false,
};

export const ActionsRowStyled = styled.div`
  text-align: right;
  margin-right: -${baseModule(1)}px;
  margin-top: ${constants.list.marginBottom}px;
`;

ActionsRowStyled.displayName = 'ActionsRowStyled';
ActionsRowStyled.propTypes = propTypes;
ActionsRowStyled.defaultProps = defaultProps;
