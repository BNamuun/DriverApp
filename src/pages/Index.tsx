import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_complete');
    
    if (hasCompletedOnboarding) {
      navigate('/home', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-background safe-top safe-bottom">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
