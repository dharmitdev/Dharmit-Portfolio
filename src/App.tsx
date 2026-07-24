import { HashRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Home from './Home';
import WeatherApp from './WeatherApp';
import Resume from './Resume';

export default function App() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    
    // Default to center or handle safely
    let mx = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    let my = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
    let rx = mx;
    let ry = my;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => { 
      mx = e.clientX; 
      my = e.clientY; 
      if (cursor && ring && !cursor.classList.contains('visible')) {
        cursor.classList.add('visible');
        ring.classList.add('visible');
      }
    };

    const onMouseLeave = () => {
      if (cursor && ring) {
        cursor.classList.remove('visible');
        ring.classList.remove('visible');
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, .project-card, .skill-tag, input, textarea')) {
        cursor?.classList.add('hover');
        ring?.classList.add('hover');
      } else {
        cursor?.classList.remove('hover');
        ring?.classList.remove('hover');
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver);

    const animCursor = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (cursor) {
        cursor.style.transform = `translate3d(calc(${mx}px - 50%), calc(${my}px - 50%), 0)`;
      }
      if (ring) {
        ring.style.transform = `translate3d(calc(${rx}px - 50%), calc(${ry}px - 50%), 0)`;
      }
      rafId = requestAnimationFrame(animCursor);
    };
    animCursor();

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <HashRouter>
      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor-ring" ref={ringRef}></div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/weather" element={<WeatherApp />} />
        <Route path="/resume" element={<Resume />} />
      </Routes>
    </HashRouter>
  );
}
