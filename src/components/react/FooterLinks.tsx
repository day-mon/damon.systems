import { useState } from 'react';
import { motion } from 'motion/react';

const LINKS = [
  { label: 'about', href: '/about' },
  { label: 'projects', href: '/projects' },
  { label: 'contact', href: '/contact' },
];

const LIFT = -3;
const SCALE = 1.03;
const FALLOFF = 0.4;

function liftForDistance(distance: number, active: boolean): number {
  if (active) return LIFT;
  return LIFT * Math.pow(FALLOFF, Math.abs(distance));
}

export default function FooterLinks() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className="flex gap-4 text-sm text-muted-foreground"
      onMouseLeave={() => setHovered(null)}
    >
      {LINKS.map(({ label, href }, i) => (
        <motion.a
          key={label}
          href={href}
          initial={false}
          animate={{
            y: hovered === null ? 0 : liftForDistance(i - (hovered ?? 0), i === hovered),
            scale: hovered === null ? 1 : i === hovered ? SCALE : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: hovered === null ? 500 : 300,
            damping: hovered === null ? 30 : 20,
            mass: 0.5,
          }}
          onMouseEnter={() => setHovered(i)}
        >
          {label}
        </motion.a>
      ))}
    </div>
  );
}
