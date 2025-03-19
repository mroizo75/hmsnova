/**
 * Logger-tjeneste for strukturert logging og feilhåndtering
 * Denne enkle implementasjonen kan senere utvides med integrasjon mot eksterne tjenester
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  data?: Record<string, any>;
  error?: Error;
}

// Miljøvariabel for å kontrollere loggnivå
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Prioritet for hvert loggnivå
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Sjekk om et gitt loggnivå skal logges basert på konfigurert nivå
const shouldLog = (level: LogLevel): boolean => {
  const configuredPriority = LOG_LEVEL_PRIORITY[LOG_LEVEL as LogLevel] || 1;
  const messagePriority = LOG_LEVEL_PRIORITY[level];
  return messagePriority >= configuredPriority;
};

// Formater loggmeldingen
const formatLogMessage = (
  level: LogLevel,
  message: string,
  options?: LogOptions
): Record<string, any> => {
  const timestamp = new Date().toISOString();
  const context = options?.context || 'app';
  
  const logEntry: Record<string, any> = {
    timestamp,
    level,
    context,
    message
  };

  // Legg til ekstra data hvis tilgjengelig
  if (options?.data) {
    logEntry.data = options.data;
  }

  // Legg til feilinformasjon hvis tilgjengelig
  if (options?.error) {
    logEntry.error = {
      name: options.error.name,
      message: options.error.message,
      stack: options.error.stack
    };
  }

  return logEntry;
};

// Logger-funksjoner
export const logger = {
  debug: (message: string, options?: LogOptions) => {
    if (shouldLog('debug')) {
      const logEntry = formatLogMessage('debug', message, options);
      console.debug(JSON.stringify(logEntry));
    }
  },

  info: (message: string, options?: LogOptions) => {
    if (shouldLog('info')) {
      const logEntry = formatLogMessage('info', message, options);
      console.info(JSON.stringify(logEntry));
    }
  },

  warn: (message: string, options?: LogOptions) => {
    if (shouldLog('warn')) {
      const logEntry = formatLogMessage('warn', message, options);
      console.warn(JSON.stringify(logEntry));
    }
  },

  error: (message: string, options?: LogOptions) => {
    if (shouldLog('error')) {
      const logEntry = formatLogMessage('error', message, options);
      console.error(JSON.stringify(logEntry));
    }
  }
};

export default logger; 