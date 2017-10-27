/**
 * @author Dmitriy Bizyaev
 */

const SPLASH_SCREEN_ID = 'splash-screen';
const EXIT_CLASS = 'exit';
const EXIT_ANIMATION_DURATION = 200;

export const removeSplashScreen = () => {
  const el = document.getElementById(SPLASH_SCREEN_ID);
  if (!el) return;
  if (el.classList.contains(EXIT_CLASS)) return;
  el.classList.add(EXIT_CLASS);

  const destroySplashScreenElement = () =>
    void document.body.removeChild(el);

  setTimeout(destroySplashScreenElement, EXIT_ANIMATION_DURATION);
};
