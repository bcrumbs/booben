import styled from 'styled-components';

const collapsed = ({ collapsed }) => collapsed
  ? '& > * { transform: rotate(-90deg); }'
  : '';

export const ButtonStyled = styled.div`
  display: flex;
  flex-shrink: 0;
  ${collapsed}
`;

ButtonStyled.displayName = 'ButtonStyled';
