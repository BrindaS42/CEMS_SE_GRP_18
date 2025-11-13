/**
 * Apple-style Animation Utilities
 * Provides consistent, physics-based animations across the application
 */

/**
 * Apple standard easing curves
 */
export const EASING = {
  // Main Apple easing - smooth ease-out
  apple: 'cubic-bezier(0.22, 1, 0.36, 1)',
  // Sharp entrance
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  // Smooth exit
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  // Spring-like bounce
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // Snappy but smooth
  snappy: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

/**
 * Standard durations (in milliseconds)
 */
export const DURATION = {
  instant: 100,
  fast: 150,
  base: 250,
  moderate: 350,
  slow: 500,
  slower: 700,
};

/**
 * Stagger delay for list animations (in milliseconds)
 */
export const STAGGER_DELAY = 30;

/**
 * Get stagger delay for an index
 */
export function getStaggerDelay(index, baseDelay = STAGGER_DELAY) {
  return index * baseDelay;
}

/**
 * Apply scroll-based reveal animations to elements
 */
export function initScrollReveal() {
  if (typeof window === 'undefined') return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Optional: unobserve after animation
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  const animatedElements = document.querySelectorAll(
    '.animate-on-scroll, [data-animate="true"]'
  );

  animatedElements.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}

/**
 * Add momentum scrolling to a container
 */
export function initMomentumScroll(container) {
  let isScrolling = false;
  let scrollVelocity = 0;
  let lastScrollY = 0;
  let animationFrame;

  const handleScroll = () => {
    const currentScrollY = container.scrollTop;
    scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    if (!isScrolling) {
      isScrolling = true;
      applyMomentum();
    }
  };

  const applyMomentum = () => {
    if (Math.abs(scrollVelocity) > 0.5) {
      scrollVelocity *= 0.95; // Friction
      container.scrollTop += scrollVelocity;
      animationFrame = requestAnimationFrame(applyMomentum);
    } else {
      isScrolling = false;
      scrollVelocity = 0;
    }
  };

  container.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    container.removeEventListener('scroll', handleScroll);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  };
}

/**
 * Page transition helper
 */
export function pageTransition(element, direction = 'in') {
  if (direction === 'in') {
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    
    requestAnimationFrame(() => {
      element.style.transition = `opacity ${DURATION.moderate}ms ${EASING.apple}, transform ${DURATION.moderate}ms ${EASING.apple}`;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  } else {
    element.style.transition = `opacity ${DURATION.base}ms ${EASING.apple}, transform ${DURATION.base}ms ${EASING.apple}`;
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
  }
}

/**
 * Modal animation helper
 */
export function modalAnimation(
  backdrop,
  content,
  state
) {
  if (state === 'open') {
    // Backdrop fade in
    backdrop.style.opacity = '0';
    requestAnimationFrame(() => {
      backdrop.style.transition = `opacity ${DURATION.base}ms ${EASING.apple}`;
      backdrop.style.opacity = '1';
    });

    // Content slide up + fade in
    content.style.opacity = '0';
    content.style.transform = 'translateY(20px) scale(0.95)';
    requestAnimationFrame(() => {
      content.style.transition = `
        opacity ${DURATION.moderate}ms ${EASING.apple},
        transform ${DURATION.moderate}ms ${EASING.apple}
      `;
      content.style.opacity = '1';
      content.style.transform = 'translateY(0) scale(1)';
    });
  } else {
    backdrop.style.transition = `opacity ${DURATION.base}ms ${EASING.apple}`;
    backdrop.style.opacity = '0';

    content.style.transition = `
      opacity ${DURATION.base}ms ${EASING.apple},
      transform ${DURATION.base}ms ${EASING.apple}
    `;
    content.style.opacity = '0';
    content.style.transform = 'translateY(10px) scale(0.98)';
  }
}

/**
 * Card hover animation class generator
 */
export function getCardAnimationClasses() {
  return 'transition-all duration-300 ease-apple hover:translate-y-[-2px] hover:shadow-lg';
}

/**
 * Button press animation
 */
export function getButtonAnimationClasses() {
  return 'transition-all duration-150 ease-apple active:scale-[0.98] hover:shadow-md';
}

/**
 * Icon interaction classes
 */
export function getIconAnimationClasses() {
  return 'transition-transform duration-150 ease-apple hover:scale-110 active:scale-95';
}

/**
 * Fade in animation class
 */
export function getFadeInClasses(staggerIndex) {
  const baseClasses = 'opacity-0 translate-y-4 transition-all duration-500 ease-apple';
  const visibleClasses = 'is-visible:opacity-100 is-visible:translate-y-0';
  const stagger = staggerIndex !== undefined ? `delay-[${staggerIndex * STAGGER_DELAY}ms]` : '';
  
  return `${baseClasses} ${visibleClasses} ${stagger}`.trim();
}

/**
 * Slide in animation classes (for panels and sidebars)
 */
export function getSlideInClasses(direction = 'right') {
  const transforms = {
    left: 'translate-x-[-100%]',
    right: 'translate-x-[100%]',
    up: 'translate-y-[-100%]',
    down: 'translate-y-[100%]',
  };

  return `${transforms[direction]} transition-transform duration-300 ease-apple is-visible:translate-x-0 is-visible:translate-y-0`;
}

/**
 * Parallax scroll effect
 */
export function initParallax() {
  if (typeof window === 'undefined') return;

  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
    ticking = false;
  };

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => window.removeEventListener('scroll', handleScroll);
}