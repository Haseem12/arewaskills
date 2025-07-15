'use server';

import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'registrations.json');

async function readData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty array
    }
    throw error;
  }
}

async function writeData(data: any) {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing data:', error);
    throw new Error('Could not save data.');
  }
}

export async function saveRegistration(formData: Record<string, any>) {
  try {
    const registrations = await readData();
    const newRegistration = {
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      ...formData,
    };
    registrations.push(newRegistration);
    await writeData(registrations);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRegistrations() {
  try {
    const registrations = await readData();
    return { success: true, data: registrations.reverse() };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}
