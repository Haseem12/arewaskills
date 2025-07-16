'use server';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
try {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64!, 'base64').toString('utf-8')
  );

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
} catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // We won't throw here, but subsequent Firestore calls will fail.
    // This allows the app to build even without credentials, but it will fail at runtime.
}


const db = getFirestore();

const registrationsCollection = db.collection('registrations');
const showcasesCollection = db.collection('showcases');

// Helper function to convert Firestore Timestamps to ISO strings
const convertTimestamps = (docData: any) => {
    if (!docData) return docData;
    const data = { ...docData };
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        }
    }
    return data;
};

export async function saveRegistration(formData: Record<string, any>) {
  try {
    const newRegistration = {
      ...formData,
      submittedAt: FieldValue.serverTimestamp(),
    };
    const docRef = await registrationsCollection.add(newRegistration);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error saving registration:', error);
    return { success: false, error: 'Could not save data to the database.' };
  }
}

export async function getRegistrations() {
  try {
    const snapshot = await registrationsCollection.orderBy('submittedAt', 'desc').get();
    const registrations = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    return { success: true, data: registrations };
  } catch (error: any) {
    console.error('Error getting registrations:', error);
    return { success: false, error: 'Could not retrieve data from the database.', data: [] };
  }
}

export async function saveShowcase(formData: Record<string, any>) {
    try {
        const newShowcase = {
            ...formData,
            submittedAt: FieldValue.serverTimestamp(),
        };
        const docRef = await showcasesCollection.add(newShowcase);
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error('Error saving showcase:', error);
        return { success: false, error: 'Could not save data to the database.' };
    }
}

export async function getShowcases() {
    try {
        const snapshot = await showcasesCollection.orderBy('submittedAt', 'desc').get();
        const showcases = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
        return { success: true, data: showcases };
    } catch (error: any) {
        console.error('Error getting showcases:', error);
        return { success: false, error: 'Could not retrieve data from the database.', data: [] };
    }
}

export async function updateSubmissionStatus(id: string, status: 'payment_pending' | 'awaiting_confirmation' | 'paid', details?: Record<string, any>) {
    try {
        const registrationRef = registrationsCollection.doc(id);
        const showcaseRef = showcasesCollection.doc(id);

        const regDoc = await registrationRef.get();
        const showcaseDoc = await showcaseRef.get();

        if (regDoc.exists) {
            await registrationRef.update({ status, ...details });
        } else if (showcaseDoc.exists) {
            await showcaseRef.update({ status, ...details });
        } else {
            throw new Error("Submission not found.");
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error updating submission status:', error);
        return { success: false, error: 'Could not update submission status.' };
    }
}

export async function markSubmissionsAsPending(ids: string[]) {
    try {
        const batch = db.batch();
        const registrationsSnapshot = await registrationsCollection.where(FieldPath.documentId(), 'in', ids).get();
        registrationsSnapshot.forEach(doc => {
            batch.update(doc.ref, { status: 'payment_pending' });
        });

        const showcasesSnapshot = await showcasesCollection.where(FieldPath.documentId(), 'in', ids).get();
        showcasesSnapshot.forEach(doc => {
            batch.update(doc.ref, { status: 'payment_pending' });
        });

        await batch.commit();
        return { success: true };
    } catch (error: any) {
        console.error('Error marking submissions as pending:', error);
        return { success: false, error: 'Could not update submissions.' };
    }
}

export async function findSubmissionByEmail(email: string) {
    try {
        const regSnapshot = await registrationsCollection.where('email', '==', email.toLowerCase()).limit(1).get();
        if (!regSnapshot.empty) {
            const doc = regSnapshot.docs[0];
            return { success: true, data: convertTimestamps({ ...doc.data(), id: doc.id, type: 'registration' }) };
        }

        const showcaseSnapshot = await showcasesCollection.where('presenterEmail', '==', email.toLowerCase()).limit(1).get();
        if (!showcaseSnapshot.empty) {
            const doc = showcaseSnapshot.docs[0];
            return { success: true, data: convertTimestamps({ ...doc.data(), id: doc.id, type: 'showcase' }) };
        }
        
        return { success: false, error: "No submission found for this email.", data: null };
    } catch(error: any) {
        console.error('Error finding submission by email:', error);
        return { success: false, error: 'Database query failed.', data: null };
    }
}

export async function findSubmissionById(id: string) {
    try {
        const regDoc = await registrationsCollection.doc(id).get();
        if (regDoc.exists) {
            return { success: true, data: convertTimestamps({ ...regDoc.data(), id: regDoc.id, type: 'registration' }) };
        }
        
        const showcaseDoc = await showcasesCollection.doc(id).get();
        if (showcaseDoc.exists) {
            return { success: true, data: convertTimestamps({ ...showcaseDoc.data(), id: showcaseDoc.id, type: 'showcase' }) };
        }

        return { success: false, error: "No submission found for this ID.", data: null };
    } catch (error: any) {
        console.error('Error finding submission by ID:', error);
        return { success: false, error: 'Database query failed.', data: null };
    }
}
