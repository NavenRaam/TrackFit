// pages/api/remove-account.js

import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const userId = session.user.id;
  const userEmail = session.user.email; // Use email as a fallback for old data

  console.log(`Starting full account removal for user ID: ${userId} with email: ${userEmail}`);

  try {
    await client.connect();
    const db = client.db('test');

    // These collections likely use 'email' as the identifier
    const collectionsToDeleteByEmail = [
      'accounts',
      'dietplans',
      'plans',
      'progresses',
      'sessions',
      'userprofiles',
    ];

    // Delete documents that are keyed by email (your old data)
    for (const collectionName of collectionsToDeleteByEmail) {
        const result = await db.collection(collectionName).deleteMany({ email: userEmail });
        console.log(`Deleted ${result.deletedCount} documents from collection: ${collectionName}`);
    }

    // Delete the user document itself by its unique _id
    const userResult = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
    console.log(`Deleted ${userResult.deletedCount} user document.`);

    return res.status(200).json({ message: 'Account and all data successfully removed.' });

  } catch (error) {
    console.error('Error removing account:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.', error: error.message });
  } finally {
    await client.close();
  }
}