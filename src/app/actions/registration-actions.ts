
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

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      cache: 'no-store', // Ensure fresh data
    });
    return handleApiResponse(response);
  } catch (error: any) {
    console.error(`API fetch error for endpoint ${endpoint}:`, error);
    return { success: false, error: 'Network error or API is unreachable.', data: null };
  }
}


export async function saveRegistration(formData: Record<string, any>) {
  return apiFetch('/registrations', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

export async function getRegistrations() {
  return apiFetch('/registrations');
}

export async function saveShowcase(formData: Record<string, any>) {
  return apiFetch('/showcases', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

export async function getShowcases() {
  return apiFetch('/showcases');
}

export async function findSubmissionById(id: string) {
  return apiFetch(`/submissions/${id}`);
}

export async function findSubmissionByEmail(email: string) {
  // The email is passed as a query parameter for this specific endpoint
  return apiFetch(`/submissions/find?email=${encodeURIComponent(email)}`);
}

export async function updateSubmissionStatus(id: string, status: 'payment_pending' | 'awaiting_confirmation' | 'paid', details?: Record<string, any>) {
  const body = { ...details, status };
  return apiFetch(`/submissions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function markSubmissionsAsPending(ids: string[]) {
  if (!ids || ids.length === 0) {
    return { success: true, data: { updatedIds: [] }, error: null };
  }
  return apiFetch('/submissions/mark-pending', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}
