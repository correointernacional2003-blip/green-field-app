import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFarmId } from '@/lib/auth';

export const useFarmId = () => {
  const navigate = useNavigate();
  const [farmId, setFarmId] = useState<number | null>(null);

  useEffect(() => {
    const id = getFarmId();
    if (!id) {
      navigate('/auth');
    } else {
      setFarmId(id);
    }
  }, [navigate]);

  return farmId;
};
