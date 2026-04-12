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
}

export function PulsingDot({ isActive, step, stepIndex, totalSteps, onAdvance, onSkip }: PulsingDotProps) {
  const navigate = useNavigate();

  if (!isActive) return null;

  const handleAction = () => {
    if (step.navigateTo) {
      navigate(step.navigateTo);
    }
    onAdvance();
  };

  return (
    <Popover open={undefined}>
      <PopoverTrigger asChild>
        <button className="relative ml-auto flex-shrink-0 w-3 h-3 focus:outline-none" aria-label={`Tour step: ${step.title}`}>
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
          <span className="relative block w-3 h-3 rounded-full bg-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" sideOffset={12} className="w-72 p-4 rounded-xl shadow-lg border bg-popover z-[60]">
        <h4 className="font-semibold text-sm text-foreground mb-1">{step.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{step.description}</p>
        <Button size="sm" className="w-full text-xs" onClick={handleAction}>
          {step.buttonText}
        </Button>
        <div className="flex items-center justify-between mt-3">
          <button onClick={onSkip} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            Skip tour
          </button>
          <span className="text-[10px] text-muted-foreground">{stepIndex + 1} of {totalSteps}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
