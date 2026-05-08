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
} from "@/components/ui/alert-dialog";

interface ManagerAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  managerName: string;
  onClose: () => void;
  onGoDepartments: () => void;
}

export function ManagerAlertDialog({
  open,
  onOpenChange,
  managerName,
  onClose,
  onGoDepartments,
}: ManagerAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Department locked</AlertDialogTitle>
          <AlertDialogDescription>
            {managerName ? `${managerName}'s` : "This manager's"} department cannot be edited here.
            Please update manager assignments on the Managers page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
          <AlertDialogAction onClick={onGoDepartments}>
            Go to Departments
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
