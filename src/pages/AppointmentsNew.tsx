import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { rendezvousService, RendezVous } from "@/services/rendezvousService";
import { doctorService } from "@/services/doctorService";

const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

export default function Appointments() {
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await rendezvousService.getAllRendezVous();
      setAppointments(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch appointments", variant: "destructive" });
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getAllDoctors();
      setDoctors(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch doctors", variant: "destructive" });
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedDoctor = doctors.find(d => d.nom === doctor);
      await rendezvousService.createRendezVous({
        date_rdv: date,
        heure: time,
        statut: "scheduled",
        id_docteur: selectedDoctor?.id_docteur,
      });
      toast({ title: "Appointment Booked!", description: `With ${doctor} on ${date} at ${time}` });
      fetchAppointments();
      setDoctor("");
      setDate("");
      setTime("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to book appointment", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold mb-2">Appointments</h1>
      <p className="text-muted-foreground mb-8">Schedule and manage your medical appointments</p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Booking Form */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Book Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBook} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Doctor</Label>
                <Select value={doctor} onValueChange={setDoctor}>
                  <SelectTrigger><SelectValue placeholder="Choose a doctor" /></SelectTrigger>
                  <SelectContent>
                    {doctors.map((doc) => (
                      <SelectItem key={doc.id_docteur} value={doc.nom}>
                        {doc.nom} - {doc.specialite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              
              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger><SelectValue placeholder="Choose time" /></SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full">
                Book Appointment
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Appointments */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Your Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <motion.div
                  key={appointment.id_rdv}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{appointment.docteur_nom || "Doctor"}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.date_rdv} at {appointment.heure}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.statut)}>
                    {appointment.statut}
                  </Badge>
                </motion.div>
              ))}
              {appointments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No appointments scheduled
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
