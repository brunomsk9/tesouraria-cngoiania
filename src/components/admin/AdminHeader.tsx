
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminHeaderProps {
  profile: {
    name: string;
    role: string;
  } | null;
}

export const AdminHeader = ({ profile }: AdminHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <Shield className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Painel de Administração</h1>
              <p className="text-sm text-gray-500">
                {profile?.role === 'master' ? 'Gestão Master do Sistema' : 'Gestão de Voluntários'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{profile?.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              profile?.role === 'master' 
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {profile?.role === 'master' ? 'Master' : 'Tesoureiro'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
