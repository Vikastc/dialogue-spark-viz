"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare } from "lucide-react";

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  isOpen,
  onClose,
}) => {
  const handleReviewClick = () => {
    // You can customize this URL or add your review platform
    window.open("https://forms.gle/your-review-form", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5' />
            Thank You for Testing!
          </DialogTitle>
          <DialogDescription>
            You've reached the limit of 3 interactions, your session has expired
            (1 minute), your token limit has been reached, or your trial has
            expired (24 hours).
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Thank you for testing our AI voice agent! We hope you enjoyed the
            experience.
          </p>

          <div className='space-y-3'>
            <p className='text-sm font-medium'>Help us improve:</p>
            <Button
              onClick={handleReviewClick}
              variant='outline'
              className='w-full'
            >
              <Star className='mr-2 h-4 w-4' />
              Leave a Review
            </Button>
          </div>

          <Button onClick={onClose} className='w-full'>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UsageLimitModal;
