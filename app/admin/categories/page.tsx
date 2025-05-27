'use client';
import { DashboardSidebar } from '@/components/index';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
import { formatCategoryName } from '../../../utils/categoryFormating';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import CategoryDetailsDialog from '@/components/CategoryDetailsDialog';
import AddCategoryDialog from '@/components/AddCategoryDialog';

const DashboardCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<'view' | 'edit' | null>(null);

  const fetchCategories = () => {
    fetch('http://localhost:3001/api/categories')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenDetails = (categoryId: string, mode: 'view' | 'edit') => {
    setSelectedCategoryId(categoryId);
    setActionMode(mode);
    setIsDetailsOpen(true);
  };

  const handleCategoryUpdate = () => {
    // Refresh category list after update
    fetchCategories();
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/categories/${categoryToDelete}`,
        {
          method: 'DELETE',
        }
      );

      if (response.status === 204) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      toast.error('There was an error while deleting category');
      console.error('Delete error:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className='flex justify-start max-w-screen-2xl mx-auto h-full max-xl:flex-col max-xl:h-fit max-xl:gap-y-4'>
      <DashboardSidebar />
      <div className='flex-1 p-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-3xl'>All Categories</CardTitle>
            <Button onClick={() => setIsAddCategoryOpen(true)}>
              Add new category
            </Button>
          </CardHeader>
          <CardContent className='pt-4'>
            <div className='h-[80vh] overflow-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[50px]'>
                      <Checkbox />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories &&
                    categories.map((category: Category) => (
                      <TableRow key={nanoid()}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          {formatCategoryName(category?.name)}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() =>
                                handleOpenDetails(category.id, 'view')
                              }
                              title='View category details'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() =>
                                handleOpenDetails(category.id, 'edit')
                              }
                              title='Edit category'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleDeleteClick(category.id)}
                              title='Delete category'
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
          </CardContent>
        </Card>
      </div>

      {selectedCategoryId && (
        <CategoryDetailsDialog
          categoryId={selectedCategoryId}
          isOpen={isDetailsOpen}
          setIsOpen={setIsDetailsOpen}
          onCategoryUpdate={handleCategoryUpdate}
          mode={actionMode || 'view'}
        />
      )}

      <AddCategoryDialog
        isOpen={isAddCategoryOpen}
        setIsOpen={setIsAddCategoryOpen}
        onCategoryAdded={handleCategoryUpdate}
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
              category from the database.
              <br />
              <br />
              <span className='text-red-500 font-medium'>
                Warning: If you delete this category, you will delete all
                products associated with it.
              </span>
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

export default DashboardCategory;
