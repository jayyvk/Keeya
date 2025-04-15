
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRandomWord } from "@/utils/randomWord";
import { useToast } from "@/hooks/use-toast";

interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
}

const DeleteDialog = ({ isOpen, onOpenChange, onConfirmDelete }: DeleteDialogProps) => {
  const [deleteWord, setDeleteWord] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setDeleteWord(generateRandomWord(10));
      setDeleteConfirmation("");
    }
  }, [isOpen]);

  const handleDelete = () => {
    if (deleteConfirmation !== deleteWord) {
      toast({
        variant: "destructive",
        title: "Invalid confirmation",
        description: "The confirmation word does not match. Please try again.",
      });
      return;
    }

    onConfirmDelete();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Voice Memory</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>This action cannot be undone. Please enter this word to confirm deletion:</p>
            <div className="p-2 bg-gray-100 rounded font-mono text-center text-lg">
              {deleteWord}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Enter the confirmation word"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="font-mono"
          />
        </div>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={() => {
            onOpenChange(false);
            setDeleteConfirmation("");
          }}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!deleteConfirmation}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
