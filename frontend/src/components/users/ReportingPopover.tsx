"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandGroup, CommandEmpty } from "@/components/ui/command";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: number;
  name: string;
  departments?: ({ id: number; name: string } | number)[];
  reportingTo?: {
    id: number;
    name: string;
    email?: string;
  } | null;
}

interface Props {
  user: User;
  users: User[];
  disabled?: boolean;
  onSave: (userId: number, reportingToId: number | null) => Promise<void>;
  onRemove?: (userId: number) => Promise<void>;
}

export default function ReportingPopover({ user, users, disabled, onSave, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [localReportingTo, setLocalReportingTo] = useState(user.reportingTo);
  const [selected, setSelected] = useState<number | null>(user.reportingTo?.id ?? null);
  const { toast } = useToast();

  useEffect(() => {
    setLocalReportingTo(user.reportingTo);
    setSelected(user.reportingTo?.id ?? null);
  }, [user.reportingTo]);

  const userDeptIds = Array.isArray(user.departments)
    ? user.departments.map(d => (typeof d === 'object' ? d.id : d))
    : [];

  const candidates = users.filter(u => {
    if (u.id === user.id) return false;

    // Always include the current reporting manager in the list
    if (localReportingTo && u.id === localReportingTo.id) return true;

    const candidateDeptIds = Array.isArray(u.departments)
      ? u.departments.map(d => (typeof d === 'object' ? d.id : d))
      : [];
    
    const hasCommonDepartment = userDeptIds.some(id => candidateDeptIds.includes(id));

    return hasCommonDepartment && u.name.toLowerCase().includes(query.toLowerCase());
  });

  const handleSave = async () => {
    if (!selected) return;

    const previousReportingTo = localReportingTo;
    const selectedPerson = users.find(u => u.id === selected);

    if (!selectedPerson) {
      toast({
        title: "Error",
        description: "Selected user not found.",
        variant: "destructive",
      });
      return;
    }

    // Optimistic UI update
    setLocalReportingTo(selectedPerson);

    try {
      await onSave(Number(user.id), selected);
      toast({
        title: "Success",
        description: `Successfully assigned ${selectedPerson.name} as reporting manager for ${user.name}`,
        duration: 3000,
      });
      setOpen(false);
    } catch (error) {
      // Rollback on failure
      setLocalReportingTo(previousReportingTo);
      toast({
        title: "Error",
        description: "Failed to update reporting person. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error saving reporting person:", error);
    }
  };

  const handleClear = async () => {
    const previousReportingTo = localReportingTo;
    // Optimistic UI update
    setLocalReportingTo(null);
    setSelected(null);

    try {
      if (onRemove) {
        await onRemove(Number(user.id));
      } else {
        await onSave(Number(user.id), null);
      }
      toast({
        title: "Success",
        description: `Successfully cleared reporting person for ${user.name}`,
        duration: 3000,
      });
      setOpen(false);
    } catch (error) {
      // Rollback on failure
      setLocalReportingTo(previousReportingTo);
      toast({
        title: "Error",
        description: "Failed to clear reporting person. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error clearing reporting person:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-full justify-between", 
            localReportingTo ? "text-gray-900" : "text-gray-500"
          )} 
          disabled={disabled}
        >
          <span className="truncate">
            {localReportingTo?.name || "No reporting manager"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        <div className="space-y-2">
          {localReportingTo && (
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-md border">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium">Currently reports to: {localReportingTo.name}</span>
            </div>
          )}
          
          <Command>
            <CommandInput placeholder="Search new reporting person..." value={query} onValueChange={setQuery} />
            <CommandEmpty>No person found in this department.</CommandEmpty>
            <CommandGroup>
              {candidates.map(c => (
                <CommandItem 
                  key={c.id}
                  value={c.id.toString()}
                  onSelect={() => {
                    setSelected(c.id);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selected === c.id ? "opacity-100" : "opacity-0")} />
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>

        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClear} 
            disabled={!localReportingTo}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={!selected || selected === localReportingTo?.id}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Save Changes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
