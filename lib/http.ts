export async function readPayload(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get('content-type') ?? ''
  if (type.includes('application/json')) {
    const body: unknown = await request.json().catch(() => ({}))
    return body && typeof body === 'object' ? (body as Record<string, string>) : {}
  }
  const form = await request.formData()
  return Object.fromEntries(
    Array.from(form.entries()).map(([key, value]) => [key, typeof value === 'string' ? value : '']),
  )
}
