"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface UserDeleteDialogProps {
  isManager: boolean;
  userName: string;
  onDelete: () => void;
  onGoDepartments: () => void;
}

export function UserDeleteDialog({
  isManager,
  userName,
  onDelete,
  onGoDepartments,
}: UserDeleteDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete user">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {isManager ? (
            <>
              <AlertDialogTitle>Department locked</AlertDialogTitle>
              <AlertDialogDescription>
                {userName ? `${userName}'s` : "This manager's"} department cannot be deleted here.
                Please manage department assignments on the Departments page.
              </AlertDialogDescription>
            </>
          ) : (
            <>
              <AlertDialogTitle>Delete user?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The user will be marked as deleted.
              </AlertDialogDescription>
            </>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {isManager ? (
            <AlertDialogAction onClick={onGoDepartments}>
              Go to Departments
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={onDelete}>
              Yes, Delete
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
