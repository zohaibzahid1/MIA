import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function UserTableSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-4">
        {/* Header section with title and toggle */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[100px]" /> {/* Title */}
            <Skeleton className="h-4 w-[300px]" /> {/* Description */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-[60px]" /> {/* Toggle label */}
            <Skeleton className="h-6 w-[42px] rounded-full" /> {/* Toggle switch */}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        {/* CSV upload area */}
        <div>
          <Skeleton className="h-9 w-[120px]" />
        </div>

        {/* Alert placeholder */}
        <div className="h-[72px]" />
      </CardHeader>

      <CardContent>
        {/* Table skeleton */}
        <div className="rounded-md border">
          {/* Table header */}
          <div className="flex items-center gap-4 border-b px-4 py-3">
            <Skeleton className="h-5 w-[140px]" /> {/* Name column */}
            <Skeleton className="h-5 w-[160px]" /> {/* Email column */}
            <Skeleton className="h-5 w-[120px]" /> {/* Role column */}
            <Skeleton className="h-5 w-[140px]" /> {/* Department column */}
          </div>

          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
            >
              <Skeleton className="h-6 w-[140px]" /> {/* Name */}
              <Skeleton className="h-6 w-[160px]" /> {/* Email */}
              <Skeleton className="h-6 w-[120px]" /> {/* Role */}
              <Skeleton className="h-6 w-[140px]" /> {/* Department */}
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-8 w-8" /> {/* Edit button */}
                <Skeleton className="h-8 w-8" /> {/* Delete button */}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
