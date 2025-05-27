'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import OrderDetailsDialog from './OrderDetailsDialog';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<'view' | 'edit' | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDetails = (orderId: string, mode: 'view' | 'edit') => {
    setSelectedOrderId(orderId);
    setActionMode(mode);
    setIsDetailsOpen(true);
  };

  const handleOrderUpdate = () => {
    // Refresh order list after update
    fetchOrders();
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      // First delete order-product relations
      await fetch(`http://localhost:3001/api/order-product/${orderToDelete}`, {
        method: 'DELETE',
      });

      // Then delete the order itself
      await fetch(`http://localhost:3001/api/orders/${orderToDelete}`, {
        method: 'DELETE',
      });

      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'canceled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className='xl:ml-5 w-full max-xl:mt-5 '>
      <h1 className='text-3xl font-semibold text-center mb-5'>All orders</h1>
      <div className='overflow-x-auto'>
        <Table>
          <TableCaption>A list of all orders</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[60px]'>
                <Checkbox />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Name and country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order?.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className='font-medium'>#{order?.id}</TableCell>
                <TableCell>
                  <div>
                    <p className='font-medium'>
                      {order?.name} {order?.lastname}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {order?.country}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant='outline'
                    className={getStatusBadgeClass(order?.status)}
                  >
                    {order?.status}
                  </Badge>
                </TableCell>
                <TableCell>${order?.total}</TableCell>
                <TableCell>
                  {new Date(Date.parse(order?.dateTime)).toDateString()}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleOpenDetails(order.id, 'view')}
                      title='View order details'
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleOpenDetails(order.id, 'edit')}
                      title='Edit order'
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeleteClick(order.id)}
                      title='Delete order'
                      className='text-red-500 hover:text-red-700 hover:bg-red-50'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedOrderId && (
        <OrderDetailsDialog
          orderId={selectedOrderId}
          isOpen={isDetailsOpen}
          setIsOpen={setIsDetailsOpen}
          onOrderUpdate={handleOrderUpdate}
          mode={actionMode || 'view'}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order and all related order items from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrders;
