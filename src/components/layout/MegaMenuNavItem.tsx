/**
 * MegaMenuNavItem — desktop navigation item with hover dropdown showing
 * subcategory groups (By Occasion / By Style / By Color / Wedding Party).
 *
 * Pattern borrowed from kalkifashion.com: hover any top-level category
 * in the header to see a 4-column dropdown of subcategory links.
 *
 * Each link goes to `/<category>?sub=<slug>` — the listing page picks up
 * the sub from the URL and filters accordingly.
 *
 * Mobile: not used. Mobile uses the existing hamburger drawer in Header.tsx.
 */

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import type { MegaMenuConfig } from '@/config/categoryConfig';

interface MegaMenuNavItemProps {
  menu: MegaMenuConfig;
}

export function MegaMenuNavItem({ menu }: MegaMenuNavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setIsOpen(true);
  };

  const close = () => {
    // Delay close slightly so users can move mouse from the trigger
    // to the dropdown panel without it closing prematurely.
    closeTimer.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <Link
        to={menu.href}
        className="luxury-link text-xs tracking-editorial uppercase font-light text-foreground/80 hover:text-foreground transition-colors whitespace-nowrap flex items-center gap-1"
      >
        {menu.label}
      </Link>

      <style>{`
        @keyframes megaMenuFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .mega-menu-dropdown {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease-out;
          willChange: opacity;
        }
        .mega-menu-dropdown.is-open {
          opacity: 1;
          pointer-events: auto;
          animation: megaMenuFadeIn 0.15s ease-out;
        }
      `}</style>
      <div
        className={`mega-menu-dropdown absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50${isOpen ? ' is-open' : ''}`}
        onMouseEnter={open}
        onMouseLeave={close}
      >
            <div className="bg-background border border-border shadow-lg rounded-lg p-6 min-w-[640px]">
              <div className="grid grid-cols-4 gap-6">
                {menu.groups.map(group => (
                  <div key={group.label}>
                    <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-3">
                      {group.label}
                    </h3>
                    <ul className="space-y-2">
                      {group.links.map(link => (
                        <li key={link.href}>
                          <Link
                            to={link.href}
                            className="text-xs text-foreground/80 hover:text-foreground transition-colors block"
                            onClick={() => setIsOpen(false)}
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Link
                  to={menu.href}
                  className="text-xs text-primary hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  View all {menu.label} →
                </Link>
              </div>
            </div>
      </div>
    </div>
  );
}

/**
 * PlainNavItem — for categories without a mega-menu (e.g., Indo-Western).
 * Kept as a separate component so the styling matches MegaMenuNavItem exactly.
 */
export function PlainNavItem({ label, href }: { label: string; href: string }) {
  return (
    <Link
      to={href}
      className="luxury-link text-xs tracking-editorial uppercase font-light text-foreground/80 hover:text-foreground transition-colors whitespace-nowrap"
    >
      {label}
    </Link>
  );
}
