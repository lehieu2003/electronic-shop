'use client';
import React, { useEffect, useState } from 'react';
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

interface UserDetailsDialogProps {
  userId: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUserUpdate?: () => void;
  mode?: 'view' | 'edit';
}

const UserDetailsDialog = ({
  userId,
  isOpen,
  setIsOpen,
  onUserUpdate,
  mode = 'view',
}: UserDetailsDialogProps) => {
  const [userInput, setUserInput] = useState<{
    email: string;
    newPassword: string;
    role: string;
  }>({
    email: '',
    newPassword: '',
    role: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(mode === 'view');

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/api/users/${userId}`);
      const data = await response.json();
      setUserInput({
        email: data.email,
        newPassword: '',
        role: data.role,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
      setIsReadOnly(mode === 'view');
    }
  }, [isOpen, userId, mode]);

  const updateUser = async () => {
    if (
      userInput.email.length > 3 &&
      userInput.role.length > 0 &&
      (isReadOnly || userInput.newPassword.length > 0)
    ) {
      if (!isValidEmailAddressFormat(userInput.email)) {
        toast.error('You entered invalid email address format');
        return;
      }

      if (
        !isReadOnly &&
        userInput.newPassword.length > 0 &&
        userInput.newPassword.length < 8
      ) {
        toast.error('Password must be longer than 7 characters');
        return;
      }

      setIsLoading(true);
      try {
        // Only include password in the payload if it was changed
        const payload = {
          email: userInput.email,
          role: userInput.role,
          ...(userInput.newPassword.length > 0 && {
            password: userInput.newPassword,
          }),
        };

        const response = await fetch(
          `http://localhost:3001/api/users/${userId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        if (response.status === 200) {
          toast.success('User successfully updated');
          if (onUserUpdate) onUserUpdate();
          setIsOpen(false);
        } else {
          throw new Error('Error while updating user');
        }
      } catch (error) {
        toast.error('There was an error while updating user');
        console.error('Update error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('For updating a user you must enter all values');
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
            {isReadOnly ? 'User Details' : 'Edit User'}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={userInput.email}
              onChange={(e) =>
                setUserInput({ ...userInput, email: e.target.value })
              }
              readOnly={isReadOnly}
              className={isReadOnly ? 'opacity-70' : ''}
            />
          </div>

          {!isReadOnly && (
            <div className='space-y-2'>
              <Label htmlFor='newPassword'>New Password</Label>
              <Input
                id='newPassword'
                type='password'
                value={userInput.newPassword}
                onChange={(e) =>
                  setUserInput({ ...userInput, newPassword: e.target.value })
                }
                placeholder='Leave empty to keep current password'
              />
              <p className='text-xs text-gray-500'>
                Must be at least 8 characters long. Leave empty to keep current
                password.
              </p>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='role'>User Role</Label>
            {isReadOnly ? (
              <Input
                id='role'
                value={userInput.role}
                readOnly
                className='opacity-70'
              />
            ) : (
              <Select
                value={userInput.role}
                onValueChange={(value) =>
                  setUserInput({ ...userInput, role: value })
                }
                disabled={isReadOnly}
              >
                <SelectTrigger id='role'>
                  <SelectValue placeholder='Select role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='admin'>admin</SelectItem>
                  <SelectItem value='user'>user</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          {isReadOnly ? (
            <Button onClick={handleEnableEdit} variant='outline'>
              Edit User
            </Button>
          ) : (
            <Button onClick={updateUser} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update User'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
