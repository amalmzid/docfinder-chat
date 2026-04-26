import { useState, useEffect } from "react";
import { doctorService, Doctor } from "../services/doctorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PatientPortalDebug() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const doctorsData = await doctorService.getAllDoctors();
      console.log('Doctors data received:', doctorsData);
      setDoctors(doctorsData);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load doctors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Patient Portal Debug</h1>
        <p className="text-muted-foreground">Debug version - no authentication required</p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="shadow-card mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading doctors...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && !loading && (
        <Card className="shadow-card mb-8 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {!loading && !error && (
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Current state of the component</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading.toString()}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
              <p><strong>Doctors Count:</strong> {doctors.length}</p>
              <p><strong>First Doctor:</strong> {doctors.length > 0 ? JSON.stringify(doctors[0]) : 'None'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctors List */}
      {!loading && !error && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Available Doctors</CardTitle>
            <CardDescription>Found {doctors.length} doctors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <Card key={doctor.id_docteur} className="shadow-card">
                  <CardContent className="p-5">
                    <div className="mb-3">
                      <h3 className="font-heading font-semibold">{doctor.nom}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs mb-3">
                      {doctor.specialite}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      <p>Role: {doctor.role}</p>
                      <p>ID: {doctor.id_docteur}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {doctors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No doctors found.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
