import { useState, useEffect } from 'react';

const useCompany = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/company`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCompany(data);
        } else {
          setError('Error cargando datos de empresa');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCompany();

    // Actualizar cada 5 minutos por si cambian los datos
    const interval = setInterval(loadCompany, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { company, loading, error };
};

export default useCompany;
