
import { Tabs } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabsList } from "@/components/admin/AdminTabsList";
import { AdminTabsContent } from "@/components/admin/AdminTabsContent";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AdminLoadingSpinner } from "@/components/admin/AdminLoadingSpinner";

interface Church {
  id: string;
  name: string;
}

const Admin = () => {
  const {
    profile,
    canManageUsers,
    canManageChurches,
    canManageVolunteers,
    canManageLogos,
    canManageCultosEventos,
    hasAnyPermission,
    getDefaultTab,
    getGridCols
  } = useAdminPermissions();

  const [churches, setChurches] = useState<Church[]>([]);

  useEffect(() => {
    if (profile?.role === 'master') {
      loadChurches();
    }
  }, [profile]);

  const loadChurches = async () => {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setChurches(data || []);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
    }
  };

  if (!profile) {
    return <AdminLoadingSpinner />;
  }

  if (!hasAnyPermission) {
    return <AdminAccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <AdminHeader profile={profile} />

      <main className="max-w-7xl mx-auto py-6">
        <Tabs defaultValue={getDefaultTab()} className="w-full">
          <AdminTabsList
            canManageUsers={canManageUsers}
            canManageChurches={canManageChurches}
            canManageVolunteers={canManageVolunteers}
            canManageCultosEventos={canManageCultosEventos}
            canManageLogos={canManageLogos}
            gridCols={getGridCols()}
          />
          
          <AdminTabsContent
            canManageUsers={canManageUsers}
            canManageChurches={canManageChurches}
            canManageVolunteers={canManageVolunteers}
            canManageCultosEventos={canManageCultosEventos}
            canManageLogos={canManageLogos}
            profile={profile}
            churches={churches}
          />
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
