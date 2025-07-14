import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">404</CardTitle>
            <CardDescription className="text-muted-foreground">
              Halaman yang Anda cari tidak ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
            <p className="text-muted-foreground mb-6">
              Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau URL yang Anda masukkan salah.
            </p>
            <Link to="/">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
