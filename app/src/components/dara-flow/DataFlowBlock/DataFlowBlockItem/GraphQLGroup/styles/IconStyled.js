import styled from 'styled-components';

const collapsed = ({ collapsed }) => collapsed
  ? '& > * { transform: rotate(180deg); }'
  : '';

export const IconStyled = styled.div`
  display: flex;  
  ${collapsed}
`;

IconStyled.displayName = 'IconStyled';
