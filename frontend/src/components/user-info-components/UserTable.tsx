import * as React from "react";
import { observer } from "mobx-react-lite";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Users,
  AlertCircle,
  UserCheck,
  Mail,
  Hash,
  Trash2,
} from "lucide-react";
import { useStore } from "@/context/storeContext";
import { useToast } from "@/components/ui/use-toast";
import { getRoleBadgeVariant, getModeBadgeVariant, getRoleLabel } from "@/utils/userManagementUtils";
import { EditableRowProps } from "@/types/userManagementTypes";
import { EditUserDialog } from "./EditUserDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";

interface UserTableProps {
  filteredUsers: any[];
  search: string;
  totalUsers: number;
  showDeleted: boolean;
  onShowDeletedChange: (value: boolean) => void;
  loadingUsers: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

export const UserTable: React.FC<UserTableProps> = ({
  filteredUsers,
  search,
  totalUsers,
  showDeleted,
  onShowDeletedChange,
  loadingUsers,
  error,
  onRefresh,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Employee Directory</span>
            </CardTitle>
            <CardDescription>
              {search
                ? `Showing ${filteredUsers.length} of ${totalUsers} employees matching "${search}"`
                : `Showing all ${totalUsers} registered employees`}
            </CardDescription>
          </div>

          <div className="flex items-center ml-auto space-x-2">
            <Switch
              id="deleted-users-toggle"
              checked={showDeleted}
              onCheckedChange={onShowDeletedChange}
            />
            <Label htmlFor="deleted-users-toggle">Deleted Users</Label>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Loading */}
        {loadingUsers && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading employees...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch the data</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">Error Loading Data</h3>
              <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            </div>
            <Button onClick={onRefresh} variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Table */}
        {!loadingUsers && !error && (
          <>
            {filteredUsers.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Hash className="h-4 w-4 hidden sm:block" />
                          <span>Code</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold min-w-[200px] hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">Role</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap hidden sm:table-cell">
                        Mode
                      </TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any, index: number) => (
                      <EditableRow key={user.id} user={user} index={index} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-semibold">No employees found</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {search
                      ? `No employees match your search "${search}". Try adjusting your search terms.`
                      : "No employees have been registered yet."}
                  </p>
                </div>
                {search && (
                  <Button variant="outline" onClick={() => {}} className="mt-4">
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Editable Row Component
const EditableRow: React.FC<EditableRowProps> = observer(({ user }) => {
  const { allUserStore } = useStore();
  const { toast } = useToast();

  const [editData, setEditData] = React.useState({ ...user });
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editEmployeeCodeError, setEditEmployeeCodeError] = React.useState("");

  React.useEffect(() => {
    if (editData.employeeCode && editData.employeeCode.trim()) {
      const isDuplicate = allUserStore.users.some(
        (u: any) =>
          u.employeeCode?.toLowerCase() === editData.employeeCode.toLowerCase().trim() &&
          u.id !== user.id
      );
      setEditEmployeeCodeError(
        isDuplicate ? "This employee code already exists. Please choose a different one." : ""
      );
    } else {
      setEditEmployeeCodeError("");
    }
  }, [editData.employeeCode, allUserStore.users, user.id]);

  const isChanged =
    editData.name !== user.name ||
    editData.email !== user.email ||
    editData.role !== user.role ||
    editData.employeeCode !== user.employeeCode ||
    editData.EmployeeMode !== user.EmployeeMode;

  const handleChange = (field: string, value: string) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (editEmployeeCodeError) {
      toast({
        title: "Validation Error",
        description: "Please fix the employee code error first.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await allUserStore.editEmployeeDetails(user.id, {
        name: editData.name,
        email: editData.email,
        role: editData.role,
        employeeCode: editData.employeeCode,
        EmployeeMode: editData.EmployeeMode,
      });
      toast({ title: "Success", description: `${editData.name}'s details updated successfully.` });
      setEditOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update user details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...user });
    setEditOpen(false);
  };

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-mono text-sm">
        {user.employeeCode ? (
          <Badge variant="outline" className="font-mono text-xs sm:text-sm">
            {user.employeeCode}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="font-medium min-w-[180px]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="truncate">{user.name || "Unknown"}</span>
            <span className="text-xs text-muted-foreground md:hidden truncate">{user.email}</span>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm truncate">{user.email}</span>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize text-xs whitespace-nowrap">
          {getRoleLabel(user.role) || "Unassigned"}
        </Badge>
      </TableCell>

      <TableCell className="hidden sm:table-cell">
        {user.EmployeeMode ? (
          <Badge
            variant={getModeBadgeVariant(user.EmployeeMode)}
            className="capitalize text-xs whitespace-nowrap"
          >
            {user.EmployeeMode}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {user.deletedAt ? (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await allUserStore.restoreUser(user.id);
                  toast({ title: "Success", description: `${user.name} has been restored successfully.` });
                } catch {
                  toast({
                    title: "Error",
                    description: "Failed to restore user. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Restore
            </Button>
          ) : (
            <>
              <DeleteUserDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                userName={user.name}
                onDelete={async () => {
                  try {
                    await allUserStore.softDeleteUser(user.id);
                    toast({ title: "Success", description: `${user.name} has been deleted successfully.` });
                  } catch {
                    toast({
                      title: "Error",
                      description: "Failed to delete user. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              />

              <EditUserDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                user={user}
                editData={editData}
                onEditDataChange={handleChange}
                onSave={handleSave}
                onCancel={handleCancel}
                isSaving={saving}
                employeeCodeError={editEmployeeCodeError}
                isChanged={isChanged}
              />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});
