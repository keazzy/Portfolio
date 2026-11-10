/*
  Videos on cards and in case studies are written with data-src and preload="none", so nothing downloads while
  the page loads. One gets its source as it comes near the screen, and plays only while it's on screen.
*/

/** The markup for a muted, looping video that waits to load. `#t=0.1` shows its first frame rather than black. */
export const lazyVideo = (src: string, attrs = '') => `<video data-src="${src}#t=0.1" muted loop playsinline preload="none"${attrs ? ' ' + attrs : ''}></video>`;

export function lazyVideos(videos: Iterable<HTMLVideoElement>) {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    const v = en.target as HTMLVideoElement;
    if (en.isIntersecting) {
      if (v.dataset.src && !v.getAttribute('src')) v.src = v.dataset.src;
      v.play().catch(() => {});
    } else v.pause();
  }), { rootMargin: '200px 0px' });
  for (const v of videos) io.observe(v);
  return () => io.disconnect();
}
