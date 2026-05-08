import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ search, onSearchChange }) => {
  return (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Search by name, email, code, role, or mode..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
  );
};
