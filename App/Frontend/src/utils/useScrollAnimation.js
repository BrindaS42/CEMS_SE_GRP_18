import { useEffect, useCallback } from 'react';

/**
 * Hook to enable smooth scroll animations with Apple-style momentum
 * This enhances the scrolling experience across the application
 */
export function useScrollAnimation() {
  useEffect(() => {
    // Add smooth scrolling to all scrollable containers
    const scrollContainers = document.querySelectorAll('.smooth-scroll');
    
    scrollContainers.forEach((container) => {
      // Ensure smooth scroll behavior
      (container).style.scrollBehavior = 'smooth';
    });

    // Parallax effect tracking with optimized performance
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
          document.documentElement.style.setProperty('--scroll-position', scrollY.toString());
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

/**
 * Hook to observe elements and trigger animations when they enter the viewport
 * Provides a more performant alternative to always-on animations
 */
export function useIntersectionAnimation(
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px'
) {
  useEffect(() => {
    const observerOptions = {
      threshold,
      rootMargin,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Optional: Only animate once
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll(
      '.animate-on-scroll, .animate-fade-in, .animate-fade-in-up, [class*="stagger-"]'
    );

    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);
}

/**
 * Hook for page transition animations
 * Applies smooth entry animation when component mounts
 */
export function usePageTransition() {
  useEffect(() => {
    const pageContent = document.querySelector('[data-page-content]');
    if (pageContent) {
      pageContent.classList.add('page-transition');
    }
  }, []);
}

/**
 * Hook for staggered list animations
 * Automatically applies stagger delays to child elements
 */
export function useStaggerAnimation(containerSelector = '[data-stagger-container]') {
  useEffect(() => {
    const containers = document.querySelectorAll(containerSelector);
    
    containers.forEach((container) => {
      const children = Array.from(container.children);
      children.forEach((child, index) => {
        if (index < 10) {
          child.classList.add(`animate-fade-in-up`, `stagger-${index + 1}`);
        }
      });
    });
  }, [containerSelector]);
}

/**
 * Hook for momentum-based scrolling
 * Adds physics-based scroll behavior to specific containers
 */
export function useMomentumScroll(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollVelocity = 0;
    let lastScrollTop = 0;
    let animationFrameId;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      scrollVelocity = currentScrollTop - lastScrollTop;
      lastScrollTop = currentScrollTop;

      if (!isScrolling) {
        isScrolling = true;
        applyMomentum();
      }
    };

    const applyMomentum = () => {
      if (Math.abs(scrollVelocity) > 0.5) {
        scrollVelocity *= 0.95; // Friction coefficient
        container.scrollTop += scrollVelocity;
        animationFrameId = requestAnimationFrame(applyMomentum);
      } else {
        isScrolling = false;
        scrollVelocity = 0;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [containerRef]);
}

/**
 * Hook for tab transition animations
 * Smoothly animates tab content when switching
 */
export function useTabTransition() {
  const animateTabChange = useCallback((element) => {
    element.classList.remove('tab-transition');
    // Force reflow
    void element.offsetWidth;
    element.classList.add('tab-transition');
  }, []);

  return { animateTabChange };
}