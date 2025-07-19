
'use server';

import fs from 'fs/promises';
import path from 'path';

// --- File Paths ---
const registrationsPath = path.join(process.cwd(), 'data/registrations.json');
const showcasesPath = path.join(process.cwd(), 'data/showcases.json');
const postsPath = path.join(process.cwd(), 'data/posts.json');

// --- Helper Functions ---
async function readData(filePath: string) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    console.error(`Error reading data from ${filePath}:`, error);
    throw new Error('Could not read data.');
  }
}

async function writeData(filePath: string, data: any) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing data to ${filePath}:`, error);
    throw new Error('Could not write data.');
  }
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

// --- Registration and Showcase Actions ---

export async function saveRegistration(formData: Record<string, any>) {
  try {
    const registrations = await readData(registrationsPath);
    const newRegistration = {
      ...formData,
      id: new Date().getTime().toString(),
      submittedAt: new Date().toISOString(),
      type: 'registration',
    };
    registrations.unshift(newRegistration);
    await writeData(registrationsPath, registrations);
    return { success: true, data: newRegistration, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function getRegistrations() {
  try {
    const data = await readData(registrationsPath);
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function saveShowcase(formData: Record<string, any>) {
  try {
    const showcases = await readData(showcasesPath);
    const newShowcase = {
      ...formData,
      id: new Date().getTime().toString(),
      submittedAt: new Date().toISOString(),
      type: 'showcase',
    };
    showcases.unshift(newShowcase);
    await writeData(showcasesPath, showcases);
    return { success: true, data: newShowcase, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function getShowcases() {
  try {
    const data = await readData(showcasesPath);
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function findSubmissionById(id: string) {
  try {
    const registrations = await readData(registrationsPath);
    const showcases = await readData(showcasesPath);
    const allSubmissions = [...registrations, ...showcases];
    const submission = allSubmissions.find(s => s.id === id);
    if (submission) {
      return { success: true, data: submission, error: null };
    }
    return { success: false, data: null, error: 'Submission not found.' };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function findSubmissionByEmail(email: string) {
  try {
    const registrations = await readData(registrationsPath);
    const showcases = await readData(showcasesPath);
    const lowercasedEmail = email.toLowerCase();
    
    let submission = registrations.find(s => s.email.toLowerCase() === lowercasedEmail);
    if (submission) return { success: true, data: submission, error: null };

    submission = showcases.find(s => s.presenterEmail.toLowerCase() === lowercasedEmail);
    if (submission) return { success: true, data: submission, error: null };

    return { success: false, data: null, error: 'Submission not found with that email.' };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function updateSubmissionStatus(id: string, status: string, details?: Record<string, any>) {
  try {
    const regResult = await findAndUpdate(registrationsPath, id, { ...details, status });
    if (regResult.found) {
      return { success: true, data: { id, ...details, status }, error: null };
    }

    const showcaseResult = await findAndUpdate(showcasesPath, id, { ...details, status });
    if (showcaseResult.found) {
        return { success: true, data: { id, ...details, status }, error: null };
    }
    
    return { success: false, data: null, error: 'Submission not found to update.' };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

async function findAndUpdate(filePath: string, id: string, updates: Record<string, any>) {
    const items = await readData(filePath);
    let found = false;
    const updatedItems = items.map((item: {id: string}) => {
        if (item.id === id) {
            found = true;
            return { ...item, ...updates };
        }
        return item;
    });

    if (found) {
        await writeData(filePath, updatedItems);
    }
    return { found };
}


export async function markSubmissionsAsPending(ids: string[]) {
  if (!ids || ids.length === 0) {
    return { success: true, data: { updatedIds: [] }, error: null };
  }
  
  let updatedCount = 0;
  try {
    const registrations = await readData(registrationsPath);
    const updatedRegistrations = registrations.map((r: any) => {
        if(ids.includes(r.id)) {
            r.status = 'payment_pending';
            updatedCount++;
        }
        return r;
    });
    await writeData(registrationsPath, updatedRegistrations);

    const showcases = await readData(showcasesPath);
    const updatedShowcases = showcases.map((s: any) => {
        if(ids.includes(s.id)) {
            s.status = 'payment_pending';
            updatedCount++;
        }
        return s;
    });
    await writeData(showcasesPath, updatedShowcases);

    return { success: true, data: { updatedCount, requestedIds: ids }, error: null };
  } catch(error: any) {
     return { success: false, data: null, error: error.message };
  }
}

// --- Blog Post Actions ---

export async function createPost(formData: Omit<any, 'slug' | 'date'>) {
  try {
    const posts = await readData(postsPath);
    const newPost = {
      ...formData,
      slug: generateSlug(formData.title),
      date: new Date().toISOString(),
      tags: formData.tags.split(',').map((t: string) => t.trim()),
    };
    posts.unshift(newPost);
    await writeData(postsPath, posts);
    return { success: true, data: newPost, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function getPosts() {
  try {
    const data = await readData(postsPath);
    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const posts = await readData(postsPath);
    const post = posts.find((p: any) => p.slug === slug);
    if (post) {
      return { success: true, data: post, error: null };
    }
    return { success: false, data: null, error: 'Post not found.' };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}
