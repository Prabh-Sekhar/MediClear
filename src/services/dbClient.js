import { collection, doc, addDoc, getDoc, getDocs, query, where, orderBy, limit as firestoreLimit, deleteDoc, getCountFromServer, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

/**
 * Save an analysis result for the current user
 */
export async function saveAnalysis(result) {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.warn('[MediClear] Not logged in, skipping save');
            return null;
        }

        const analysisData = {
            user_id: user.uid,
            created_at: new Date().toISOString(),
            document_type: result.documentType || null,
            urgency_level: result.urgencyLevel || null,
            summary: result.summary || null,
            health_story: result.healthStory || null,
            metrics: result.metrics || [],
            action_items: result.actionItems || [],
            doctor_questions: result.doctorQuestions || [],
            glossary: result.glossary || [],
            pii_found: result.piiFound || [],
            full_result: result,
        };

        const docRef = await addDoc(collection(db, 'analyses'), analysisData);

        console.log('[MediClear] Analysis saved, ID:', docRef.id);
        return { id: docRef.id, ...analysisData };
    } catch (err) {
        console.error('[MediClear] Save error:', err);
        return null;
    }
}

/**
 * Get recent analyses for the current user
 */
export async function getRecentAnalyses(limitCount = 10) {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        let results = [];

        try {
            // Try the indexed query first (requires composite index)
            const q = query(
                collection(db, 'analyses'),
                where('user_id', '==', user.uid),
                orderBy('created_at', 'desc'),
                firestoreLimit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                results.push({
                    id: doc.id,
                    created_at: data.created_at,
                    document_type: data.document_type,
                    urgency_level: data.urgency_level,
                    summary: data.summary,
                    metrics: data.metrics
                });
            });
        } catch (indexErr) {
            // Fallback: query without orderBy (no composite index needed), sort client-side
            console.warn('[MediClear] Index not ready, using fallback query');
            const q = query(
                collection(db, 'analyses'),
                where('user_id', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                results.push({
                    id: doc.id,
                    created_at: data.created_at,
                    document_type: data.document_type,
                    urgency_level: data.urgency_level,
                    summary: data.summary,
                    metrics: data.metrics
                });
            });
            // Sort client-side and limit
            results.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
            results = results.slice(0, limitCount);
        }

        return results;
    } catch (err) {
        console.error('[MediClear] Fetch error:', err);
        return [];
    }
}

/**
 * Get a single analysis by ID
 */
export async function getAnalysisById(id) {
    try {
        const docRef = doc(db, 'analyses', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.warn('[MediClear] Analysis not found');
            return null;
        }
    } catch (err) {
        console.error('[MediClear] Fetch error:', err);
        return null;
    }
}

/**
 * Delete an analysis by ID
 */
export async function deleteAnalysis(id) {
    try {
        await deleteDoc(doc(db, 'analyses', id));
        return true;
    } catch (err) {
        console.error('[MediClear] Delete error:', err);
        return false;
    }
}

/**
 * Get count of analyses for the current user
 */
export async function getAnalysisCount() {
    try {
        const user = auth.currentUser;
        if (!user) return 0;

        const q = query(
            collection(db, 'analyses'),
            where('user_id', '==', user.uid)
        );

        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (err) {
        console.error('[MediClear] Count error:', err);
        return 0;
    }
}
