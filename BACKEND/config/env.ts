import 'dotenv/config'

function required(name: string): string {
    const value = process.env[name]?.trim()
    if (!value) throw new Error(`${name} is required`)
    return value
}

export const env = {
    port: Number(process.env.PORT || 5000),
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    jwtSecret: required('JWT_SECRET'),
    devOtp: process.env.DEV_OTP,
}

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
    throw new Error('PORT must be a valid TCP port')
}