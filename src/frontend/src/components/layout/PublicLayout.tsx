import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LandingNav } from '../landing/LandingNav';
import { LandingFooter } from '../landing/LandingFooter';

export function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <LandingNav />
      <main className="flex-1 pt-[4.5rem]">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}
