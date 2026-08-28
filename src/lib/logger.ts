type Level = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: Level;
  message: string;
  [key: string]: unknown;
}

function log(level: Level, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = { timestamp: new Date().toISOString(), level, message, ...data };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (msg: string, data?: Record<string, unknown>) => log("debug", msg, data),
  info: (msg: string, data?: Record<string, unknown>) => log("info", msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => log("warn", msg, data),
  error: (msg: string, data?: Record<string, unknown>) => log("error", msg, data),

  /** Consume an error with context — always logs the full error object. */
  catch: (msg: string, err: unknown, data?: Record<string, unknown>) => {
    const error =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : { raw: String(err) };
    log("error", msg, { ...data, error });
  },
};
