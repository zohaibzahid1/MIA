"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AllUserStore } from "@/stores/allUserStore";
import { observer } from "mobx-react-lite";
import { User } from "@/stores/userStore";

type SelectDeptValue = number | null;

interface Department {
  id: number;
  name: string;
  deletedAt?: Date | string | null;
}

interface UserDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  departments: Department[];
  allUserStore: AllUserStore;
}

export const UserDepartmentDialog = observer(({
  open,
  onOpenChange,
  user,
  departments,
  allUserStore,
}: UserDepartmentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [unassigningIds, setUnassigningIds] = useState<Set<number>>(new Set());
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<SelectDeptValue>(null);
  const [localUserDepts, setLocalUserDepts] = useState<Department[]>([]);

  // Initialize local departments when user changes or dialog opens
  useEffect(() => {
    if (user?.departments) {
      setLocalUserDepts(user.departments);
    }
  }, [user?.departments]);

  // Assign a department
  const handleAssignDepartment = async () => {
    if (!user || !selectedDepartmentId) return;
    
    // Find the department to add
    const departmentToAdd = departments.find(d => d.id === selectedDepartmentId);
    if (!departmentToAdd) return;

    // Immediately update local state
    setLocalUserDepts(current => [...current, departmentToAdd]);
    setLoading(true);
    
    try {
      await allUserStore.assignUserToDepartment(user.id, selectedDepartmentId);
      await allUserStore.fetchUsers();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to assign department:", error);
      // Restore original state if there's an error
      if (user.departments) {
        setLocalUserDepts(user.departments);
      }
    } finally {
      setLoading(false);
      setSelectedDepartmentId(null);
    }
  };

  // Unassign a department
  const handleUnassignDepartment = async (deptId: number) => {
    if (!user) {
      console.error("No user selected for unassigning department");
      return;
    }
    
    // Immediately update local state for instant UI feedback
    setLocalUserDepts(current => current.filter(dept => dept.id !== deptId));
    setUnassigningIds((prev) => new Set(prev).add(deptId));
    
    try {
      await allUserStore.unassignUserToDepartment(user.id, deptId);
      await allUserStore.fetchUsers();
    } catch (error) {
      console.error("Failed to unassign department:", error);
      // Restore the department in case of error
      if (user.departments) {
        setLocalUserDepts(user.departments);
      }
    } finally {
      setUnassigningIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(deptId);
        return newSet;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Department</DialogTitle>
          <DialogDescription>
            Manage user's department assignments
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Left side: Enrolled Departments */}
          <div className="space-y-2">
            <Label>Enrolled Departments</Label>
            <div className="rounded-md border">
              <Command shouldFilter>
                <CommandInput placeholder="Search enrolled departments..." />
                <ScrollArea className="h-[400px]">
                  <CommandList>
                    <CommandEmpty>No enrolled departments found.</CommandEmpty>
                    <CommandGroup>
                      {localUserDepts.length > 0 ? (
                        localUserDepts.map((dept: Department) => (
                          <CommandItem
                            key={dept.id}
                            value={dept.name}
                            className="flex items-center justify-between"
                          >
                            <span className="font-medium">{dept.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async (e) => {
                                e.preventDefault();
                                await handleUnassignDepartment(dept.id);
                              }}
                              className="h-8 px-2"
                              disabled={unassigningIds.has(dept.id)}
                            >
                              {unassigningIds.has(dept.id)
                                ? "Unassigning..."
                                : "Unassign"}
                            </Button>
                          </CommandItem>
                        ))
                      ) : (
                        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                          No departments enrolled
                        </div>
                      )}
                    </CommandGroup>
                  </CommandList>
                </ScrollArea>
              </Command>
            </div>
          </div>

          {/* Right side: Available Departments */}
          <div className="space-y-2">
            <Label>Available Departments</Label>
            <div className="rounded-md border">
              <Command shouldFilter>
                <CommandInput placeholder="Search departments..." />
                <ScrollArea className="h-[400px]">
                  <CommandList>
                    <CommandEmpty>No departments found.</CommandEmpty>
                    <CommandGroup>
                      {departments
                        .filter((d) => !d.deletedAt)
                        .map((d) => {
                          const isSelected = selectedDepartmentId === d.id;
                          const isEnrolled = localUserDepts.some(
                            (ud) => ud.id === d.id
                          );

                          return (
                            <CommandItem
                              key={d.id}
                              value={`${d.name} ${d.id}`}
                              onSelect={() => setSelectedDepartmentId(d.id)}
                              className={cn(
                                isEnrolled ? "opacity-50" : "",
                                "cursor-pointer"
                              )}
                              disabled={isEnrolled}
                            >
                              <div className="flex w-full items-center justify-between">
                                <span className="truncate">{d.name}</span>
                                {isSelected ? (
                                  <Check className="h-4 w-4" />
                                ) : null}
                              </div>
                            </CommandItem>
                          );
                        })}
                    </CommandGroup>
                  </CommandList>
                </ScrollArea>
              </Command>
            </div>
          </div>

          {/* Selected department info */}
          <div className="col-span-2 text-sm text-muted-foreground">
            Selected:{" "}
            {selectedDepartmentId
              ? departments.find((d) => d.id === selectedDepartmentId)?.name ??
                `Department ${selectedDepartmentId}`
              : "None"}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignDepartment}
            disabled={!selectedDepartmentId || loading}
          >
            {loading ? "Saving..." : "Assign Department"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
