'use client';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import {
  formatCategoryName,
  convertCategoryNameToURLFriendly,
} from '../utils/categoryFormating';

interface CategoryDetailsDialogProps {
  categoryId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCategoryUpdate?: () => void;
  mode?: 'view' | 'edit';
}

const CategoryDetailsDialog = ({
  categoryId,
  isOpen,
  setIsOpen,
  onCategoryUpdate,
  mode = 'view',
}: CategoryDetailsDialogProps) => {
  const [categoryInput, setCategoryInput] = useState<{
    name: string;
    originalName: string;
  }>({
    name: '',
    originalName: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(mode === 'view');

  const fetchCategoryData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/categories/${categoryId}`
      );
      const data = await response.json();
      setCategoryInput({
        name: formatCategoryName(data.name),
        originalName: data.name,
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category details');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (isOpen && categoryId) {
      fetchCategoryData();
      setIsReadOnly(mode === 'view');
    }
  }, [isOpen, categoryId, mode, fetchCategoryData]);

  const updateCategory = async () => {
    if (!categoryInput.name.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/categories/${categoryId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: convertCategoryNameToURLFriendly(categoryInput.name),
          }),
        }
      );

      if (response.status === 200) {
        toast.success('Category successfully updated');
        if (onCategoryUpdate) onCategoryUpdate();
        setIsOpen(false);
      } else {
        throw new Error('Error updating category');
      }
    } catch (error) {
      toast.error('There was an error while updating the category');
      console.error('Update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to edit mode
  const handleEnableEdit = () => {
    setIsReadOnly(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {isReadOnly ? 'Category Details' : 'Edit Category'}
          </DialogTitle>
          {isReadOnly && (
            <DialogDescription>
              View details for this category
            </DialogDescription>
          )}
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Category Name</Label>
            <Input
              id='name'
              value={categoryInput.name}
              onChange={(e) =>
                setCategoryInput({ ...categoryInput, name: e.target.value })
              }
              readOnly={isReadOnly}
              className={isReadOnly ? 'opacity-70' : ''}
            />
            {!isReadOnly && (
              <p className='text-xs text-gray-500'>
                The name will be converted to a URL-friendly format for storage.
              </p>
            )}
          </div>

          {isReadOnly && (
            <div className='space-y-2'>
              <Label>URL Format</Label>
              <Input
                value={categoryInput.originalName}
                readOnly
                className='opacity-70 font-mono text-sm'
              />
              <p className='text-xs text-gray-500'>
                This is how the category name is stored in the database.
              </p>
            </div>
          )}
        </div>

        {!isReadOnly && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Note: if you change this category, it will affect all products
              associated with it.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          {isReadOnly ? (
            <Button onClick={handleEnableEdit} variant='outline'>
              Edit Category
            </Button>
          ) : (
            <Button onClick={updateCategory} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Category'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDetailsDialog;
