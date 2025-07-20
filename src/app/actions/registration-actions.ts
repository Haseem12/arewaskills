
'use server';

import { promises as fs } from 'fs';
import path from 'path';

// --- API Configuration ---
const EVENT_API_URL = 'https://www.sajfoods.net/api/event/event.php';
const BLOG_API_URL = 'https://www.sajfoods.net/api/event/blog.php';

// Helper to get file paths
const getDataPath = (fileName: string) => path.join(process.cwd(), 'data', fileName);

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
        // Try to parse the error response from the API
        const errorBody = await response.json();
        errorMessage = errorBody.error || `HTTP error! status: ${response.status}`;
      } catch (e) {
        // If the response isn't JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    if (result.success === false) { // Check for explicit false
      throw new Error(result.error || 'The API returned an unspecified error.');
    }
    
    return result.data;
  } catch (error: any) {
    console.error(`API Fetch Error to ${url}:`, error);
    throw new Error(error.message || 'An unknown network error occurred.');
  }
}


// --- Registration and Showcase Actions (Unchanged from original) ---

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


// --- Blog Post Actions (using blog.php) ---

export async function createPost(formData: any) {
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
    return { success: true, data: data || [], error: null };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const params = new URLSearchParams({ action: 'get_post_by_slug', slug });
    const data = await apiFetch(BLOG_API_URL, params);
    if (data) {
      return { success: true, data, error: null };
    }
    return { success: false, data: null, error: 'Post not found.' };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function deletePost(id: string) {
  try {
    const params = new URLSearchParams({ action: 'delete_post' });
    const data = await apiFetch(BLOG_API_URL, params, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: id }),
    });
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}
