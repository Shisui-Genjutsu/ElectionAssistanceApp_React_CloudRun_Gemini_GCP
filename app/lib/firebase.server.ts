// Server-only Firebase Admin wrapper
// Uses firebase-admin (service account) — never runs in the browser

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app: App;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // Support service account JSON as env var (for Cloud Run)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    app = initializeApp({ credential: cert(serviceAccount) });
  } else {
    // Application Default Credentials (works locally if you ran `gcloud auth application-default login`)
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  return app;
}

export function getDb() {
  return getFirestore(getAdminApp());
}

// Cosine similarity helper
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  source: string;
  embedding: number[];
}

export async function searchKnowledgeBase(
  queryEmbedding: number[],
  topK = 3,
  threshold = 0.7
): Promise<KnowledgeDoc[]> {
  const db = getDb();
  const snapshot = await db.collection("knowledgeBase").get();
  const results: (KnowledgeDoc & { similarity: number })[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data() as KnowledgeDoc;
    if (data.embedding?.length) {
      const similarity = cosineSimilarity(queryEmbedding, data.embedding);
      if (similarity > threshold) {
        results.push({ ...data, id: doc.id, similarity });
      }
    }
  });

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
