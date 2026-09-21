import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import soulzinhoCursor from '../../assets/soulzinho-cursor.png';

export function SoulzinhoCursor() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const cursorRef = useRef<HTMLDivElement>(null);
  const enabled = user?.role === 'ADMIN' || pathname.toLocaleLowerCase() === '/profile/soul';

  useEffect(() => {
    if (!enabled || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;
    document.body.classList.add('soulzinho-cursor-active');

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let velocityX = 0;
    let velocityY = 0;
    let angle = 0;
    let scale = 1;
    let frame = 0;

    const render = () => {
      const distanceX = targetX - currentX;
      const distanceY = targetY - currentY;
      velocityX = velocityX * 0.72 + distanceX * 0.18;
      velocityY = velocityY * 0.72 + distanceY * 0.18;
      currentX += velocityX;
      currentY += velocityY;

      const speed = Math.min(18, Math.hypot(velocityX, velocityY));
      const targetAngle = Math.max(-15, Math.min(15, velocityX * 1.45));
      angle += (targetAngle - angle) * 0.12;
      const targetScale = 1 + Math.min(0.13, speed * 0.008);
      scale += (targetScale - scale) * 0.14;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${angle}deg) scale(${scale})`;
      frame = requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      targetX = event.clientX - 21;
      targetY = event.clientY - 21;
      cursor.classList.add('is-visible');
    };
    const leave = () => cursor.classList.remove('is-visible');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('mouseleave', leave);
    frame = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('mouseleave', leave);
      cancelAnimationFrame(frame);
      document.body.classList.remove('soulzinho-cursor-active');
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={cursorRef} aria-hidden="true" className="soulzinho-cursor"><img src={soulzinhoCursor} alt="" /></div>;
}
