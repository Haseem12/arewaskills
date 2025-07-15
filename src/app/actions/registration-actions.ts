'use server';

import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const registrationsFilePath = path.join(dataDir, 'registrations.json');
const showcasesFilePath = path.join(dataDir, 'showcases.json');

async function readData(filePath: string) {
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
