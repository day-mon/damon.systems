import { Laptop, Moon, Sun } from 'lucide-react';
import { useSyncExternalStore, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

type Theme = 'light' | 'dark' | 'system';

function subscribeToSystemTheme(callback: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getSystemSnapshot(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getServerSnapshot(): boolean {
  return false;
}

function useSystemIsDark() {
  return useSyncExternalStore(subscribeToSystemTheme, getSystemSnapshot, getServerSnapshot);
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
}

export default function ModeSwitch() {
  const systemDark = useSystemIsDark();
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  const iconState = resolved === 'dark' ? 'b' : 'a';

  // Idempotent DOM mutations during render — safe per React docs
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }

  function handleSetTheme(t: Theme) {
    setTheme(t);
    localStorage.setItem('theme', t);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <span className="relative grid size-[1.2rem]">
            <Sun className={`col-start-1 row-start-1 size-full transition-opacity duration-200 ${iconState === 'a' ? 'opacity-100' : 'opacity-0'}`} />
            <Moon className={`col-start-1 row-start-1 size-full transition-opacity duration-200 ${iconState === 'b' ? 'opacity-100' : 'opacity-0'}`} />
          </span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSetTheme('light')}>
          <Sun />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme('dark')}>
          <Moon />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme('system')}>
          <Laptop />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
