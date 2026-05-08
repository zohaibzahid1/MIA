"use client";

import { cn } from "@/lib/utils";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2 as CheckCircle2Icon,
  AlertCircle as AlertCircleIcon,
  Popcorn as PopcornIcon,
} from "lucide-react";
//importing the CSV component to use in header
import CsvUpload from "@/components/users/CsvUpload";
import { useStore } from "@/context/storeContext";
import { UserRole } from "@/stores/userStore";
import { observer } from "mobx-react-lite";

interface UserHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  showDeleted: boolean;
  onToggleDeleted: (value: boolean) => void;
  banner: {
    kind: "success" | "error" | "info";
    title: string;
    desc?: string;
  } | null;
  onBannerClose: () => void;
}

export const UserHeader = observer(function UserHeader({
  search,
  setSearch,
  showDeleted,
  onToggleDeleted,
  banner,
  onBannerClose,
}: UserHeaderProps) {
  const { userStore } = useStore();

  // Hide CSV upload for managers
  const showCsvUpload = userStore.user?.role !== UserRole.MANAGER;

  return (
    <CardHeader className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Search, view progress, soft-delete & restore accounts.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="users-deleted-toggle">Deleted</Label>
          <Switch
            id="users-deleted-toggle"
            checked={showDeleted}
            onCheckedChange={onToggleDeleted}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
          <Input
            className="pl-9"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      {showCsvUpload && (
        <div>
          <CsvUpload />
        </div>
      )}

      <div className="h-[72px] relative">
        {banner ? (
          <Alert
            variant={banner.kind === "error" ? "destructive" : "default"}
            className={cn(
              "cursor-pointer absolute w-full transition-opacity duration-200",
              banner.kind === "success" && "border-green-500 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 [&>svg]:text-green-500",
              banner.kind === "error" && "border-red-500"
            )}
            onClick={onBannerClose}
          >
            {banner.kind === "success" ? (
              <CheckCircle2Icon className="h-4 w-4" />
            ) : banner.kind === "error" ? (
              <AlertCircleIcon className="h-4 w-4" />
            ) : (
              <PopcornIcon className="h-4 w-4" />
            )}
            <AlertTitle>{banner.title}</AlertTitle>
            {banner.desc ? <AlertDescription>{banner.desc}</AlertDescription> : null}
          </Alert>
        ) : null}
      </div>
    </CardHeader>
  );
});
