import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import React from 'react';
import { Inter } from 'next/font/google';
import AdminDashboard from './AdminDashboard';

const inter = Inter({ subsets: ['latin'] });

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  let email = session?.user?.email;

  try {
    const res = await fetch(`http://localhost:3001/api/users/email/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching to always get fresh data
    });

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      redirect('/'); // Redirect on API error
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('API did not return JSON');
      redirect('/'); // Redirect if not JSON
    }

    const data = await res.json();

    // redirecting user to the home page if not admin
    if (data.role === 'user') {
      redirect('/');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect('/'); // Redirect on any error
  }

  return <AdminDashboard>Admin Dashboard Content</AdminDashboard>;
}
