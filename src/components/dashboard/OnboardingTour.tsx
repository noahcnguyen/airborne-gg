import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface TourStep {
  key: string;
  navPath: string;
  title: string;
  description: string;
  buttonText: string;
  navigateTo?: string;
}

interface PulsingDotProps {
  isActive: boolean;
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onAdvance: () => void;
  onSkip: () => void;
  onActivate: () => void;
}

export function PulsingDot({ isActive, step, stepIndex, totalSteps, onAdvance, onSkip, onActivate }: PulsingDotProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleDotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActivate();
    setOpen(true);
  };

  const handleAction = () => {
    setOpen(false);
    if (step.navigateTo) {
      navigate(step.navigateTo);
    }
    onAdvance();
  };

  const handleSkip = () => {
    setOpen(false);
    onSkip();
  };

  return (
    <Popover open={isActive && open} onOpenChange={(v) => { if (!v) setOpen(false); }}>
      <PopoverTrigger asChild>
        <button
          className="absolute -top-1.5 -right-1.5 flex-shrink-0 w-5 h-5 cursor-pointer focus:outline-none z-50"
          aria-label={`Tour step: ${step.title}`}
          onClick={handleDotClick}
          type="button"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-warning text-white text-[11px] font-bold leading-none shadow-sm animate-wiggle">!</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" sideOffset={12} className="w-72 p-4 rounded-xl shadow-lg border bg-popover z-[1000]">
        <h4 className="font-semibold text-sm text-foreground mb-1">{step.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{step.description}</p>
        <Button size="sm" className="w-full text-xs" onClick={handleAction}>
          {step.buttonText}
        </Button>
        <div className="flex items-center justify-between mt-3">
          <button onClick={handleSkip} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            Skip tour
          </button>
          <span className="text-[10px] text-muted-foreground">{stepIndex + 1} of {totalSteps}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
