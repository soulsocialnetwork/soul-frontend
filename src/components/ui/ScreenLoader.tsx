import { Loader2 } from 'lucide-react';

export function ScreenLoader() {
  return (
    <div className="flex-1 w-full h-full min-h-[50vh] flex flex-col items-center justify-center animate-fade-in">
      <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
    </div>
  );
}
