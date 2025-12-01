import { useEffect } from 'react';

const usePageTitle = (defaultTitle = 'CacharreriaGasPOS') => {
  useEffect(() => {
    const updatePageTitle = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          document.title = defaultTitle;
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
          const company = await response.json();
          if (company.name) {
            document.title = `${company.name} | POS`;
          } else {
            document.title = defaultTitle;
          }
        } else {
          document.title = defaultTitle;
        }
      } catch (error) {
        console.error('Error obteniendo nombre de empresa:', error);
        document.title = defaultTitle;
      }
    };

    updatePageTitle();

    // Actualizar cada 5 minutos por si cambia el nombre
    const interval = setInterval(updatePageTitle, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [defaultTitle]);
};

export default usePageTitle;
