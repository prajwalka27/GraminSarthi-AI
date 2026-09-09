export type ApiError = { success: false; message?: string; error?: string | { message?: string } }

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export async function apiRequest<T>(input: string, init?: RequestInit): Promise<T> {
    let response: Response
    const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('graminsarthi.token') || localStorage.getItem('graminsarthi.token'))
        : null

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers as Record<string, string> || {}),
    }

    try {
        response = await fetch(`${API_BASE_URL}${input.startsWith('/') ? input : `/${input}`}`, {
            ...init,
            credentials: init?.credentials || 'include',
            headers,
        })
    } catch {
        throw new Error('Backend is offline or unreachable. Please ensure the backend is running on http://localhost:5000.')
    }

    const body = await response.json().catch(() => null)
    if (!response.ok || (body && body.success === false)) {
        const error = (body as ApiError | null)?.error
        const message =
            (typeof error === 'string' ? error : error?.message) ||
            (body as ApiError | null)?.message ||
            `Request failed with status ${response.status}`
        throw new Error(message)
    }
    return body as T
}

