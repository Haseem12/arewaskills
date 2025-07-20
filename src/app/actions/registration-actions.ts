
'use server';

// --- API Configuration ---
const EVENT_API_URL = 'https://www.sajfoods.net/api/event/event.php';
const BLOG_API_URL = 'https://www.sajfoods.net/api/event/blog.php';

async function apiFetch(baseUrl: string, params: URLSearchParams, options: RequestInit = {}) {
  const url = `${baseUrl}?${params.toString()}`;
  try {
    const response = await fetch(url, {
      next: { revalidate: 0 }, // No caching
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use the status text.
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'API returned an error.');
    }
    
    return result.data;
  } catch (error: any) {
    console.error('API Fetch Error:', error);
    throw new Error(error.message || 'An unknown network error occurred.');
  }
}

// --- Registration and Showcase Actions ---

export async function saveRegistration(formData: Record<string, any>) {
  try {
    const params = new URLSearchParams({ action: 'create' });
    const data = await apiFetch(EVENT_API_URL, params, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'registration', ...formData }),
    });
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function saveShowcase(formData: Record<string, any>) {
  try {
    const params = new URLSearchParams({ action: 'create' });
    const data = await apiFetch(EVENT_API_URL, params, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'showcase', ...formData }),
    });
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}


export async function getRegistrations() {
  try {
    const params = new URLSearchParams({ action: 'get_all', type: 'registrations' });
    const data = await apiFetch(EVENT_API_URL, params);
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}


export async function getShowcases() {
  try {
    const params = new URLSearchParams({ action: 'get_all', type: 'showcases' });
    const data = await apiFetch(EVENT_API_URL, params);
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function findSubmissionById(id: string) {
  try {
    // This needs to check both endpoints if the type isn't known
    const params = new URLSearchParams({ action: 'find_by_id', id });
    const data = await apiFetch(EVENT_API_URL, params);
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: 'Submission not found.' };
  }
}

export async function findSubmissionByEmail(email: string) {
  try {
    const params = new URLSearchParams({ action: 'find_by_email', email });
    const data = await apiFetch(EVENT_API_URL, params);
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: 'Submission not found with that email.' };
  }
}

export async function updateSubmissionStatus(id: string, status: string, details?: Record<string, any>) {
  try {
    const params = new URLSearchParams({ action: 'update_status' });
    const data = await apiFetch(EVENT_API_URL, params, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { ...details, status } }),
    });
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}


export async function markSubmissionsAsPending(ids: string[]) {
  if (!ids || ids.length === 0) {
    return { success: true, data: { updatedIds: [] }, error: null };
  }
  try {
    const params = new URLSearchParams({ action: 'mark_pending' });
    const data = await apiFetch(EVENT_API_URL, params, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
    });
    return { success: true, data, error: null };
  } catch (error: any) {
     return { success: false, data: null, error: error.message };
  }
}

// --- Blog Post Actions ---

export async function createPost(formData: Omit<any, 'slug' | 'date'>) {
  try {
    const params = new URLSearchParams({ action: 'create_post' });
    const data = await apiFetch(BLOG_API_URL, params, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function getPosts() {
  try {
    const params = new URLSearchParams({ action: 'get_posts' });
    const data = await apiFetch(BLOG_API_URL, params);
    const formattedData = data.map((post: any) => ({
        ...post,
        tags: typeof post.tags === 'string' && post.tags ? post.tags.split(',').map((t: string) => t.trim()) : [],
    }));
    return { success: true, data: formattedData, error: null };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const params = new URLSearchParams({ action: 'get_post_by_slug', slug });
    const data = await apiFetch(BLOG_API_URL, params);
    const formattedData = {
        ...data,
        tags: typeof data.tags === 'string' && data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
    }
    return { success: true, data: formattedData, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: 'Post not found.' };
  }
}
