'use client';
import { DashboardSidebar } from '@/components/index';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
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
import UserDetailsDialog from '@/components/UserDetailsDialog';
import AddUserDialog from '@/components/AddUserDialog';

const DashboardUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [actionMode, setActionMode] = useState<'view' | 'edit' | null>(null);

  const fetchUsers = () => {
    // sending API request for all users
    fetch('http://localhost:3001/api/users')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDetails = (userId: number, mode: 'view' | 'edit') => {
    setSelectedUserId(userId);
    setActionMode(mode);
    setIsDetailsOpen(true);
  };

  const handleUserUpdate = () => {
    // Refresh user list after update
    fetchUsers();
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/users/${userToDelete}`,
        {
          method: 'DELETE',
        }
      );

      if (response.status === 204) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      toast.error('There was an error while deleting user');
      console.error('Delete error:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className='flex justify-start max-w-screen-2xl mx-auto h-full max-xl:flex-col max-xl:h-fit max-xl:gap-y-4'>
      <DashboardSidebar />
      <div className='flex-1 p-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-3xl'>All users</CardTitle>
            <Button onClick={() => setIsAddUserOpen(true)}>Add new user</Button>
          </CardHeader>
          <CardContent className='pt-4'>
            <div className='h-[80vh] overflow-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[50px]'>
                      <Checkbox />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users &&
                    users.map((user) => (
                      <TableRow key={nanoid()}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>{user?.email}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              user?.role === 'admin'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user?.role}
                          </span>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleOpenDetails(user.id, 'view')}
                              title='View user details'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleOpenDetails(user.id, 'edit')}
                              title='Edit user'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleDeleteClick(user.id)}
                              title='Delete user'
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

      {selectedUserId && (
        <UserDetailsDialog
          userId={selectedUserId}
          isOpen={isDetailsOpen}
          setIsOpen={setIsDetailsOpen}
          onUserUpdate={handleUserUpdate}
          mode={actionMode || 'view'}
        />
      )}

      <AddUserDialog
        isOpen={isAddUserOpen}
        setIsOpen={setIsAddUserOpen}
        onUserAdded={handleUserUpdate}
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
              user from the database.
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

export default DashboardUsers;
