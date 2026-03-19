import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

const existingAppointments = [
  { id: 1, doctor: "Dr. Sarah Johnson", specialty: "Cardiology", date: "2026-03-22", time: "10:00 AM", status: "Confirmed" },
  { id: 2, doctor: "Dr. Michael Chen", specialty: "Dermatology", date: "2026-03-25", time: "02:00 PM", status: "Pending" },
];

export default function Appointments() {
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const { toast } = useToast();

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Appointment Booked!", description: `With ${doctor} on ${date} at ${time}` });
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
                    <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson - Cardiology</SelectItem>
                    <SelectItem value="Dr. Michael Chen">Dr. Michael Chen - Dermatology</SelectItem>
                    <SelectItem value="Dr. James Wilson">Dr. James Wilson - Neurology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Time Slot</Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={time === slot ? "default" : "outline"}
                      size="sm"
                      className={time === slot ? "bg-gradient-medical" : ""}
                      onClick={() => setTime(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-medical hover:opacity-90">
                Book Appointment
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Appointments */}
        <div>
          <h2 className="font-heading text-xl font-semibold mb-4">Your Appointments</h2>
          <div className="space-y-4">
            {existingAppointments.map((apt, i) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading font-semibold">{apt.doctor}</h3>
                        <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {apt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {apt.time}
                          </span>
                        </div>
                      </div>
                      <Badge className={apt.status === "Confirmed" ? "bg-secondary" : "bg-accent text-accent-foreground"}>
                        {apt.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
