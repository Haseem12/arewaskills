
'use server';

import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

// Helper function to convert Firestore Timestamps to ISO strings
function serializeData(docData: any) {
  if (!docData) return null;
  const data = { ...docData };
  for (const key in data) {
    if (data[key] instanceof FieldValue || (data[key] && typeof data[key].toDate === 'function')) {
      data[key] = data[key].toDate().toISOString();
    }
  }
  return data;
}

export async function saveRegistration(formData: Record<string, any>) {
  try {
    const docRef = db.collection('registrations').doc();
    const newRegistration = {
      ...formData,
      id: docRef.id,
      submittedAt: FieldValue.serverTimestamp(),
      type: 'registration',
    };
    await docRef.set(newRegistration);
    return { success: true, data: { ...newRegistration, submittedAt: new Date().toISOString() }, error: null };
  } catch (error: any) {
    console.error('Error saving registration:', error);
    return { success: false, error: 'Could not save registration.', data: null };
  }
}

export async function getRegistrations() {
  try {
    const snapshot = await db.collection('registrations').orderBy('submittedAt', 'desc').get();
    const data = snapshot.docs.map(doc => serializeData({ id: doc.id, ...doc.data() }));
    return { success: true, data, error: null };
  } catch (error: any) {
    console.error('Error getting registrations:', error);
    return { success: false, error: 'Could not retrieve registrations.', data: [] };
  }
}

export async function saveShowcase(formData: Record<string, any>) {
    try {
        const docRef = db.collection('showcases').doc();
        const newShowcase = {
            ...formData,
            id: docRef.id,
            submittedAt: FieldValue.serverTimestamp(),
            type: 'showcase',
        };
        await docRef.set(newShowcase);
        return { success: true, data: { ...newShowcase, submittedAt: new Date().toISOString() }, error: null };
    } catch (error: any) {
        console.error('Error saving showcase:', error);
        return { success: false, error: 'Could not save showcase.', data: null };
    }
}

export async function getShowcases() {
    try {
        const snapshot = await db.collection('showcases').orderBy('submittedAt', 'desc').get();
        const data = snapshot.docs.map(doc => serializeData({ id: doc.id, ...doc.data() }));
        return { success: true, data, error: null };
    } catch (error: any) {
        console.error('Error getting showcases:', error);
        return { success: false, error: 'Could not retrieve showcases.', data: [] };
    }
}

export async function findSubmissionById(id: string) {
    try {
        let doc = await db.collection('registrations').doc(id).get();
        if (doc.exists) {
            return { success: true, data: serializeData({ id: doc.id, ...doc.data() }), error: null };
        }

        doc = await db.collection('showcases').doc(id).get();
        if (doc.exists) {
            return { success: true, data: serializeData({ id: doc.id, ...doc.data() }), error: null };
        }

        return { success: false, error: 'Submission not found.', data: null };
    } catch (error: any) {
        console.error('Error finding submission by ID:', error);
        return { success: false, error: 'Database query failed.', data: null };
    }
}

export async function findSubmissionByEmail(email: string) {
    try {
        const lowercasedEmail = email.toLowerCase();
        
        let snapshot = await db.collection('registrations').where('email', '==', lowercasedEmail).limit(1).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { success: true, data: serializeData({ id: doc.id, ...doc.data() }), error: null };
        }

        snapshot = await db.collection('showcases').where('presenterEmail', '==', lowercasedEmail).limit(1).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { success: true, data: serializeData({ id: doc.id, ...doc.data() }), error: null };
        }

        return { success: false, error: 'Submission with that email not found.', data: null };
    } catch(error: any) {
        console.error('Error finding submission by email:', error);
        return { success: false, error: 'Database query failed.', data: null };
    }
}

export async function updateSubmissionStatus(id: string, status: 'payment_pending' | 'awaiting_confirmation' | 'paid', details?: Record<string, any>) {
     try {
        const dataToUpdate = { ...details, status };
        let docRef = db.collection('registrations').doc(id);
        let doc = await docRef.get();

        if (doc.exists) {
            await docRef.update(dataToUpdate);
            const updatedDoc = await docRef.get();
            return { success: true, data: serializeData({ id: updatedDoc.id, ...updatedDoc.data() }), error: null };
        }

        docRef = db.collection('showcases').doc(id);
        doc = await docRef.get();
        if (doc.exists) {
            await docRef.update(dataToUpdate);
            const updatedDoc = await docRef.get();
            return { success: true, data: serializeData({ id: updatedDoc.id, ...updatedDoc.data() }), error: null };
        }

        return { success: false, error: 'Submission to update not found.', data: null };
    } catch (error: any) {
        console.error('Error updating submission status:', error);
        return { success: false, error: 'Could not update submission status.' };
    }
}

export async function markSubmissionsAsPending(ids: string[]) {
    if (!ids || ids.length === 0) {
        return { success: true, data: { updatedIds: [] }, error: null };
    }
    try {
        const batch = db.batch();
        ids.forEach(id => {
            // We have to try updating in both collections, as we don't know the type.
            // This is safe; if a doc doesn't exist, the batch write for it is ignored.
            const regRef = db.collection('registrations').doc(id);
            batch.update(regRef, { status: 'payment_pending' });
            
            const showcaseRef = db.collection('showcases').doc(id);
            batch.update(showcaseRef, { status: 'payment_pending' });
        });
        await batch.commit();
        return { success: true, data: { updatedIds: ids }, error: null };
    } catch (error: any) {
        console.error('Error marking submissions as pending:', error);
        return { success: false, error: 'Could not update submissions.' };
    }
}
