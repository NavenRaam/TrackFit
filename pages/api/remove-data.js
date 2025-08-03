// pages/api/remove-data.js

import { MongoClient } from 'mongodb';
import { getServerSession } from "next-auth"; // Import getServerSession
import { authOptions } from "@/lib/authOptions"; // Import your auth options

// ===========================================================================
//  STEP 1: Initialize MongoDB Client
// ===========================================================================
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// The main handler for the API route.
export default async function handler(req, res) {
  // Ensure only POST requests are allowed for this sensitive operation.
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // ===========================================================================
  //  SECURE STEP 1: VERIFY AUTHENTICATION
  // ===========================================================================
  // Get the session using the secure getServerSession method.
  const session = await getServerSession(req, res, authOptions);

  // If there is no valid session, the user is not authenticated.
  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  
  // We securely get the email from the authenticated session.
  const userEmail = session.user.email;
  
  try {
    await client.connect();
    const db = client.db('test');

    // ===========================================================================
    //  STEP 2: DELETE ALL USER-RELATED DOCUMENTS FROM MONGODB
    // ===========================================================================
    const collectionsToDeleteFrom = ['plans', 'dietplans', 'progresses', 'userprofiles'];

    let totalDeletedCount = 0;

    for (const collectionName of collectionsToDeleteFrom) {
      console.log(`Attempting to delete documents from collection: ${collectionName} for user: ${userEmail}`);
      // We use the email from the session to find the documents.
      // This is based on the data structure you provided previously.
      const result = await db.collection(collectionName).deleteMany({ email: userEmail });
      totalDeletedCount += result.deletedCount;
      console.log(`Deleted ${result.deletedCount} documents from ${collectionName}.`);
    }

    // ===========================================================================
    //  STEP 3: Check and Respond
    // ===========================================================================
    if (totalDeletedCount > 0) {
      return res.status(200).json({ message: 'Associated data successfully removed.', deletedCount: totalDeletedCount });
    } else {
      return res.status(404).json({ message: 'No data found for the specified user.' });
    }

  } catch (error) {
    console.error('An unexpected error occurred during data removal:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.', error: error.message });

  } finally {
    if (client) {
      await client.close();
    }
  }
}