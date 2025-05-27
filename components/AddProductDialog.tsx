'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from '@/utils/categoryFormating';

interface AddProductDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onProductAdded?: () => void;
}

const AddProductDialog = ({
  isOpen,
  setIsOpen,
  onProductAdded,
}: AddProductDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<{
    title: string;
    price: number;
    manufacturer: string;
    inStock: number;
    mainImage: string;
    description: string;
    slug: string;
    categoryId: string;
  }>({
    title: '',
    price: 0,
    manufacturer: '',
    inStock: 1,
    mainImage: '',
    description: '',
    slug: '',
    categoryId: '',
  });

  const addProduct = async () => {
    if (
      product.title === '' ||
      product.manufacturer === '' ||
      product.description === '' ||
      product.slug === ''
    ) {
      toast.error('Please enter values in all required fields');
      return;
    }

    setIsLoading(true);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    };

    try {
      const response = await fetch(
        `http://localhost:3001/api/products`,
        requestOptions
      );

      if (response.status === 201) {
        toast.success('Product added successfully');
        resetForm();
        setIsOpen(false);
        if (onProductAdded) onProductAdded();
      } else {
        throw Error('There was an error while creating product');
      }
    } catch (error) {
      toast.error('There was an error while creating product');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('uploadedFile', file);

    try {
      const response = await fetch('http://localhost:3001/api/main-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        toast.error('File upload unsuccessful');
      }
    } catch (error) {
      console.error('Error happened while sending request:', error);
      toast.error('There was an error during file upload');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/categories`);
      const data = await response.json();
      setCategories(data);

      // Initialize form with first category if available
      if (data.length > 0 && !product.categoryId) {
        setProduct((prev) => ({
          ...prev,
          categoryId: data[0].id,
        }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const resetForm = () => {
    setProduct({
      title: '',
      price: 0,
      manufacturer: '',
      inStock: 1,
      mainImage: '',
      description: '',
      slug: '',
      categoryId: categories[0]?.id || '',
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm();
        setIsOpen(open);
      }}
    >
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 py-4'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Product Name</Label>
              <Input
                id='title'
                value={product.title}
                onChange={(e) =>
                  setProduct({ ...product, title: e.target.value })
                }
                placeholder='Enter product name'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='slug'>Product Slug</Label>
              <Input
                id='slug'
                value={convertSlugToURLFriendly(product.slug)}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    slug: convertSlugToURLFriendly(e.target.value),
                  })
                }
                placeholder='product-url-slug'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='price'>Product Price</Label>
              <Input
                id='price'
                type='number'
                value={product.price}
                onChange={(e) =>
                  setProduct({ ...product, price: Number(e.target.value) })
                }
                placeholder='0.00'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='manufacturer'>Manufacturer</Label>
              <Input
                id='manufacturer'
                value={product.manufacturer}
                onChange={(e) =>
                  setProduct({ ...product, manufacturer: e.target.value })
                }
                placeholder='Brand or manufacturer name'
              />
            </div>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='inStock'>Stock Availability</Label>
              <Select
                value={product.inStock.toString()}
                onValueChange={(value) =>
                  setProduct({ ...product, inStock: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select stock status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1'>In Stock</SelectItem>
                  <SelectItem value='0'>Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category'>Category</Label>
              <Select
                value={product.categoryId}
                onValueChange={(value) =>
                  setProduct({ ...product, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='mainImage'>Main Image</Label>
              <Input
                id='mainImage'
                type='file'
                onChange={(e) => {
                  const files = e.target.files;
                  const selectedFile = files && files[0];

                  if (selectedFile) {
                    uploadFile(selectedFile);
                    setProduct({ ...product, mainImage: selectedFile.name });
                  }
                }}
              />
              {product.mainImage && (
                <div className='mt-2'>
                  <Image
                    src={`/` + product.mainImage}
                    alt={product.title || 'Product image'}
                    width={100}
                    height={100}
                    className='object-contain rounded-md'
                  />
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Product Description</Label>
              <Textarea
                id='description'
                rows={5}
                value={product.description}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
                placeholder='Enter product description'
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={addProduct} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
