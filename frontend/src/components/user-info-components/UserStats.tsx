import { Badge } from "@/components/ui/badge";
import { UserCheck, Search } from "lucide-react";

interface UserStatsProps {
  totalUsers: number;
  filteredCount: number;
  search: string;
}

export const UserStats: React.FC<UserStatsProps> = ({ totalUsers, filteredCount, search }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        <UserCheck className="h-3 w-3" />
        <span>Total: {totalUsers}</span>
      </Badge>
      {search && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Search className="h-3 w-3" />
          <span>Filtered: {filteredCount}</span>
        </Badge>
      )}
    </div>
  );
};
