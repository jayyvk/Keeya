
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
import { RefreshCw } from "lucide-react";

interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
}

const DeleteDialog = ({ isOpen, onOpenChange, onConfirmDelete }: DeleteDialogProps) => {
  const [deleteWord, setDeleteWord] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { toast } = useToast();

  const generateNewWord = () => {
    setDeleteWord(generateRandomWord(10));
    setDeleteConfirmation(""); // Reset confirmation input when generating a new word
  };

  useEffect(() => {
    if (isOpen) {
      generateNewWord();
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
          <AlertDialogDescription>
            This action cannot be undone. Please enter this word to confirm deletion:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex items-center justify-between p-2 bg-gray-100 rounded font-mono text-center text-lg mb-4">
          <span className="flex-1 text-center">{deleteWord}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={generateNewWord}
            title="Generate new confirmation code"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div>
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
