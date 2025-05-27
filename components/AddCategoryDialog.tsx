'use client';
import React, { useState } from 'react';
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
import { convertCategoryNameToURLFriendly } from '../utils/categoryFormating';

interface AddCategoryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCategoryAdded?: () => void;
}

const AddCategoryDialog = ({
  isOpen,
  setIsOpen,
  onCategoryAdded,
}: AddCategoryDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categoryInput, setCategoryInput] = useState({
    name: '',
  });

  const resetForm = () => {
    setCategoryInput({
      name: '',
    });
  };

  const addNewCategory = async () => {
    if (!categoryInput.name.trim()) {
      toast.error('You need to enter a category name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: convertCategoryNameToURLFriendly(categoryInput.name),
        }),
      });

      if (response.status === 201) {
        toast.success('Category added successfully');
        resetForm();
        setIsOpen(false);
        if (onCategoryAdded) onCategoryAdded();
      } else {
        throw new Error('Error creating category');
      }
    } catch (error) {
      toast.error('There was an error while creating category');
      console.error('Create error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm();
        setIsOpen(open);
      }}
    >
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Add New Category
          </DialogTitle>
          <DialogDescription>
            Add a new product category to your store
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='categoryName'>Category Name</Label>
            <Input
              id='categoryName'
              placeholder='Enter category name'
              value={categoryInput.name}
              onChange={(e) =>
                setCategoryInput({ ...categoryInput, name: e.target.value })
              }
            />
            <p className='text-xs text-gray-500'>
              The name will be converted to a URL-friendly format for storage.
            </p>
          </div>

          {categoryInput.name && (
            <div className='space-y-2'>
              <Label>Preview</Label>
              <div className='p-2 border rounded-md bg-gray-50'>
                <p className='font-medium'>{categoryInput.name}</p>
                <p className='text-xs text-gray-500 font-mono'>
                  {convertCategoryNameToURLFriendly(categoryInput.name)}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={addNewCategory} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
