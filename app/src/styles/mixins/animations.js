import { keyframes } from 'styled-components';

const SlideInDown = keyframes`
  from {
    transform: translate3d(0, -100%, 0);
    visibility: visible;
  }

  100% {
    transform: translate3d(0, 0, 0);
  }
`;

export const animations = {
  slideInDown: SlideInDown,
};
