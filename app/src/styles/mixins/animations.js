import { keyframes } from 'styled-components';

const slideInDown = keyframes`
  from {
    transform: translate3d(0, -100%, 0);
    visibility: visible;
  }

  100% {
    transform: translate3d(0, 0, 0);
  }
`;

export const animations = {
  slideInDown,
};
