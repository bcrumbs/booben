import styled from 'styled-components';
import { PropTypes } from 'prop-types';

const propTypes = {
  editable: PropTypes.bool,
};

const defaultProps = {
  editable: false,
};

const editable = ({ editable }) => editable ? 'cursor: text;' : '';

export const TitleBoxStyled = styled.div`
  overflow: hidden;
  user-select: none;  
  ${editable}
`;

TitleBoxStyled.propTypes = propTypes;
TitleBoxStyled.defaultProps = defaultProps;
TitleBoxStyled.displayName = 'TitleBoxStyled';
