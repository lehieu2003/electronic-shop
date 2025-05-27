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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { PlusCircle, Pencil, Trash2, Search } from 'lucide-react';

type Product = {
  id: string;
  title: string;
  slug: string;
  mainImage: string;
  price: number;
  description: string;
  manufacturer: string;
  categoryId: string;
  inStock: boolean;
  rating: number;
  category?: {
    id: string;
    name: string;
  };
};

type Category = {
  id: string;
  name: string;
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      title: '',
      slug: '',
      mainImage: '',
      price: 0,
      description: '',
      manufacturer: '',
      categoryId: '',
      inStock: true,
      rating: 5,
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          'http://localhost:3001/api/products?mode=admin'
        );
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [toast]);

  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      const response = await fetch(
        'http://localhost:3001/api/products?mode=admin'
      );
      const data = await response.json();
      setProducts(data);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/products/search?query=${searchQuery}`
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error searching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to search products',
        variant: 'destructive',
      });
    }
  };

  const handleCreateProduct = async (data: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create product');

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
      setOpenDialog(false);
      form.reset();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProduct = async (data: any) => {
    if (!currentProduct) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/products/${currentProduct.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error('Failed to update product');

      const updatedProduct = await response.json();
      setProducts(
        products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      setOpenDialog(false);
      form.reset();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      setProducts(products.filter((p) => p.id !== id));
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    form.reset({
      title: product.title,
      slug: product.slug,
      mainImage: product.mainImage,
      price: product.price,
      description: product.description,
      manufacturer: product.manufacturer,
      categoryId: product.categoryId,
      inStock: product.inStock,
      rating: product.rating,
    });
    setOpenDialog(true);
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    form.reset({
      title: '',
      slug: '',
      mainImage: '',
      price: 0,
      description: '',
      manufacturer: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      inStock: true,
      rating: 5,
    });
    setOpenDialog(true);
  };

  const onSubmit = (data: any) => {
    if (isEditing) {
      handleUpdateProduct(data);
    } else {
      handleCreateProduct(data);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  return (
    <div className='xl:ml-5 w-full max-xl:mt-5'>
      <div className='flex justify-between items-center mb-5'>
        <h1 className='text-3xl font-semibold'>Products</h1>
        <div className='flex items-center gap-2'>
          <div className='flex items-center bg-white rounded-md border px-3'>
            <Input
              className='border-0 focus-visible:ring-0'
              placeholder='Search products...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
            />
            <Search
              className='h-4 w-4 cursor-pointer'
              onClick={searchProducts}
            />
          </div>
          <Button onClick={openCreateDialog}>
            <PlusCircle className='h-4 w-4 mr-2' /> Add Product
          </Button>
        </div>
      </div>

      <div className='bg-white rounded-md border shadow-sm'>
        <Table>
          <TableCaption>
            {isLoading ? 'Loading products...' : 'All products'}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[60px]'>
                <Checkbox />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <img
                    src={product.mainImage}
                    alt={product.title}
                    className='h-12 w-12 object-cover rounded-md'
                  />
                </TableCell>
                <TableCell className='font-medium max-w-[200px] truncate'>
                  {product.title}
                </TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.category?.name}</TableCell>
                <TableCell>
                  <Badge
                    variant='outline'
                    className={
                      product.inStock
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-red-100 text-red-800 hover:bg-red-100'
                    }
                  >
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => openEditDialog(product)}
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeleteProduct(product.id)}
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

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Make changes to the product details below.'
                : 'Fill in the details to create a new product.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Product title'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!isEditing || !currentProduct?.slug) {
                              const slug = generateSlug(e.target.value);
                              form.setValue('slug', slug);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder='product-slug' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='mainImage'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com/image.jpg'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='99.99'
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='categoryId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                          {...field}
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Product description...'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='manufacturer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder='Manufacturer name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='inStock'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>In Stock</FormLabel>
                        <FormDescription>
                          Is this product available for purchase?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='rating'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (0-5)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          max='5'
                          step='0.1'
                          placeholder='5.0'
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type='submit'>
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
