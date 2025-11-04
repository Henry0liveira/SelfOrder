import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, WhereFilterOp } from 'firebase/firestore';
import { firestore } from '@/services/firebase/config';

export function useCollection<T>(collectionPath: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collectionPath) {
      setData([]);
      setLoading(false);
      return;
    }

    const collectionRef = collection(firestore, collectionPath);
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        setData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T)));
        setLoading(false);
      },
      (error) => {
        console.error('Collection error:', error);
        setData([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath]);

  return { data, loading };
}

type QueryConstraint = {
  field: string;
  operator: WhereFilterOp;
  value: any;
};

export function useCollectionQuery<T>(
  collectionPath: string,
  constraints: QueryConstraint | QueryConstraint[]
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraintsArray = Array.isArray(constraints) ? constraints : [constraints];
    
    if (!collectionPath || constraintsArray.some(c => !c.value)) {
      setData([]);
      setLoading(false);
      return;
    }

    const collectionRef = collection(firestore, collectionPath);
    const whereClauses = constraintsArray
      .filter(c => c.value !== undefined && c.value !== null && c.value !== '')
      .map(c => where(c.field, c.operator, c.value));
    
    if (!whereClauses.length) {
      setData([]);
      setLoading(false);
      return;
    }

    const q = query(collectionRef, ...whereClauses);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T)));
        setLoading(false);
      },
      (error) => {
        console.error('Query error:', error);
        setData([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath, JSON.stringify(constraints)]);

  return { data, loading };
}