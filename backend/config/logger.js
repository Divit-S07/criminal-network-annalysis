// config/logger.js
const levelMap = { debug: 10, info: 20, warn: 30, error: 40 };
let currentLevel = levelMap.info;

export function setLogLevel(lvl) {
  currentLevel = levelMap[lvl] ?? levelMap.info;
}

function log(level, msg, meta = {}) {
  if (levelMap[level] >= currentLevel) {
    const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...meta });
    if (level === 'error' || level === 'warn') console.error(line);
    else console.log(line);
  }
}

export const logger = {
  debug: (msg, meta) => log('debug', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
};
