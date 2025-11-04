import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/services/firebase/config';

export function useDoc<T>(collectionPath: string, docId: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId || !collectionPath) {
      setData(null);
      setLoading(false);
      return;
    }

    const docRef = doc(firestore, collectionPath, docId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Document error:', error);
        setData(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath, docId]);

  return { data, loading };
}