import { useEffect, useState } from 'react';
import Landing from './Landing';
import App from './App';

function readHash(): 'landing' | 'app' {
  return window.location.hash.replace('#', '') === 'app' ? 'app' : 'landing';
}

export default function Root() {
  const [view, setView] = useState<'landing' | 'app'>(readHash);

  useEffect(() => {
    const onHash = () => {
      setView(readHash());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return view === 'app' ? <App /> : <Landing />;
}