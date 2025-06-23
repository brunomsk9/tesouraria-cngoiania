
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Home } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminAccessDenied = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <CardTitle className="text-red-600">Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center mb-4">
            Você não tem permissão para acessar a área de administração.
          </p>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Sistema
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
