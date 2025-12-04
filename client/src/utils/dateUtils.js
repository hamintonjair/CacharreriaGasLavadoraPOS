/**
 * Utilidades de manejo de fechas para Frontend
 * Convierte fechas UTC/ISO del Backend a zona horaria de Colombia (UTC-5)
 */

/**
 * Convierte fecha ISO/UTC a formato de Colombia (America/Bogota)
 * @param {string|Date} dateString - Fecha en formato ISO o Date object
 * @param {Object} options - Opciones de formateo adicionales
 * @returns {string} - Fecha formateada para Colombia
 */
export const formatDateToColombia = (dateString, options = {}) => {
  if (!dateString) return '';
  
  try {
    // Crear fecha desde string sin forzar UTC (ya viene en UTC desde BD)
    const date = new Date(dateString);
    
    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida:', dateString);
      return '';
    }
    
    // Configuración por defecto para Colombia
    const defaultOptions = {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Formato 24 horas
      ...options
    };
    
    const formatted = date.toLocaleString('es-CO', defaultOptions);
    
    return formatted;
  } catch (error) {
    console.error('Error formateando fecha:', error, dateString);
    return '';
  }
};

/**
 * Convierte fecha a formato corto (solo fecha, sin hora)
 * @param {string|Date} dateString - Fecha en formato ISO
 * @returns {string} - Fecha formateada DD/MM/YYYY
 */
export const formatDateToColombiaShort = (dateString) => {
  return formatDateToColombia(dateString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: undefined,
    minute: undefined,
    second: undefined
  });
};

/**
 * Convierte fecha a formato con hora (sin segundos)
 * @param {string|Date} dateString - Fecha en formato ISO
 * @returns {string} - Fecha formateada DD/MM/YYYY HH:mm
 */
export const formatDateToColombiaTime = (dateString) => {
  return formatDateToColombia(dateString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: undefined
  });
};

/**
 * Formatea fecha para input datetime-local
 * @param {string|Date} dateString - Fecha en formato ISO
 * @returns {string} - Fecha en formato YYYY-MM-DDTHH:mm
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // Convertir a zona horaria de Colombia
    const colombiaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    
    const year = colombiaDate.getFullYear();
    const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
    const day = String(colombiaDate.getDate()).padStart(2, '0');
    const hours = String(colombiaDate.getHours()).padStart(2, '0');
    const minutes = String(colombiaDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formateando fecha para input:', error);
    return '';
  }
};

/**
 * Calcula tiempo restante hasta una fecha
 * @param {string|Date} targetDate - Fecha objetivo
 * @returns {Object} - Objeto con tiempo restante
 */
export const getTimeRemaining = (targetDate) => {
  if (!targetDate) return null;
  
  try {
    const now = new Date();
    const target = new Date(targetDate);
    
    if (isNaN(target.getTime())) return null;
    
    const diff = target - now;
    
    if (diff <= 0) {
      return {
        expired: true,
        days: 0,
        hours: 0,
        minutes: 0,
        text: 'Vencido'
      };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let text = '';
    if (days > 0) text += `${days}d `;
    if (hours > 0) text += `${hours}h `;
    if (minutes > 0 || (days === 0 && hours === 0)) text += `${minutes}m`;
    
    return {
      expired: false,
      days,
      hours,
      minutes,
      text: text.trim()
    };
  } catch (error) {
    console.error('Error calculando tiempo restante:', error);
    return null;
  }
};

/**
 * Formatea fecha relativa (hace X tiempo, en X tiempo)
 * @param {string|Date} dateString - Fecha en formato ISO
 * @returns {string} - Fecha relativa formateada
 */
export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Ahora';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return formatDateToColombiaShort(dateString);
  } catch (error) {
    console.error('Error formateando fecha relativa:', error);
    return formatDateToColombiaShort(dateString);
  }
};

/**
 * Valida si una fecha es válida
 * @param {string|Date} dateString - Fecha a validar
 * @returns {boolean} - True si es válida
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Obtiene fecha actual en formato ISO para enviar al backend
 * @returns {string} - Fecha actual en formato ISO
 */
export const getCurrentDateISO = () => {
  return new Date().toISOString();
};

/**
 * Convierte fecha de input datetime-local a ISO para backend
 * @param {string} inputDate - Fecha en formato YYYY-MM-DDTHH:mm
 * @returns {string} - Fecha en formato ISO
 */
export const inputDateToISO = (inputDate) => {
  if (!inputDate) return '';
  
  try {
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString();
  } catch (error) {
    console.error('Error convirtiendo input date a ISO:', error);
    return '';
  }
};

export default {
  formatDateToColombia,
  formatDateToColombiaShort,
  formatDateToColombiaTime,
  formatDateForInput,
  getTimeRemaining,
  formatRelativeDate,
  isValidDate,
  getCurrentDateISO,
  inputDateToISO
};
