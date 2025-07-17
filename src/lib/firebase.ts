import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('Firebase service account key is not set in environment variables.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
    // Throw an error to prevent the app from continuing with a misconfigured Firebase instance.
    throw new Error('Failed to initialize Firebase admin SDK. Check the service account key.');
  }
}

// Export a function to get the db instance, ensuring initialization has occurred.
const getDb = () => {
    if (!admin.apps.length) {
        throw new Error("Firebase has not been initialized.");
    }
    return admin.firestore();
}

// We export the function, not the direct instance.
// This ensures that any file importing 'db' gets a properly initialized instance.
const db = getDb();
export { db };
