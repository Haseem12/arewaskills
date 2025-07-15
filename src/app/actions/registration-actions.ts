'use server';

import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const registrationsFilePath = path.join(dataDir, 'registrations.json');
const showcasesFilePath = path.join(dataDir, 'showcases.json');

type Submission = {
    id: string;
    [key: string]: any;
};

async function readData(filePath: string): Promise<Submission[]> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty array
    }
    throw error;
  }
}

async function writeData(filePath: string, data: any) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing data:', error);
    throw new Error('Could not save data.');
  }
}

export async function saveRegistration(formData: Record<string, any>) {
  try {
    const registrations = await readData(registrationsFilePath);
    const newRegistration = {
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      ...formData,
    };
    registrations.push(newRegistration);
    await writeData(registrationsFilePath, registrations);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRegistrations() {
  try {
    const registrations = await readData(registrationsFilePath);
    return { success: true, data: registrations.reverse() };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function saveShowcase(formData: Record<string, any>) {
    try {
        const showcases = await readData(showcasesFilePath);
        const newShowcase = {
            id: Date.now().toString(),
            submittedAt: new Date().toISOString(),
            ...formData,
        };
        showcases.push(newShowcase);
        await writeData(showcasesFilePath, showcases);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getShowcases() {
    try {
        const showcases = await readData(showcasesFilePath);
        return { success: true, data: showcases.reverse() };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}

export async function updateSubmissionStatus(ids: string[], status: 'payment_pending' | 'paid') {
    try {
        const registrations = await readData(registrationsFilePath);
        const showcases = await readData(showcasesFilePath);

        const updatedRegistrations = registrations.map(reg => 
            ids.includes(reg.id) ? { ...reg, status } : reg
        );
        const updatedShowcases = showcases.map(shw => 
            ids.includes(shw.id) ? { ...shw, status } : shw
        );

        await writeData(registrationsFilePath, updatedRegistrations);
        await writeData(showcasesFilePath, updatedShowcases);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function findSubmissionByEmail(email: string) {
    try {
        const registrations = await readData(registrationsFilePath);
        const showcases = await readData(showcasesFilePath);

        const registration = registrations.find(r => r.email?.toLowerCase() === email.toLowerCase());
        if (registration) return { success: true, data: { ...registration, type: 'registration' } };

        const showcase = showcases.find(s => s.presenterEmail?.toLowerCase() === email.toLowerCase());
        if (showcase) return { success: true, data: { ...showcase, type: 'showcase' } };
        
        return { success: false, error: "No submission found for this email.", data: null };
    } catch(error: any) {
        return { success: false, error: error.message, data: null };
    }
}
