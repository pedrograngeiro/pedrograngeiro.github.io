// Content stays visible unless this enhancement initializes successfully.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];

if (
  !motionPreference.matches &&
  'IntersectionObserver' in window &&
  typeof Element.prototype.animate === 'function'
) {
  const activeAnimations = new Set<Animation>();
  const delays = new Map<HTMLElement, number>();
  const groups = new Map<Element, HTMLElement[]>();

  for (const target of targets) {
    const group = target.closest('[data-reveal-group], .content-grid');
    if (!group) continue;
    const siblings = groups.get(group) ?? [];
    delays.set(target, Math.min(siblings.length % 3, 2) * 80);
    siblings.push(target);
    groups.set(group, siblings);
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const target = entry.target as HTMLElement;
      observer.unobserve(target);
      target.classList.remove('reveal-pending');
      if (motionPreference.matches || target.contains(document.activeElement)) continue;

      const animation = target.animate(
        [
          { opacity: 0, translate: '0 1rem' },
          { opacity: 1, translate: '0 0' },
        ],
        {
          duration: 550,
          delay: delays.get(target) ?? 0,
          easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
          fill: 'backwards',
        },
      );
      activeAnimations.add(animation);
      animation.finished.then(
        () => activeAnimations.delete(animation),
        () => activeAnimations.delete(animation),
      );
    }
  }, { threshold: 0.08 });

  const showAll = () => {
    observer.disconnect();
    for (const target of targets) target.classList.remove('reveal-pending');
    for (const animation of activeAnimations) animation.cancel();
    activeAnimations.clear();
  };

  try {
    for (const target of targets) {
      // Never hide content already visible, including restored scroll positions.
      if (target.getBoundingClientRect().top < window.innerHeight) continue;
      observer.observe(target);
      target.classList.add('reveal-pending');
    }
  } catch {
    showAll();
  }

  document.addEventListener('focusin', (event) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest<HTMLElement>('[data-reveal]');
    if (!target) return;
    observer.unobserve(target);
    target.classList.remove('reveal-pending');
    for (const animation of target.getAnimations()) animation.cancel();
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) showAll();
  });
  window.addEventListener('beforeprint', showAll);
}
