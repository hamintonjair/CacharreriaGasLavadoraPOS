/**
 * Utilidades de manejo de fechas para Frontend
 * Convierte fechas UTC/ISO del Backend a zona horaria de Colombia (UTC-5)
 */

/**
 * Normaliza fecha de Supabase para interpretarla correctamente como UTC
 * @param {string|Date} dateString - Fecha en cualquier formato
 * @returns {Date} - Objeto Date correctamente parseado
 */
const normalizeDateFromSupabase = (dateString) => {
  if (!dateString) return null;
  
  // Si ya es un objeto Date, retornarlo
  if (dateString instanceof Date) {
    return dateString;
  }
  
  let normalizedString = dateString.trim();
  
  // Si la fecha NO tiene indicador de zona horaria (Z, +, -), asumimos que es UTC
  // Formato Supabase: "2025-12-04 20:20:29.234" o "2025-12-04T20:20:29.234"
  const hasTimezone = normalizedString.endsWith('Z') || 
                      normalizedString.includes('+') || 
                      normalizedString.match(/-\d{2}:\d{2}$/);
  
  if (!hasTimezone) {
    // Reemplazar espacio por 'T' si existe
    normalizedString = normalizedString.replace(' ', 'T');
    
    // Agregar 'Z' para indicar que es UTC
    if (!normalizedString.endsWith('Z')) {
      normalizedString += 'Z';
    }
  }
  
  return new Date(normalizedString);
};

/**
 * Convierte fecha ISO/UTC a formato de Colombia (America/Bogota)
 * @param {string|Date} dateString - Fecha en formato ISO o Date object
 * @param {Object} options - Opciones de formateo adicionales
 * @returns {string} - Fecha formateada para Colombia
 */
export const formatDateToColombia = (dateString, options = {}) => {
  if (!dateString) return '';
  
  try {
    // Normalizar fecha desde Supabase
    const date = normalizeDateFromSupabase(dateString);
    
    // Validar que la fecha sea válida
    if (!date || isNaN(date.getTime())) {
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
    const date = normalizeDateFromSupabase(dateString);
    
    if (!date || isNaN(date.getTime())) {
      console.warn('Fecha inválida para input:', dateString);
      return '';
    }
    
    // Obtener fecha en zona horaria de Colombia
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const dateParts = {};
    
    parts.forEach(({ type, value }) => {
      dateParts[type] = value;
    });
    
    // Formato: YYYY-MM-DDTHH:mm
    return `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}`;
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
    const target = normalizeDateFromSupabase(targetDate);
    
    if (!target || isNaN(target.getTime())) return null;
    
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
    const date = normalizeDateFromSupabase(dateString);
    
    if (!date || isNaN(date.getTime())) return '';
    
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
  
  try {
    const date = normalizeDateFromSupabase(dateString);
    return date && !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Obtiene fecha actual en formato ISO para enviar al backend
 * @returns {string} - Fecha actual en formato ISO (UTC)
 */
export const getCurrentDateISO = () => {
  return new Date().toISOString();
};

/**
 * Convierte fecha de input datetime-local (hora local Colombia) a UTC para Supabase
 * IMPORTANTE: El input datetime-local NO tiene zona horaria, representa la hora LOCAL
 * del navegador. Debemos convertirla a UTC correctamente.
 * 
 * @param {string} inputDate - Fecha en formato YYYY-MM-DDTHH:mm (hora LOCAL del navegador)
 * @returns {string} - Fecha en formato ISO UTC para guardar en Supabase
 */
export const inputDateToISO = (inputDate) => {
  if (!inputDate) return '';
  
  try {
    // CLAVE: datetime-local NO tiene zona horaria, es hora LOCAL del navegador
    // Si el usuario está en Colombia y pone "08:00", el navegador lo interpreta como 08:00 Colombia
    
    // Opción 1: Si el usuario siempre está en Colombia (más confiable)
    // Parseamos manualmente y sumamos 5 horas para convertir a UTC
    const [datePart, timePart] = inputDate.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    
    // Crear fecha en UTC sumando 5 horas (Colombia = UTC-5)
    const colombiaHour = parseInt(hour);
    const utcHour = colombiaHour + 5; // Colombia UTC-5, entonces sumamos 5 para obtener UTC
    
    const utcDate = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      utcHour,
      parseInt(minute),
      0,
      0
    ));
    
    return utcDate.toISOString();
    
    // Opción 2: Usar el timezone del navegador (menos confiable si el usuario viaja)
    // const localDate = new Date(inputDate);
    // return localDate.toISOString();
    
  } catch (error) {
    console.error('Error convirtiendo input date a ISO:', error);
    return '';
  }
};

/**
 * Obtiene la fecha/hora actual en zona horaria de Colombia
 * Útil para inputs datetime-local que necesitan valor predeterminado
 * @returns {string} - Fecha actual en formato YYYY-MM-DDTHH:mm (hora Colombia)
 */
export const getCurrentColombiaDateTime = () => {
  const now = new Date();
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const dateParts = {};
  
  parts.forEach(({ type, value }) => {
    dateParts[type] = value;
  });
  
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}`;
};

/**
 * DEBUG: Muestra información detallada de conversión de fecha
 * Útil para debugging de problemas de zona horaria
 */
export const debugDate = (dateString, label = '') => {
  console.group(`🔍 Debug Fecha: ${label}`);
  console.log('Input original:', dateString);
  
  const normalized = normalizeDateFromSupabase(dateString);
  console.log('Normalizada (Date objeto):', normalized);
  console.log('ISO String (UTC):', normalized?.toISOString());
  console.log('Hora UTC:', normalized?.toUTCString());
  console.log('Hora Colombia:', formatDateToColombia(dateString));
  console.log('Para input:', formatDateForInput(dateString));
  
  console.groupEnd();
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
  inputDateToISO,
  getCurrentColombiaDateTime,
  debugDate
};