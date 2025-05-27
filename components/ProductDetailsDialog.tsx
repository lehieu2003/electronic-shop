'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { nanoid } from 'nanoid';
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
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from '../utils/categoryFormating';

interface ProductDetailsDialogProps {
  productId: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onProductUpdate?: () => void;
  mode?: 'view' | 'edit';
}

const ProductDetailsDialog = ({
  productId,
  isOpen,
  setIsOpen,
  onProductUpdate,
  mode = 'view',
}: ProductDetailsDialogProps) => {
  const [product, setProduct] = useState<Product>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [otherImages, setOtherImages] = useState<OtherImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(mode === 'view');

  // functionality for deleting product
  const deleteProduct = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setIsLoading(true);
    const requestOptions = {
      method: 'DELETE',
    };

    try {
      const response = await fetch(
        `http://localhost:3001/api/products/${productId}`,
        requestOptions
      );

      if (response.status !== 204) {
        if (response.status === 400) {
          toast.error(
            'Cannot delete the product because of foreign key constraint'
          );
        } else {
          throw Error('There was an error while deleting product');
        }
      } else {
        toast.success('Product deleted successfully');
        setIsOpen(false);
        if (onProductUpdate) onProductUpdate();
      }
    } catch (error) {
      toast.error('There was an error while deleting product');
    } finally {
      setIsLoading(false);
    }
  };

  // functionality for updating product
  const updateProduct = async () => {
    if (
      !product ||
      product.title === '' ||
      product.slug === '' ||
      product.price.toString() === '' ||
      product.manufacturer === '' ||
      product.description === ''
    ) {
      toast.error('You need to enter values in all required fields');
      return;
    }

    setIsLoading(true);
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    };

    try {
      const response = await fetch(
        `http://localhost:3001/api/products/${productId}`,
        requestOptions
      );

      if (response.status === 200) {
        toast.success('Product successfully updated');
        if (onProductUpdate) onProductUpdate();
      } else {
        throw Error('There was an error while updating product');
      }
    } catch (error) {
      toast.error('There was an error while updating product');
    } finally {
      setIsLoading(false);
    }
  };

  // functionality for uploading main image file
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('uploadedFile', file);

    try {
      const response = await fetch('http://localhost:3001/api/main-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        toast.error('File upload unsuccessful.');
      }
    } catch (error) {
      console.error('There was an error while during request sending:', error);
      toast.error('There was an error during request sending');
    }
  };

  // fetching main product data including other product images
  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/products/${productId}`
      );
      const data = await response.json();
      setProduct(data);

      const imagesResponse = await fetch(
        `http://localhost:3001/api/images/${productId}`,
        {
          cache: 'no-store',
        }
      );
      const images = await imagesResponse.json();
      setOtherImages(images);
    } catch (error) {
      console.error('Error fetching product data:', error);
      toast.error('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  // fetching all product categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchCategories();
      fetchProductData();
      setIsReadOnly(mode === 'view');
    }
  }, [isOpen, productId, mode]);

  // Switch to edit mode
  const handleEnableEdit = () => {
    setIsReadOnly(false);
  };

  if (!product) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {isReadOnly ? 'Product Details' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 py-4'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Product Name</Label>
              <Input
                id='title'
                value={product?.title}
                onChange={(e) =>
                  setProduct({ ...product!, title: e.target.value })
                }
                readOnly={isReadOnly}
                className={isReadOnly ? 'opacity-70' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='price'>Product Price</Label>
              <Input
                id='price'
                type='number'
                value={product?.price}
                onChange={(e) =>
                  setProduct({ ...product!, price: Number(e.target.value) })
                }
                readOnly={isReadOnly}
                className={isReadOnly ? 'opacity-70' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='manufacturer'>Manufacturer</Label>
              <Input
                id='manufacturer'
                value={product?.manufacturer}
                onChange={(e) =>
                  setProduct({ ...product!, manufacturer: e.target.value })
                }
                readOnly={isReadOnly}
                className={isReadOnly ? 'opacity-70' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='slug'>Slug</Label>
              <Input
                id='slug'
                value={product?.slug && convertSlugToURLFriendly(product?.slug)}
                onChange={(e) =>
                  setProduct({
                    ...product!,
                    slug: convertSlugToURLFriendly(e.target.value),
                  })
                }
                readOnly={isReadOnly}
                className={isReadOnly ? 'opacity-70' : ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='inStock'>Stock Availability</Label>
              {isReadOnly ? (
                <Input
                  id='inStock'
                  value={product?.inStock ? 'In Stock' : 'Out of Stock'}
                  readOnly
                  className='opacity-70'
                />
              ) : (
                <Select
                  value={product?.inStock?.toString()}
                  onValueChange={(value) =>
                    setProduct({ ...product!, inStock: Number(value) })
                  }
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select stock status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>In Stock</SelectItem>
                    <SelectItem value='0'>Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category'>Category</Label>
              {isReadOnly ? (
                <Input
                  id='category'
                  value={
                    categories.find((cat) => cat.id === product?.categoryId)
                      ?.name || ''
                  }
                  readOnly
                  className='opacity-70'
                />
              ) : (
                <Select
                  value={product?.categoryId?.toString()}
                  onValueChange={(value) =>
                    setProduct({ ...product!, categoryId: value })
                  }
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {formatCategoryName(category.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='mainImage'>Main Image</Label>
              {!isReadOnly && (
                <Input
                  id='mainImage'
                  type='file'
                  onChange={(e) => {
                    const files = e.target.files;
                    const selectedFile = files && files[0];

                    if (selectedFile) {
                      uploadFile(selectedFile);
                      setProduct({ ...product!, mainImage: selectedFile.name });
                    }
                  }}
                />
              )}
              {product?.mainImage && (
                <div className='mt-2'>
                  <Image
                    src={`/` + product.mainImage}
                    alt={product.title}
                    width={200}
                    height={200}
                    className='object-contain rounded-md'
                  />
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label>Other Images</Label>
              <div className='flex flex-wrap gap-2'>
                {otherImages.map((image) => (
                  <Image
                    key={nanoid()}
                    src={`/${image.image}`}
                    alt='Product image'
                    width={80}
                    height={80}
                    className='object-cover rounded-md'
                  />
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Product Description</Label>
              <Textarea
                id='description'
                rows={6}
                value={product?.description}
                onChange={(e) =>
                  setProduct({ ...product!, description: e.target.value })
                }
                readOnly={isReadOnly}
                className={isReadOnly ? 'opacity-70' : ''}
              />
            </div>
          </div>
        </div>

        <DialogFooter className='flex flex-col sm:flex-row gap-2'>
          {isReadOnly ? (
            <Button onClick={handleEnableEdit} variant='outline'>
              Edit Product
            </Button>
          ) : (
            <>
              <div className='flex gap-2'>
                <Button
                  variant='default'
                  onClick={updateProduct}
                  disabled={isLoading}
                >
                  Update Product
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
