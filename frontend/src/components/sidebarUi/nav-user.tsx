"use client"

import { useRouter } from 'next/navigation';
import { useStore } from '@/context/storeContext';
import {
  ChevronsUpDown,
  LogOut,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    employeeCode?: string
    role?: string
    EmployeeMode?: string
  }
}) {
  const { isMobile } = useSidebar();
  const { authStore } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    authStore.logout();
    router.push('/auth');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                    <DialogDescription>
                      Basic details of your account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Name:</span>
                      <span>{user.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Email:</span>
                      <span className="text-muted-foreground">{user.email}</span>
                    </div>
                    {user.employeeCode && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Employee Code:</span>
                        <span>{user.employeeCode}</span>
                      </div>
                    )}
                    {user.role && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Role:</span>
                        <span className="capitalize">{user.role}</span>
                      </div>
                    )}
                    {user.EmployeeMode && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Mode:</span>
                        <span>{user.EmployeeMode}</span>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
