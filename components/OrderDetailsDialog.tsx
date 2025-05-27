'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isValidEmailAddressFormat, isValidNameOrLastname } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OrderProduct {
  id: string;
  customerOrderId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    title: string;
    mainImage: string;
    price: number;
    rating: number;
    description: string;
    manufacturer: string;
    inStock: number;
    categoryId: string;
  };
}

interface OrderDetailsDialogProps {
  orderId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOrderUpdate?: () => void;
  mode?: 'view' | 'edit';
}

const OrderDetailsDialog = ({
  orderId,
  isOpen,
  setIsOpen,
  onOrderUpdate,
  mode = 'view',
}: OrderDetailsDialogProps) => {
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [order, setOrder] = useState<Order>({
    id: '',
    adress: '',
    apartment: '',
    company: '',
    dateTime: '',
    email: '',
    lastname: '',
    name: '',
    phone: '',
    postalCode: '',
    city: '',
    country: '',
    orderNotice: '',
    status: 'processing',
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(mode === 'view');

  const fetchOrderData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/orders/${orderId}`
      );
      const data: Order = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderProducts = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/order-product/${orderId}`
      );
      const data: OrderProduct[] = await response.json();
      setOrderProducts(data);
    } catch (error) {
      console.error('Error fetching order products:', error);
      toast.error('Failed to load order items');
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderData();
      fetchOrderProducts();
      setIsReadOnly(mode === 'view');
    }
  }, [isOpen, orderId, mode]);

  const updateOrder = async () => {
    if (
      order?.name.length > 0 &&
      order?.lastname.length > 0 &&
      order?.phone.length > 0 &&
      order?.email.length > 0 &&
      order?.company.length > 0 &&
      order?.adress.length > 0 &&
      order?.apartment.length > 0 &&
      order?.city.length > 0 &&
      order?.country.length > 0 &&
      order?.postalCode.length > 0
    ) {
      if (!isValidNameOrLastname(order?.name)) {
        toast.error('You entered invalid name format');
        return;
      }

      if (!isValidNameOrLastname(order?.lastname)) {
        toast.error('You entered invalid lastname format');
        return;
      }

      if (!isValidEmailAddressFormat(order?.email)) {
        toast.error('You entered invalid email format');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3001/api/orders/${order?.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(order),
          }
        );

        if (response.status === 200) {
          toast.success('Order updated successfully');
          if (onOrderUpdate) onOrderUpdate();
        } else {
          throw new Error('Failed to update order');
        }
      } catch (error) {
        toast.error('There was an error while updating the order');
        console.error('Update error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please fill all fields');
    }
  };

  // Switch to edit mode
  const handleEnableEdit = () => {
    setIsReadOnly(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {isReadOnly ? 'Order Details' : 'Edit Order'} - #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Date: {new Date(Date.parse(order?.dateTime)).toLocaleString()}
              </p>
            </div>
            <Badge
              variant='outline'
              className={getStatusBadgeClass(order.status)}
            >
              {order.status}
            </Badge>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <h3 className='font-semibold text-lg'>Customer Information</h3>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>First Name</Label>
                  <Input
                    id='name'
                    value={order.name}
                    onChange={(e) =>
                      setOrder({ ...order, name: e.target.value })
                    }
                    readOnly={isReadOnly}
                    className={isReadOnly ? 'opacity-70' : ''}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lastname'>Last Name</Label>
                  <Input
                    id='lastname'
                    value={order.lastname}
                    onChange={(e) =>
                      setOrder({ ...order, lastname: e.target.value })
                    }
                    readOnly={isReadOnly}
                    className={isReadOnly ? 'opacity-70' : ''}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  value={order.email}
                  onChange={(e) =>
                    setOrder({ ...order, email: e.target.value })
                  }
                  readOnly={isReadOnly}
                  className={isReadOnly ? 'opacity-70' : ''}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  value={order.phone}
                  onChange={(e) =>
                    setOrder({ ...order, phone: e.target.value })
                  }
                  readOnly={isReadOnly}
                  className={isReadOnly ? 'opacity-70' : ''}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='company'>Company</Label>
                <Input
                  id='company'
                  value={order.company}
                  onChange={(e) =>
                    setOrder({ ...order, company: e.target.value })
                  }
                  readOnly={isReadOnly}
                  className={isReadOnly ? 'opacity-70' : ''}
                />
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='font-semibold text-lg'>Shipping Information</h3>

              <div className='space-y-2'>
                <Label htmlFor='address'>Address</Label>
                <Input
                  id='address'
                  value={order.adress}
                  onChange={(e) =>
                    setOrder({ ...order, adress: e.target.value })
                  }
                  readOnly={isReadOnly}
                  className={isReadOnly ? 'opacity-70' : ''}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='apartment'>Apartment, Suite, etc.</Label>
                <Input
                  id='apartment'
                  value={order.apartment}
                  onChange={(e) =>
                    setOrder({ ...order, apartment: e.target.value })
                  }
                  readOnly={isReadOnly}
                  className={isReadOnly ? 'opacity-70' : ''}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='city'>City</Label>
                  <Input
                    id='city'
                    value={order.city}
                    onChange={(e) =>
                      setOrder({ ...order, city: e.target.value })
                    }
                    readOnly={isReadOnly}
                    className={isReadOnly ? 'opacity-70' : ''}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='postalCode'>Postal Code</Label>
                  <Input
                    id='postalCode'
                    value={order.postalCode}
                    onChange={(e) =>
                      setOrder({ ...order, postalCode: e.target.value })
                    }
                    readOnly={isReadOnly}
                    className={isReadOnly ? 'opacity-70' : ''}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='country'>Country</Label>
                <Input
                  id='country'
                  value={order.country}
                  onChange={(e) =>
                    setOrder({ ...order, country: e.target.value })
                  }
                  readOnly={isReadOnly}
                  className={isReadOnly ? 'opacity-70' : ''}
                />
              </div>

              {!isReadOnly && (
                <div className='space-y-2'>
                  <Label htmlFor='status'>Order Status</Label>
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      setOrder({
                        ...order,
                        status: value as
                          | 'processing'
                          | 'delivered'
                          | 'canceled',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='processing'>Processing</SelectItem>
                      <SelectItem value='delivered'>Delivered</SelectItem>
                      <SelectItem value='canceled'>Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='orderNotice'>Order Notice</Label>
            <Textarea
              id='orderNotice'
              value={order.orderNotice || ''}
              onChange={(e) =>
                setOrder({ ...order, orderNotice: e.target.value })
              }
              readOnly={isReadOnly}
              className={isReadOnly ? 'opacity-70' : ''}
              placeholder={
                isReadOnly && !order.orderNotice ? 'No notice provided' : ''
              }
            />
          </div>

          <div className='space-y-4'>
            <h3 className='font-semibold text-lg'>Order Items</h3>
            <div className='border rounded-md overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className='text-right'>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderProducts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className='h-12 w-12 rounded overflow-hidden'>
                          <Image
                            src={
                              item?.product?.mainImage
                                ? `/${item.product.mainImage}`
                                : '/product_placeholder.jpg'
                            }
                            alt={item.product.title}
                            width={48}
                            height={48}
                            className='h-full w-full object-cover'
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {isReadOnly ? (
                          <Link
                            href={`/product/${item.product.slug}`}
                            className='font-medium hover:underline'
                            target='_blank'
                          >
                            {item.product.title}
                          </Link>
                        ) : (
                          <span className='font-medium'>
                            {item.product.title}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>${item.product.price}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className='text-right'>
                        ${item.product.price * item.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className='space-y-2 border-t pt-4'>
            <div className='flex justify-between'>
              <span>Subtotal:</span>
              <span>${order.total}</span>
            </div>
            <div className='flex justify-between'>
              <span>Tax (20%):</span>
              <span>${(order.total / 5).toFixed(2)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Shipping:</span>
              <span>$5.00</span>
            </div>
            <div className='flex justify-between font-bold text-lg'>
              <span>Total:</span>
              <span>${(order.total + order.total / 5 + 5).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          {isReadOnly ? (
            <Button onClick={handleEnableEdit} variant='outline'>
              Edit Order
            </Button>
          ) : (
            <Button onClick={updateOrder} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Order'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
