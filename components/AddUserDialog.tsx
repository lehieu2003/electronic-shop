'use client';
import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isValidEmailAddressFormat } from '@/lib/utils';

interface AddUserDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUserAdded?: () => void;
}

const AddUserDialog = ({
  isOpen,
  setIsOpen,
  onUserAdded,
}: AddUserDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState({
    email: '',
    password: '',
    role: 'user',
  });

  const resetForm = () => {
    setUserInput({
      email: '',
      password: '',
      role: 'user',
    });
  };

  const addNewUser = async () => {
    if (
      userInput.email.length > 3 &&
      userInput.role.length > 0 &&
      userInput.password.length > 0
    ) {
      if (!isValidEmailAddressFormat(userInput.email)) {
        toast.error('You entered invalid email address format');
        return;
      }

      if (userInput.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userInput),
        });

        if (response.status === 201) {
          toast.success('User added successfully');
          resetForm();
          setIsOpen(false);
          if (onUserAdded) onUserAdded();
        } else {
          throw new Error('Error while creating user');
        }
      } catch (error) {
        toast.error('Error while creating user');
        console.error('Create error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('You must enter all input values to add a user');
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
          <DialogTitle className='text-2xl font-bold'>Add New User</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='add-email'>Email</Label>
            <Input
              id='add-email'
              type='email'
              placeholder='Enter email address'
              value={userInput.email}
              onChange={(e) =>
                setUserInput({ ...userInput, email: e.target.value })
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='add-password'>Password</Label>
            <Input
              id='add-password'
              type='password'
              placeholder='Enter password'
              value={userInput.password}
              onChange={(e) =>
                setUserInput({ ...userInput, password: e.target.value })
              }
            />
            <p className='text-xs text-gray-500'>
              Must be at least 8 characters long.
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='add-role'>User Role</Label>
            <Select
              value={userInput.role}
              onValueChange={(value) =>
                setUserInput({ ...userInput, role: value })
              }
            >
              <SelectTrigger id='add-role'>
                <SelectValue placeholder='Select role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='admin'>admin</SelectItem>
                <SelectItem value='user'>user</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={addNewUser} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
