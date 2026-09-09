type Details = Record<string, unknown>

function write(level: string, message: string, details?: Details) {
  const safeDetails = details ? { ...details } : undefined
  if (safeDetails) {
    delete safeDetails.otp
    delete safeDetails.token
    delete safeDetails.password
    delete safeDetails.apiKey
  }
  console.log(JSON.stringify({ time: new Date().toISOString(), level, message, ...safeDetails }))
}

export const logger = {
  info: (message: string, details?: Details) => write('info', message, details),
  error: (message: string, details?: Details) => write('error', message, details),
}