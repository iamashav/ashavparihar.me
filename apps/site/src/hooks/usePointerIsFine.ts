import { useEffect, useState } from 'react';

const QUERY = '(pointer: fine)';

export function usePointerIsFine() {
  const [fine, setFine] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = () => setFine(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return fine;
}
