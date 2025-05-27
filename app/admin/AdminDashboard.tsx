'use client';

import React from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';

interface AdminDashboardProps {
  children: React.ReactNode;
}

export default function AdminDashboard({ children }: AdminDashboardProps) {
  return (
    <div className='flex h-screen'>
      <DashboardSidebar />
      <main className='flex-1 overflow-auto p-6'>{children}</main>
    </div>
  );
}
