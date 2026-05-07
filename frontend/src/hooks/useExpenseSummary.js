import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useExpenseSummary(userId) {
  const [data, setData] = useState({ monthly: [], byCategory: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const res = await fetch(
          `${API_BASE}/expenses/summary?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Server error');
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId]);

  return { ...data, loading, error };
}