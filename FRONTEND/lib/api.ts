export type ApiError = { success: false; error: string }

export async function apiRequest<T>(input: string, init?: RequestInit): Promise<T> {
    const response = await fetch(input, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
    const body = await response.json().catch(() => ({ success: false, error: 'Invalid server response' }))
    if (!response.ok) throw new Error((body as ApiError).error || 'Request failed')
    return body as T
}
