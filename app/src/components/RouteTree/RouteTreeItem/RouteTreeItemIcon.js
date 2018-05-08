import styled from 'styled-components';

const expanded = ({ expanded }) =>
  `transform: rotate(${expanded ? 180 : 0}deg);`;

export const RouteTreeItemIcon = styled.div`
  display: flex;
  ${expanded}
`;
