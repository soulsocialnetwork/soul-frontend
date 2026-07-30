import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Option {
  value: string | number;
  label: string | number;
}

interface CustomSelectProps {
  value?: string | number;
  placeholder?: string;
  options: Option[];
  onChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function CustomSelect({ value, placeholder, options, onChange, className }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? placeholder ?? '';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      { }
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-2xl px-4 text-sm transition-all duration-200',
          'bg-white/5 border border-white/10 backdrop-blur-md',
          'hover:bg-white/8 hover:border-white/20',
          open && 'border-white/25 bg-white/8',
          !value ? 'text-white/40' : 'text-textPrimary'
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-white/40 shrink-0 transition-transform duration-300',
            open && 'rotate-180 text-white/70'
          )}
        />
      </button>

      { }
      <div
        className={cn(
          'absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl',
          'bg-[#13131a]/90 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/60',
          'transition-all duration-200 origin-top',
          open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
        )}
      >
        <div className="max-h-48 overflow-y-auto no-scrollbar py-1.5">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange?.(String(opt.value)); setOpen(false); }}
              className={cn(
                'w-full text-left px-4 py-2.5 text-sm transition-colors duration-150',
                String(opt.value) === String(value)
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/6 hover:text-white'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
