
'use server';

import { promises as fs } from 'fs';
import path from 'path';

// --- API Configuration ---
const EVENT_API_URL = 'https://www.sajfoods.net/api/event/event.php';

// Helper to get file paths
const getDataPath = (fileName: string) => path.join(process.cwd(), 'data', fileName);
const POSTS_PATH = getDataPath('posts.json');
const COMMENTS_PATH = getDataPath('comments.json');


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
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    if (result.success === false) { // Check for explicit false
      throw new Error(result.error || 'API returned an error.');
    }
    
    return result.data;
  } catch (error: any) {
    console.error('API Fetch Error:', error);
    throw new Error(error.message || 'An unknown network error occurred.');
  }
}

// --- Generic File I/O Functions ---
async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch (error: any) {
    if (error.code === 'ENOENT') return []; // Return empty array if file doesn't exist
    console.error(`Error reading from ${filePath}:`, error);
    throw new Error(`Could not read data from ${filePath}.`);
  }
}

async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    throw new Error(`Could not save data to ${filePath}.`);
  }
}

// --- Registration and Showcase Actions (Unchanged) ---

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


// --- New Blog Post Actions (using JSON files) ---

const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').trim();
}

export async function createPost(formData: any) {
  try {
    const posts = await getPosts();
    const newPost = {
      ...formData,
      id: Date.now().toString(),
      slug: generateSlug(formData.title),
      date: new Date().toISOString(),
      view_count: 0,
      tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()) : [],
    };
    const updatedPosts = [newPost, ...posts.data];
    await writeJsonFile(POSTS_PATH, updatedPosts);
    return { success: true, data: newPost, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function getPosts() {
  try {
    const data = await readJsonFile<any>(POSTS_PATH);
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { success: true, data: sortedData, error: null };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const posts = await getPosts();
    const post = posts.data.find(p => p.slug === slug);
    if (post) {
      return { success: true, data: post, error: null };
    }
    return { success: false, data: null, error: 'Post not found.' };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function deletePost(id: string) {
  try {
    let posts = await getPosts();
    const updatedPosts = posts.data.filter(p => p.id !== id);
    await writeJsonFile(POSTS_PATH, updatedPosts);
    // Also delete associated comments
    let comments = await getComments(id);
    const updatedComments = comments.data.filter(c => c.postId !== id);
    await writeJsonFile(COMMENTS_PATH, updatedComments);

    return { success: true, data: { id }, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function incrementViewCount(postId: string) {
  try {
    let posts = await getPosts();
    let postUpdated = false;
    const updatedPosts = posts.data.map(p => {
      if (p.id === postId) {
        p.view_count = (p.view_count || 0) + 1;
        postUpdated = true;
      }
      return p;
    });
    if (postUpdated) {
      await writeJsonFile(POSTS_PATH, updatedPosts);
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to increment view count:', error);
    return { success: false };
  }
}

export async function getComments(postId: string) {
  try {
    const allComments = await readJsonFile<any>(COMMENTS_PATH);
    const postComments = allComments.filter(c => c.postId === postId)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return { success: true, data: postComments, error: null };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function createComment(commentData: { postId: string; authorName: string; comment: string }) {
  try {
    const allComments = await readJsonFile<any>(COMMENTS_PATH);
    const newComment = {
      id: `comment-${Date.now()}`,
      postId: commentData.postId,
      authorName: commentData.authorName,
      comment: commentData.comment,
      submittedAt: new Date().toISOString(),
    };
    const updatedComments = [newComment, ...allComments];
    await writeJsonFile(COMMENTS_PATH, updatedComments);
    return { success: true, data: newComment, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}
