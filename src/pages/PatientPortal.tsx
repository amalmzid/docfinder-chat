import { useState, useEffect } from "react";
import { doctorService, Doctor } from "../services/doctorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, MapPin, Phone, Clock, Star, Calendar, MessageCircle,
  Stethoscope, Filter, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import MedicalChatbot from "@/components/MedicalChatbot";

interface Appointment {
  id_rdv: number;
  id_patient: number;
  id_docteur: number;
  date_rdv: string;
  heure: string;
  statut: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  doctor_name: string;
  specialite: string;
}

export default function PatientPortal() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    date_rdv: "",
    motif: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('State changed:', { loading, error, doctorsCount: doctors.length });
  }, [loading, error, doctors]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const doctorsData = await doctorService.getAllDoctors();
      console.log('Doctors data received:', doctorsData);
      console.log('Doctors count:', doctorsData.length);
      setDoctors(doctorsData);
      console.log('Loading state before setDoctors:', loading);

      // Fetch patient appointments if logged in
      if (token && userId) {
        try {
          const appointmentsResponse = await fetch(`http://localhost/heal-u/backend/api/appointments.php?patient_id=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const appointmentsData = await appointmentsResponse.json();
          
          if (appointmentsData.success) {
            // API already provides doctor_name and specialite, no enrichment needed
            setMyAppointments(appointmentsData.appointments);
          }
        } catch (error) {
          console.error('Error fetching appointments:', error);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load doctors. Please try again later.');
    } finally {
      setLoading(false);
      console.log('Loading set to false in finally block');
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    try {
      const matchesSearch = doctor.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialite.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "all" || doctor.specialite === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    } catch (error) {
      console.error('Error filtering doctor:', doctor, error);
      return false;
    }
  });

  const specialties = [...new Set(doctors.map(d => d.specialite).filter(Boolean))];
  console.log('Specialties calculated:', specialties);

  const bookAppointment = async () => {
    if (!selectedDoctor || !appointmentForm.date_rdv || !appointmentForm.motif) {
      toast.error("Please fill all required fields.");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.error('Authentication required. Please login.');
        return;
      }

      const appointmentData = {
        id_patient: parseInt(userId),
        id_docteur: selectedDoctor.id_docteur,
        date_rdv: appointmentForm.date_rdv,
        motif: appointmentForm.motif,
        statut: 'pending'
      };

      const response = await fetch('http://localhost/heal-u/backend/api/appointments.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Appointment request submitted successfully!");
        setAppointmentDialogOpen(false);
        setAppointmentForm({ date_rdv: "", motif: "" });
        setSelectedDoctor(null);
        // Refresh data to show the new appointment
        fetchData();
      } else {
        toast.error(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Patient Portal</h1>
        <p className="text-muted-foreground">Find doctors and manage your healthcare appointments</p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="shadow-card mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading patient portal...</span>
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

      {/* Search Bar */}
      {!loading && (
        <Card className="shadow-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors by name or specialty..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && (
        <Tabs defaultValue="doctors" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="doctors" className="gap-2">
            <Stethoscope className="h-4 w-4" />Doctors
          </TabsTrigger>
          <TabsTrigger value="my-appointments" className="gap-2">
            <Calendar className="h-4 w-4" />My Appointments
          </TabsTrigger>
        </TabsList>

        {/* Doctors Tab */}
        <TabsContent value="doctors">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Available Doctors</CardTitle>
              <CardDescription>Find and book appointments with healthcare professionals</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">Loading doctors...</div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDoctors.map((doctor, i) => (
                      <motion.div key={doctor.id_docteur} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <Card className="shadow-card hover:shadow-elevated transition-shadow">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center">
                                  <Stethoscope className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-heading font-semibold">{doctor.nom}</h3>
                                  <p className="text-sm text-muted-foreground">{doctor.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-medium">4.8</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs mb-3">
                              {doctor.specialite}
                            </Badge>
                            <Button 
                              size="sm" 
                              className="w-full bg-gradient-medical hover:opacity-90"
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setAppointmentDialogOpen(true);
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-1" />Book Appointment
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  {filteredDoctors.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No doctors found matching your criteria.
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Appointments Tab */}
        <TabsContent value="my-appointments">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">My Appointments</CardTitle>
              <CardDescription>View and manage your upcoming and past appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">Loading appointments...</div>
              ) : (
                <div className="space-y-4">
                  {myAppointments.map((appointment) => (
                    <motion.div key={appointment.id_rdv} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="shadow-card">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center">
                                <Stethoscope className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-heading font-semibold">{appointment.doctor_name}</h3>
                                <p className="text-sm text-muted-foreground">{appointment.specialite}</p>
                              </div>
                            </div>
                            <Badge 
                              variant={appointment.statut === 'completed' ? 'default' : 
                                      appointment.statut === 'cancelled' ? 'destructive' : 
                                      appointment.statut === 'confirmed' ? 'secondary' : 'outline'}
                            >
                              {appointment.statut}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(appointment.date_rdv).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {appointment.heure}
                            </div>
                          </div>
                          {appointment.statut === 'pending' && (
                            <Button size="sm" variant="destructive" className="w-full">
                              Cancel Appointment
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {myAppointments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      You haven't booked any appointments yet.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}

      {/* Appointment Dialog */}
      <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Book Appointment</DialogTitle>
          </DialogHeader>
          {selectedDoctor && (
            <div className="grid gap-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{selectedDoctor.nom}</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.specialite}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Appointment Date *</Label>
                <Input 
                  type="datetime-local" 
                  value={appointmentForm.date_rdv} 
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, date_rdv: e.target.value })} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Reason for Visit *</Label>
                <Textarea 
                  rows={3} 
                  value={appointmentForm.motif} 
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, motif: e.target.value })} 
                  placeholder="Describe your symptoms or reason for consultation..." 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setAppointmentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={bookAppointment} className="bg-gradient-medical hover:opacity-90">
                  Book Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Medical Chatbot */}
      <MedicalChatbot />
    </div>
  );
}
