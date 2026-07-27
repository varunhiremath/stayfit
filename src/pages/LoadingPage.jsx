import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/logo/LoadingScreen.jsx';

export default function LoadingPage() {
  const navigate = useNavigate();
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeAt = setTimeout(() => setFadingOut(true), 1500);
    const goAt = setTimeout(() => navigate('/home', { replace: true }), 1900);
    return () => { clearTimeout(fadeAt); clearTimeout(goAt); };
  }, [navigate]);

  return <LoadingScreen fadingOut={fadingOut} />;
}
