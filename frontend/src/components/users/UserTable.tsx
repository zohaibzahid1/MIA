"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserTableRow } from "./UserTableRow";
import { TooltipProvider } from "@/components/ui/tooltip";

interface UserTableProps {
  users: any[];
  showDeleted: boolean;
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
  onRestore: (userId: number) => void;
  isLoading?: boolean;
}

export function UserTable({
  users,
  showDeleted,
  onEdit,
  onDelete,
  onRestore,
  isLoading,
}: UserTableProps) {
  const caption = showDeleted ? "Deleted users." : "All active users in the system.";
  const visibleDataCols = 5; // Name, Department, Role, Status, Progress (Actions is separate) - removed Email

  // Only show "no users found" message if we're not loading and there are no users
  if (!isLoading && users.length === 0) {
    return (
      <div className="rounded-md border">
        <p className="text-center text-muted-foreground py-8">
          {showDeleted ? "No deleted users found." : "No users found."}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Table>
        <TableCaption>{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Departments</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Reporting To</TableHead>
            <TableHead className="w-[180px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              users={users}
              showDeleted={showDeleted}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
            />
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={visibleDataCols}>Total Users</TableCell>
            <TableCell className="text-right">{users.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TooltipProvider>
  );
}
