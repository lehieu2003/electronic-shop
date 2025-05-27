'use client';
import { nanoid } from 'nanoid';
import Image from 'next/image';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import ProductDetailsDialog from './ProductDetailsDialog';
import AddProductDialog from './AddProductDialog';
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
import toast from 'react-hot-toast';

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [actionMode, setActionMode] = useState<'view' | 'edit' | null>(null);

  const fetchProducts = () => {
    fetch('http://localhost:3001/api/products?mode=admin', {
      cache: 'no-store',
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDetails = (productId: number, mode: 'view' | 'edit') => {
    setSelectedProductId(productId);
    setActionMode(mode);
    setIsDetailsOpen(true);
  };

  const handleProductUpdate = () => {
    // Refresh product list after update
    fetchProducts();
  };

  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/products/${productToDelete}`,
        {
          method: 'DELETE',
        }
      );

      if (response.status === 204) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else if (response.status === 400) {
        toast.error(
          'Cannot delete the product because of foreign key constraint'
        );
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast.error('There was an error while deleting product');
      console.error('Delete error:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className='w-full'>
      <h1 className='text-3xl font-semibold text-center mb-5'>All products</h1>
      <div className='flex justify-end mb-5'>
        <Button className='h-10' onClick={() => setIsAddProductOpen(true)}>
          Add new product
        </Button>
      </div>

      <div className='xl:ml-5 w-full max-xl:mt-5 overflow-auto h-[80vh]'>
        <Table>
          <TableCaption>A list of all products</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[60px]'>
                <Checkbox />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Stock Availability</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products &&
              products.map((product) => (
                <TableRow key={nanoid()}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <div className='rounded-md overflow-hidden w-12 h-12'>
                        <Image
                          width={48}
                          height={48}
                          src={
                            product?.mainImage
                              ? `/${product?.mainImage}`
                              : '/product_placeholder.jpg'
                          }
                          alt={product?.title || 'Product image'}
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <div>
                        <div className='font-medium'>{product?.title}</div>
                        <div className='text-sm text-muted-foreground'>
                          {product?.manufacturer}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product?.inStock ? (
                      <Badge
                        variant='outline'
                        className='bg-green-100 text-green-800 hover:bg-green-100'
                      >
                        In stock
                      </Badge>
                    ) : (
                      <Badge
                        variant='outline'
                        className='bg-red-100 text-red-800 hover:bg-red-100'
                      >
                        Out of stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>${product?.price}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleOpenDetails(product.id, 'view')}
                        title='View product details'
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleOpenDetails(product.id, 'edit')}
                        title='Edit product'
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDeleteClick(product.id)}
                        title='Delete product'
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

      {selectedProductId && (
        <ProductDetailsDialog
          productId={selectedProductId}
          isOpen={isDetailsOpen}
          setIsOpen={setIsDetailsOpen}
          onProductUpdate={handleProductUpdate}
          mode={actionMode || 'view'}
        />
      )}

      <AddProductDialog
        isOpen={isAddProductOpen}
        setIsOpen={setIsAddProductOpen}
        onProductAdded={handleProductUpdate}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from the database.
              <br />
              <br />
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

export default DashboardProductTable;
