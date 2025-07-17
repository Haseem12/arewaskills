
'use server';

import fs from 'fs/promises';
import path from 'path';

type Submission = Record<string, any>;

const registrationsPath = path.resolve(process.cwd(), 'data/registrations.json');
const showcasesPath = path.resolve(process.cwd(), 'data/showcases.json');

async function readData(filePath: string): Promise<Submission[]> {
    try {
        const fileData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileData);
    } catch (error) {
        // If the file doesn't exist, return an empty array
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        console.error(`Error reading data from ${filePath}:`, error);
        throw new Error(`Could not read data from ${filePath}.`);
    }
}

async function writeData(filePath: string, data: Submission[]) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing data to ${filePath}:`, error);
        throw new Error(`Could not write data to ${filePath}.`);
    }
}

export async function saveRegistration(formData: Record<string, any>) {
  try {
    const registrations = await readData(registrationsPath);
    const newRegistration = {
      ...formData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      type: 'registration',
    };
    registrations.push(newRegistration);
    await writeData(registrationsPath, registrations);
    return { success: true, data: newRegistration, error: null };
  } catch (error: any) {
    console.error('Error saving registration:', error);
    return { success: false, error: 'Could not save registration.', data: null };
  }
}

export async function getRegistrations() {
  try {
    const data = await readData(registrationsPath);
    // sort by date descending
    data.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return { success: true, data, error: null };
  } catch (error: any) {
    console.error('Error getting registrations:', error);
    return { success: false, error: 'Could not retrieve registrations.', data: [] };
  }
}

export async function saveShowcase(formData: Record<string, any>) {
    try {
        const showcases = await readData(showcasesPath);
        const newShowcase = {
            ...formData,
            id: Date.now().toString(),
            submittedAt: new Date().toISOString(),
            type: 'showcase',
        };
        showcases.push(newShowcase);
        await writeData(showcasesPath, showcases);
        return { success: true, data: newShowcase, error: null };
    } catch (error: any) {
        console.error('Error saving showcase:', error);
        return { success: false, error: 'Could not save showcase.', data: null };
    }
}

export async function getShowcases() {
    try {
        const data = await readData(showcasesPath);
        data.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        return { success: true, data, error: null };
    } catch (error: any) {
        console.error('Error getting showcases:', error);
        return { success: false, error: 'Could not retrieve showcases.', data: [] };
    }
}

export async function findSubmissionById(id: string) {
    try {
        const registrations = await readData(registrationsPath);
        const registration = registrations.find(r => r.id === id);
        if (registration) return { success: true, data: registration, error: null };

        const showcases = await readData(showcasesPath);
        const showcase = showcases.find(s => s.id === id);
        if (showcase) return { success: true, data: showcase, error: null };

        return { success: false, error: 'Submission not found.', data: null };
    } catch (error: any) {
        console.error('Error finding submission by ID:', error);
        return { success: false, error: 'Database query failed.', data: null };
    }
}


export async function findSubmissionByEmail(email: string) {
    try {
        const lowercasedEmail = email.toLowerCase();
        
        const registrations = await readData(registrationsPath);
        const registration = registrations.find(r => r.email?.toLowerCase() === lowercasedEmail);
        if (registration) return { success: true, data: registration, error: null };

        const showcases = await readData(showcasesPath);
        const showcase = showcases.find(s => s.presenterEmail?.toLowerCase() === lowercasedEmail);
        if (showcase) return { success: true, data: showcase, error: null };

        return { success: false, error: 'Submission with that email not found.', data: null };
    } catch(error: any) {
        console.error('Error finding submission by email:', error);
        return { success: false, error: 'Database query failed.', data: null };
    }
}


export async function updateSubmissionStatus(id: string, status: 'payment_pending' | 'awaiting_confirmation' | 'paid', details?: Record<string, any>) {
     try {
        const registrations = await readData(registrationsPath);
        const regIndex = registrations.findIndex(r => r.id === id);

        if (regIndex !== -1) {
            registrations[regIndex] = { ...registrations[regIndex], status, ...details };
            await writeData(registrationsPath, registrations);
            return { success: true, data: registrations[regIndex], error: null };
        }

        const showcases = await readData(showcasesPath);
        const showcaseIndex = showcases.findIndex(s => s.id === id);

        if (showcaseIndex !== -1) {
            showcases[showcaseIndex] = { ...showcases[showcaseIndex], status, ...details };
            await writeData(showcasesPath, showcases);
            return { success: true, data: showcases[showcaseIndex], error: null };
        }

        return { success: false, error: 'Submission to update not found.', data: null };
    } catch (error: any) {
        console.error('Error updating submission status:', error);
        return { success: false, error: 'Could not update submission status.' };
    }
}

export async function markSubmissionsAsPending(ids: string[]) {
    try {
        let updated = false;
        const registrations = await readData(registrationsPath);
        registrations.forEach(r => {
            if (ids.includes(r.id)) {
                r.status = 'payment_pending';
                updated = true;
            }
        });
        if(updated) await writeData(registrationsPath, registrations);

        updated = false;
        const showcases = await readData(showcasesPath);
        showcases.forEach(s => {
            if (ids.includes(s.id)) {
                s.status = 'payment_pending';
                updated = true;
            }
        });
        if(updated) await writeData(showcasesPath, showcases);

        return { success: true, data: { updatedIds: ids }, error: null };
    } catch (error: any) {
        console.error('Error marking submissions as pending:', error);
        return { success: false, error: 'Could not update submissions.' };
    }
}
