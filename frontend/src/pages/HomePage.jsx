import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function HomePage() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('hello/')
      .then(res => {
        setApiData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("API error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Home Page</h1>
      {loading ? (
        <p>Loading API response...</p>
      ) : (
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Backend Message:</h3>
          <p style={{ fontSize: '1.2rem', color: '#2563eb', fontWeight: 'bold' }}>
            {apiData ? apiData.message : 'Failed to connect to backend'}
          </p>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Status: {apiData?.status || 'Error'}
          </span>
        </div>
      )}
    </div>
  );
}
