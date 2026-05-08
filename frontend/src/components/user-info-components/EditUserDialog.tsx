import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pencil, AlertCircle, Hash, UserCheck, Mail } from "lucide-react";
import { ALLOWED_ROLES } from "@/types/userManagementTypes";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  editData: any;
  onEditDataChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  employeeCodeError: string;
  isChanged: boolean;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  editData,
  onEditDataChange,
  onSave,
  onCancel,
  isSaving,
  employeeCodeError,
  isChanged,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:w-96 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pencil className="h-5 w-5" />
            <span>Edit Employee</span>
          </DialogTitle>
          <DialogDescription>Update {user.name || "this employee"}'s information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Hash className="h-3 w-3" />
                <span>Employee Code</span>
              </label>
              <Input
                value={editData.employeeCode || ""}
                onChange={(e) => onEditDataChange("employeeCode", e.target.value)}
                placeholder="Enter employee code"
                className={employeeCodeError ? "border-red-500" : ""}
              />
              {employeeCodeError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{employeeCodeError}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <UserCheck className="h-3 w-3" />
                <span>Name</span>
              </label>
              <Input
                value={editData.name || ""}
                onChange={(e) => onEditDataChange("name", e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>Email</span>
              </label>
              <Input
                type="email"
                value={editData.email || ""}
                onChange={(e) => onEditDataChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={editData.role || ""}
                onValueChange={(value) => onEditDataChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <Input
                value={editData.EmployeeMode || ""}
                onChange={(e) => onEditDataChange("EmployeeMode", e.target.value)}
                placeholder="Enter employee mode"
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={!isChanged || isSaving || !!employeeCodeError} className="min-w-[80px]">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
