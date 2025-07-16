
'use server';

// The base URL for your custom PHP API
const API_BASE_URL = 'https://sajfoods.net/api/event/event.php';

// Helper function to handle API responses
async function handleApiResponse(response: Response) {
    if (!response.ok) {
        let errorBody;
        try {
            errorBody = await response.json();
        } catch (e) {
            errorBody = { message: 'An unknown error occurred.' };
        }
        console.error('API Error:', response.status, errorBody);
        const errorMessage = errorBody?.error || `Request failed with status ${response.status}`;
        return { success: false, error: errorMessage, data: null };
    }
    try {
        const data = await response.json();
        if (data.success === false) {
             console.error('API Logic Error:', data.error);
             return { success: false, error: data.error, data: null };
        }
        return { success: true, data: data.data, error: null }; // Assuming your API wraps data in a 'data' property
    } catch (error) {
         console.error('API JSON Parse Error:', error);
        return { success: false, error: 'Failed to parse server response.', data: null };
    }
}


export async function saveRegistration(formData: Record<string, any>) {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });
    return handleApiResponse(response);
  } catch (error: any) {
    console.error('Error saving registration:', error);
    return { success: false, error: 'Could not connect to the server.' };
  }
}

export async function getRegistrations() {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations`, { cache: 'no-store' });
    const result = await handleApiResponse(response);
    return { ...result, data: result.data || [] };
  } catch (error: any) {
    console.error('Error getting registrations:', error);
    return { success: false, error: 'Could not connect to the server.', data: [] };
  }
}

export async function saveShowcase(formData: Record<string, any>) {
    try {
        const response = await fetch(`${API_BASE_URL}/showcases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        return handleApiResponse(response);
    } catch (error: any) {
        console.error('Error saving showcase:', error);
        return { success: false, error: 'Could not connect to the server.' };
    }
}

export async function getShowcases() {
    try {
        const response = await fetch(`${API_BASE_URL}/showcases`, { cache: 'no-store' });
        const result = await handleApiResponse(response);
        return { ...result, data: result.data || [] };
    } catch (error: any) {
        console.error('Error getting showcases:', error);
        return { success: false, error: 'Could not connect to the server.', data: [] };
    }
}

export async function updateSubmissionStatus(id: string, status: 'payment_pending' | 'awaiting_confirmation' | 'paid', details?: Record<string, any>) {
    try {
        const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, ...details }),
        });
        return handleApiResponse(response);
    } catch (error: any) {
        console.error('Error updating submission status:', error);
        return { success: false, error: 'Could not update submission status.' };
    }
}

export async function markSubmissionsAsPending(ids: string[]) {
    try {
        const response = await fetch(`${API_BASE_URL}/submissions/mark-pending`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });
        return handleApiResponse(response);
    } catch (error: any) {
        console.error('Error marking submissions as pending:', error);
        return { success: false, error: 'Could not update submissions.' };
    }
}

export async function findSubmissionByEmail(email: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/submissions/find?email=${encodeURIComponent(email.toLowerCase())}`, { cache: 'no-store' });
        return await handleApiResponse(response);
    } catch(error: any) {
        console.error('Error finding submission by email:', error);
        return { success: false, error: 'Database query failed.', data: null };
    }
}

export async function findSubmissionById(id: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/submissions/${id}`, { cache: 'no-store' });
        return await handleApiResponse(response);
    } catch (error: any) {
        console.error('Error finding submission by ID:', error);
        return { success: false, error: 'Database query failed.', data: null };
    }
}
