
import { useAuth } from "@/hooks/useAuth";

export const useAdminPermissions = () => {
  const { profile } = useAuth();

  const canManageUsers = profile?.role === 'master';
  const canManageChurches = profile?.role === 'master';
  const canManageVolunteers = profile?.role === 'master' || profile?.role === 'tesoureiro';
  const canManageLogos = profile?.role === 'master' || profile?.role === 'tesoureiro';
  const canManageCultosEventos = profile?.role === 'master' || profile?.role === 'tesoureiro';

  const hasAnyPermission = canManageUsers || canManageChurches || canManageVolunteers || canManageLogos || canManageCultosEventos;

  const getDefaultTab = () => {
    if (canManageUsers) return 'users';
    if (canManageChurches) return 'churches';
    if (canManageVolunteers) return 'volunteers';
    if (canManageCultosEventos) return 'cultos-eventos';
    if (canManageLogos) return 'logos';
    return 'users';
  };

  const getGridCols = () => {
    const tabCount = [canManageUsers, canManageChurches, canManageVolunteers, canManageCultosEventos, canManageLogos].filter(Boolean).length;
    return `grid-cols-${Math.min(tabCount, 5)}`;
  };

  return {
    profile,
    canManageUsers,
    canManageChurches,
    canManageVolunteers,
    canManageLogos,
    canManageCultosEventos,
    hasAnyPermission,
    getDefaultTab,
    getGridCols
  };
};
