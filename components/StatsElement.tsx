import React from 'react';
import { FaArrowUp } from 'react-icons/fa6';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StatsElement = () => {
  return (
    <Card className='w-80 max-md:w-full'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl'>New Products</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-2xl font-bold'>2,230</p>
        <Badge
          variant='outline'
          className='mt-2 bg-green-100 text-green-700 flex items-center gap-x-1 w-fit'
        >
          <FaArrowUp className='h-3 w-3' />
          <span>12.5% Since last month</span>
        </Badge>
      </CardContent>
    </Card>
  );
};

export default StatsElement;
