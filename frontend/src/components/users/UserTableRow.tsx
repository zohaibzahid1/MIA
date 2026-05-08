"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BarChart3, ChevronDown, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useRouter } from 'next/navigation';
import ReportingPopover from "./ReportingPopover";

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
import { useStore } from '@/context/storeContext';


interface UserTableRowProps {
  user: any;
  users?: any[];
  showDeleted: boolean;
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
  onRestore: (userId: number) => void;
}

export function UserTableRow({
  user,
  users = [],
  showDeleted,
  onDelete,
  onRestore,
}: UserTableRowProps) {
  const router = useRouter();
    const { allUserStore,userStore } = useStore();

  const roleText = (user?.role || "employee").toString();
  const isManager = roleText.toLowerCase() === "manager";

  return (
    <TableRow className={user.deletedAt ? "opacity-80" : ""}>
      <TableCell className="font-medium">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">{user.name}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{user.email}</p>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`text-center min-w-[65px] ${(user.departments?.length || 0) === 0 ? 'text-muted-foreground' : ''}`}
          >
            {user.departments?.length || 0} {(user.departments?.length || 0) === 1 ? 'Dept' : 'Depts'}
          </Badge>
          {(user.departments?.length || 0) > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-accent"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-64 p-0" 
                side="right"
                align="start"
              >
                <div className="p-2">
                  <div className="font-medium text-sm px-2 py-1.5 border-b">
                    {user.name}'s Departments ({user.departments?.length})
                  </div>
                  <div className="mt-2 space-y-1">
                    {user.departments?.map((dept: any) => (
                      <div 
                        key={dept.id} 
                        className="text-sm px-2 py-1.5 text-foreground hover:bg-accent rounded-sm transition-colors"
                      >
                        {dept.name}
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={`capitalize ${
            isManager
              ? "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100"
              : ""
          }`}
        >
          {roleText || "default"}
        </Badge>
      </TableCell>
      <TableCell>
        {/* Status column */}
        <Badge
          variant="secondary"
          className={`capitalize ${
            user.status?.status === "Completed"
              ? "bg-green-50 text-green-700 border border-green-200"
              : user.status?.status === "In Progress"
              ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
              : "bg-gray-50 text-gray-700 border border-gray-200"
          }`}
        >
          {user.status?.status || "Pending"}
        </Badge>
      </TableCell>
      <TableCell className="w-[140px]">
        <div className="flex items-center gap-2">
          <Progress value={user.status?.progress ?? 0} className="w-20 h-1.5" />
          <span className="text-xs text-muted-foreground min-w-[28px]">
            {user.status?.progress ?? 0}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <ReportingPopover 
          user={user} 
          users={users} 
          disabled={showDeleted || !user.departments?.length} 
          onSave={async (userId: number, reportingToId: number | null) => {
            const { allUserStore } = await import("@/stores/allUserStore");
            await allUserStore.assignReportingTo(userId, reportingToId);
          }}
          onRemove={async (userId: number) => {
            const { allUserStore } = await import("@/stores/allUserStore");
            await allUserStore.removeReporting(userId);
          }}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {!showDeleted && (
            <>
              {/* Edit */}
              {
                !userStore.isManager && 
                (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit department"
                    onClick={() => {allUserStore.openDeptDialogForUser(user)}}
                  >

                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit department</TooltipContent>
              </Tooltip>
                )
              }



              {/* View Progress */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="View progress"
                    onClick={() => {
                      router.push(`/dashboard/user-details?userId=${user.id}`);
                    }}
                  >
                    <BarChart3 className="h-4 w-4 text-emerald-700" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Progress</TooltipContent>
              </Tooltip>
            </>
          )}

          {showDeleted ? (
            // Restore button
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Restore user"
                  onClick={() => onRestore(user.id)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Restore this user</TooltipContent>
            </Tooltip>
          ) : (
            // Delete with confirmation dialog
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete user"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete user</TooltipContent>
              </Tooltip>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete {user.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will soft delete the user.  
                    You can restore them later from the deleted users tab.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => onDelete(user)}
                  >
                    Confirm Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}