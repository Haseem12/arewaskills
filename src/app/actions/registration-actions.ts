
'use server';

// NOTE: Ensure this base URL is correct for your deployed PHP script.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sajfoods.net/api/event/event.php';

async function handleApiResponse(response: Response) {
  if (!response.ok) {
    // Try to parse error from PHP
    try {
      const errorBody = await response.json();
      if (errorBody && errorBody.error) {
        return { success: false, error: errorBody.error, data: null };
      }
    } catch (e) {
      // Fallback error
      return { success: false, error: `API request failed with status ${response.status}`, data: null };
    }
  }
  
  try {
    const result = await response.json();
    // The PHP script returns { success: true, data: ... }
    if (result.success) {
      return { success: true, data: result.data, error: null };
    } else {
      return { success: false, error: result.error || 'An unknown API error occurred.', data: null };
    }
  } catch (error: any) {
    return { success: false, error: 'Failed to parse API response.', data: null };
  }
}

async function apiFetch(options: RequestInit = {}, queryParams: Record<string, string> = {}) {
  const url = new URL(API_BASE_URL);
  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.append(key, value);
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      cache: 'no-store', // Ensure fresh data
    });
    return handleApiResponse(response);
  } catch (error: any) {
    console.error(`API fetch error for ${url.toString()}:`, error);
    return { success: false, error: 'Network error or API is unreachable.', data: null };
  }
}

export async function saveRegistration(formData: Record<string, any>) {
  return apiFetch({
    method: 'POST',
    body: JSON.stringify({ type: 'registration', ...formData }),
  }, { action: 'create' });
}

export async function getRegistrations() {
  return apiFetch({ method: 'GET' }, { action: 'get_all', type: 'registrations' });
}

export async function saveShowcase(formData: Record<string, any>) {
  return apiFetch({
    method: 'POST',
    body: JSON.stringify({ type: 'showcase', ...formData }),
  }, { action: 'create' });
}

export async function getShowcases() {
  return apiFetch({ method: 'GET' }, { action: 'get_all', type: 'showcases' });
}

export async function findSubmissionById(id: string) {
  return apiFetch({ method: 'GET' }, { action: 'find_by_id', id });
}

export async function findSubmissionByEmail(email: string) {
  return apiFetch({ method: 'GET' }, { action: 'find_by_email', email });
}

export async function updateSubmissionStatus(id: string, status: 'payment_pending' | 'awaiting_confirmation' | 'paid', details?: Record<string, any>) {
  const body = { id, updates: { ...details, status } };
  return apiFetch({
    method: 'POST', // Using POST for update to simplify PHP
    body: JSON.stringify(body),
  }, { action: 'update_status' });
}

export async function markSubmissionsAsPending(ids: string[]) {
  if (!ids || ids.length === 0) {
    return { success: true, data: { updatedIds: [] }, error: null };
  }
  return apiFetch({
    method: 'POST',
    body: JSON.stringify({ ids }),
  }, { action: 'mark_pending' });
}
