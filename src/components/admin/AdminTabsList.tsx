
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, UserCheck, Calendar, Image } from "lucide-react";

interface AdminTabsListProps {
  canManageUsers: boolean;
  canManageChurches: boolean;
  canManageVolunteers: boolean;
  canManageCultosEventos: boolean;
  canManageLogos: boolean;
  gridCols: string;
}

export const AdminTabsList = ({
  canManageUsers,
  canManageChurches,
  canManageVolunteers,
  canManageCultosEventos,
  canManageLogos,
  gridCols
}: AdminTabsListProps) => {
  return (
    <TabsList className={`grid w-full ${gridCols} max-w-3xl mx-auto mb-6`}>
      {canManageUsers && (
        <TabsTrigger value="users" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Usuários</span>
        </TabsTrigger>
      )}
      {canManageChurches && (
        <TabsTrigger value="churches" className="flex items-center space-x-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Igrejas</span>
        </TabsTrigger>
      )}
      {canManageVolunteers && (
        <TabsTrigger value="volunteers" className="flex items-center space-x-2">
          <UserCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Voluntários</span>
        </TabsTrigger>
      )}
      {canManageCultosEventos && (
        <TabsTrigger value="cultos-eventos" className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Cultos/Eventos</span>
        </TabsTrigger>
      )}
      {canManageLogos && (
        <TabsTrigger value="logos" className="flex items-center space-x-2">
          <Image className="h-4 w-4" />
          <span className="hidden sm:inline">Logos</span>
        </TabsTrigger>
      )}
    </TabsList>
  );
};
