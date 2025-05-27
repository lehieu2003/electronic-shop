import React from 'react';
import { MdDashboard } from 'react-icons/md';
import { FaTable } from 'react-icons/fa6';
import { FaRegUser } from 'react-icons/fa6';
import { FaBagShopping } from 'react-icons/fa6';
import { MdCategory } from 'react-icons/md';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const DashboardSidebar = () => {
  return (
    <div className='h-full w-[240px] max-xl:w-full bg-gray-100 text-gray-800'>
      <div className='space-y-1 py-4'>
        <Link href='/admin/dashboard'>
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-800 hover:bg-gray-200 hover:text-gray-900 px-6 py-6'
          >
            <MdDashboard className='mr-2 h-5 w-5' />
            <span>Dashboard</span>
          </Button>
        </Link>
        <Link href='/admin/orders'>
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-800 hover:bg-gray-200 hover:text-gray-900 px-6 py-6'
          >
            <FaBagShopping className='mr-2 h-5 w-5' />
            <span>Orders</span>
          </Button>
        </Link>
        <Link href='/admin/products'>
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-800 hover:bg-gray-200 hover:text-gray-900 px-6 py-6'
          >
            <FaTable className='mr-2 h-5 w-5' />
            <span>Products</span>
          </Button>
        </Link>
        <Link href='/admin/categories'>
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-800 hover:bg-gray-200 hover:text-gray-900 px-6 py-6'
          >
            <MdCategory className='mr-2 h-5 w-5' />
            <span>Categories</span>
          </Button>
        </Link>
        <Link href='/admin/users'>
          <Button
            variant='ghost'
            className='w-full justify-start text-gray-800 hover:bg-gray-200 hover:text-gray-900 px-6 py-6'
          >
            <FaRegUser className='mr-2 h-5 w-5' />
            <span>Users</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardSidebar;
