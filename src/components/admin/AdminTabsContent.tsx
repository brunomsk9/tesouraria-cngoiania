
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UserManagement } from "@/components/UserManagement";
import { ChurchManagement } from "@/components/ChurchManagement";
import { VolunteerManagement } from "@/components/VolunteerManagement";
import { ChurchLogoManager } from "@/components/ChurchLogoManager";
import { CultosEventosManagement } from "@/components/CultosEventosManagement";

interface Church {
  id: string;
  name: string;
}

interface AdminTabsContentProps {
  canManageUsers: boolean;
  canManageChurches: boolean;
  canManageVolunteers: boolean;
  canManageCultosEventos: boolean;
  canManageLogos: boolean;
  profile: {
    role: string;
    church_id?: string;
  } | null;
  churches: Church[];
}

export const AdminTabsContent = ({
  canManageUsers,
  canManageChurches,
  canManageVolunteers,
  canManageCultosEventos,
  canManageLogos,
  profile,
  churches
}: AdminTabsContentProps) => {
  return (
    <>
      {canManageUsers && (
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      )}
      
      {canManageChurches && (
        <TabsContent value="churches">
          <ChurchManagement />
        </TabsContent>
      )}
      
      {canManageVolunteers && (
        <TabsContent value="volunteers">
          <VolunteerManagement />
        </TabsContent>
      )}

      {canManageCultosEventos && (
        <TabsContent value="cultos-eventos">
          <CultosEventosManagement />
        </TabsContent>
      )}
      
      {canManageLogos && (
        <TabsContent value="logos">
          <div className="space-y-6">
            {profile?.role === 'master' ? (
              // Master pode gerenciar logos de todas as igrejas
              churches.map(church => (
                <ChurchLogoManager
                  key={church.id}
                  churchId={church.id}
                  churchName={church.name}
                />
              ))
            ) : profile?.church_id ? (
              // Tesoureiro só pode gerenciar a logo da própria igreja
              <ChurchLogoManager
                churchId={profile.church_id}
                churchName={churches.find(c => c.id === profile.church_id)?.name || 'Sua Igreja'}
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">
                    Você precisa estar vinculado a uma igreja para gerenciar logos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      )}
    </>
  );
};
