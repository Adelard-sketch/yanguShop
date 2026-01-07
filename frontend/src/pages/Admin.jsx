import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    // Redirect to admin dashboard
    navigate('/admin/dashboard');
  }, [user, navigate]);

  return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <p>Redirecting to admin dashboard...</p>
    </div>
  );
}
