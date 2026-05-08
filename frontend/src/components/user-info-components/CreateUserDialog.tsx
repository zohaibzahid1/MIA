import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, AlertCircle, Hash, UserCheck, Mail } from "lucide-react";
import { NewUserData, ALLOWED_ROLES } from "@/types/userManagementTypes";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (data: NewUserData) => Promise<void>;
  employeeCodeError: string;
  isCreating: boolean;
  newUserData: NewUserData;
  onNewUserDataChange: (field: keyof NewUserData, value: string) => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  onCreateUser,
  employeeCodeError,
  isCreating,
  newUserData,
  onNewUserDataChange,
}) => {
  const handleCreateUser = async () => {
    await onCreateUser(newUserData);
  };

  const handleCancelCreate = () => {
    onNewUserDataChange("name", "");
    onNewUserDataChange("email", "");
    onNewUserDataChange("role", "");
    onNewUserDataChange("employeeCode", "");
    onNewUserDataChange("EmployeeMode", "");
    onOpenChange(false);
  };

  const isCreateFormValid =
    Boolean(newUserData.name.trim()) &&
    Boolean(newUserData.email.trim()) &&
    Boolean(newUserData.role.trim()) &&
    Boolean(newUserData.employeeCode.trim()) &&
    Boolean(newUserData.EmployeeMode.trim()) &&
    !employeeCodeError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:w-96 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Employee</span>
          </DialogTitle>
          <DialogDescription>Enter the details for the new employee. All fields are required.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Hash className="h-3 w-3" />
                <span>Employee Code *</span>
              </label>
              <Input
                value={newUserData.employeeCode}
                onChange={(e) => onNewUserDataChange("employeeCode", e.target.value)}
                placeholder="Enter employee code"
                className={
                  employeeCodeError || !newUserData.employeeCode.trim()
                    ? "border-red-200 focus:border-red-500"
                    : ""
                }
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
                <span>Name *</span>
              </label>
              <Input
                value={newUserData.name}
                onChange={(e) => onNewUserDataChange("name", e.target.value)}
                placeholder="Enter full name"
                className={!newUserData.name.trim() ? "border-red-200 focus:border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>Email *</span>
              </label>
              <Input
                type="email"
                value={newUserData.email}
                onChange={(e) => onNewUserDataChange("email", e.target.value)}
                placeholder="Enter email address"
                className={!newUserData.email.trim() ? "border-red-200 focus:border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role *</label>
              <Select
                value={newUserData.role}
                onValueChange={(value) => onNewUserDataChange("role", value)}
              >
                <SelectTrigger className={!newUserData.role.trim() ? "border-red-200" : ""}>
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
              <label className="text-sm font-medium">Mode *</label>
              <Input
                value={newUserData.EmployeeMode}
                onChange={(e) => onNewUserDataChange("EmployeeMode", e.target.value)}
                placeholder="Enter employee mode (e.g., active, inactive)"
                className={!newUserData.EmployeeMode.trim() ? "border-red-200 focus:border-red-500" : ""}
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelCreate}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={!isCreateFormValid || isCreating} className="min-w-[100px]">
              {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Employee
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
