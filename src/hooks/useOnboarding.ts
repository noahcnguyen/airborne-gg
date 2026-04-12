import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const TOUR_STEPS = [
  {
    key: 'stores',
    navPath: '/stores',
    title: 'My Stores',
    description: "Start here. Connect your eBay store to unlock the full Airborne experience. You'll need an active eBay seller account.",
    buttonText: 'Connect a Store →',
    navigateTo: '/stores',
  },
  {
    key: 'autolister',
    navPath: '/autolister',
    title: 'Autolister',
    description: "Browse Airborne's product pool and list items directly to your eBay store in one click. No manual work required.",
    buttonText: 'Got it →',
  },
  {
    key: 'orders',
    navPath: '/orders',
    title: 'Orders',
    description: 'Every eBay order you receive appears here. Airborne automatically fulfills them on Amazon and uploads tracking to eBay.',
    buttonText: 'Got it →',
  },
  {
    key: 'tools',
    navPath: '/tools',
    title: 'Tools',
    description: "Look up ASINs from Airborne's pool by eBay Legacy Item ID, or manually trigger fulfillment for any order.",
    buttonText: 'Got it →',
  },
  {
    key: 'dashboard',
    navPath: '/dashboard',
    title: 'Dashboard',
    description: 'Your command center. Track revenue, profits, active listings, and recent orders all in one place.',
    buttonText: 'Finish Tour ✓',
  },
] as const;

export function useOnboarding() {
  const { user } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data && data.onboarded === false) {
          setShowTour(true);
        }
        setLoading(false);
      });
  }, [user]);

  const completeTour = useCallback(async () => {
    if (!user) return;
    setShowTour(false);
    await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id);
  }, [user]);

  const advanceStep = useCallback(() => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      completeTour();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, completeTour]);

  return {
    showTour,
    loading,
    currentStep,
    setCurrentStep,
    totalSteps: TOUR_STEPS.length,
    step: TOUR_STEPS[currentStep],
    steps: TOUR_STEPS,
    advanceStep,
    skipTour: completeTour,
  };
}
