import { NextResponse } from 'next/server'

export function jsonError(error: string, status: number) {
    return NextResponse.json({ success: false, error }, { status })
}

export function serverError() {
    return jsonError('Something went wrong. Please try again.', 500)
}
