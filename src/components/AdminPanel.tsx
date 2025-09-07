"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, RefreshCw, Shield } from "lucide-react";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: () => void;
  onRevokeUser?: (email: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onClearData,
  onRevokeUser,
}) => {
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const ADMIN_PASSWORD = "lmntrix124"; // Change this to a secure password

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid admin password");
    }
  };

  const handleClearAllData = () => {
    onClearData();
    setIsAuthenticated(false);
    setAdminPassword("");
    onClose();
  };

  const handleResetTrial = (email: string) => {
    localStorage.removeItem(`voiceAgent_trial_${email}`);
    localStorage.removeItem(`voiceAgent_revoked_${email}`);
    alert(`Trial reset for ${email}`);
  };

  const handleRevokeUser = (email: string) => {
    if (onRevokeUser) {
      onRevokeUser(email);
      alert(`User ${email} has been revoked`);
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Admin Access
            </DialogTitle>
            <DialogDescription>
              Enter admin password to access management panel.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='admin-password'>Admin Password</Label>
              <Input
                id='admin-password'
                type='password'
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder='Enter admin password'
                onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
              />
            </div>

            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleAdminLogin} className='w-full'>
              Access Admin Panel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Admin Panel
          </DialogTitle>
          <DialogDescription>
            Manage user trials and clear all data.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <Alert>
            <AlertDescription>
              <strong>Warning:</strong> These actions cannot be undone.
            </AlertDescription>
          </Alert>

          <div className='space-y-3'>
            <h4 className='font-medium'>Reset User Trials</h4>
            <div className='space-y-2'>
              {[
                "test1@example.com",
                "test2@example.com",
                "admin@example.com",
              ].map((email) => (
                <div
                  key={email}
                  className='flex items-center justify-between p-2 border rounded'
                >
                  <span className='text-sm'>{email}</span>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleResetTrial(email)}
                    >
                      <RefreshCw className='h-4 w-4 mr-1' />
                      Reset
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() => handleRevokeUser(email)}
                    >
                      <Trash2 className='h-4 w-4 mr-1' />
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-3'>
            <h4 className='font-medium'>Clear All Data</h4>
            <Button
              onClick={handleClearAllData}
              variant='destructive'
              className='w-full'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Clear All User Data
            </Button>
          </div>

          <Button onClick={onClose} variant='outline' className='w-full'>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
