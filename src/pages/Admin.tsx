
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AdminLoadingSpinner } from "@/components/admin/AdminLoadingSpinner";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UserManagement } from "@/components/UserManagement";
import { ChurchManagement } from "@/components/ChurchManagement";
import { VolunteerManagement } from "@/components/VolunteerManagement";
import { ChurchLogoManager } from "@/components/ChurchLogoManager";
import { CultosEventosManagement } from "@/components/CultosEventosManagement";
import { Button } from "@/components/ui/button";

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
    hasAnyPermission
  } = useAdminPermissions();

  const [churches, setChurches] = useState<Church[]>([]);
  const [activeSection, setActiveSection] = useState<string>('dashboard');

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

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return canManageUsers ? <UserManagement /> : null;
      case 'churches':
        return canManageChurches ? <ChurchManagement /> : null;
      case 'volunteers':
        return canManageVolunteers ? <VolunteerManagement /> : null;
      case 'cultos-eventos':
        return canManageCultosEventos ? <CultosEventosManagement /> : null;
      case 'logos':
        return canManageLogos ? (
          <div className="space-y-6">
            {profile?.role === 'master' ? (
              churches.map(church => (
                <ChurchLogoManager
                  key={church.id}
                  churchId={church.id}
                  churchName={church.name}
                />
              ))
            ) : profile?.church_id ? (
              <ChurchLogoManager
                churchId={profile.church_id}
                churchName={churches.find(c => c.id === profile.church_id)?.name || 'Sua Igreja'}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                Você precisa estar vinculado a uma igreja para gerenciar logos.
              </div>
            )}
          </div>
        ) : null;
      default:
        return (
          <AdminDashboard 
            onSectionChange={setActiveSection}
            canManageUsers={canManageUsers}
            canManageChurches={canManageChurches}
            canManageVolunteers={canManageVolunteers}
            canManageCultosEventos={canManageCultosEventos}
            canManageLogos={canManageLogos}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <AdminHeader profile={profile} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeSection !== 'dashboard' && (
          <div className="mb-6">
            <Button 
              onClick={() => setActiveSection('dashboard')}
              variant="outline"
              className="mb-4"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default Admin;
