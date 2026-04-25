import { useState, useEffect } from "react";
import { cabinetService, Cabinet } from "../services/cabinetService";
import { doctorService, Doctor } from "../services/doctorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building, Plus, Pencil, Trash2, MapPin, Phone, Clock, Stethoscope,
  Calendar, Users, Star, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const specialties = [
  "General Medicine", "Cardiology", "Pediatrics", "Dermatology", 
  "Orthopedics", "Neurology", "Psychiatry", "Gynecology",
  "Ophthalmology", "ENT", "Dentistry", "Emergency Medicine"
];

const workingHours = [
  "08:00 - 12:00", "08:00 - 16:00", "09:00 - 17:00", "10:00 - 18:00",
  "08:00 - 20:00", "24/7", "08:00 - 14:00", "14:00 - 20:00"
];

const emptyCabinet: Omit<Cabinet, 'id_cabinet' | 'created_at' | 'updated_at'> = {
  id_docteur: 0,
  nom_cabinet: "",
  adresse: "",
  telephone: "",
  horaire_travail: "08:00 - 16:00",
  specialite: "General Medicine"
};

export default function DoctorCabinet() {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number>(0);
  const [cabinetDialogOpen, setCabinetDialogOpen] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);
  const [cabinetForm, setCabinetForm] = useState<Omit<Cabinet, 'id_cabinet' | 'created_at' | 'updated_at'>>(emptyCabinet);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cabinetsData, doctorsData] = await Promise.all([
        cabinetService.getAllCabinets(),
        doctorService.getAllDoctors()
      ]);
      setCabinets(cabinetsData);
      setDoctors(doctorsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCabinet = async () => {
    if (!cabinetForm.nom_cabinet || !cabinetForm.adresse || !cabinetForm.id_docteur) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      if (editingCabinet) {
        await cabinetService.updateCabinet(editingCabinet.id_cabinet!, cabinetForm);
        toast.success("Cabinet updated successfully!");
      } else {
        await cabinetService.createCabinet(cabinetForm);
        toast.success("Cabinet created successfully!");
      }
      setCabinetForm(emptyCabinet);
      setEditingCabinet(null);
      setCabinetDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to save cabinet");
      console.error('Error:', err);
    }
  };

  const editCabinet = (cabinet: Cabinet) => {
    setCabinetForm({
      id_docteur: cabinet.id_docteur,
      nom_cabinet: cabinet.nom_cabinet,
      adresse: cabinet.adresse,
      telephone: cabinet.telephone || "",
      horaire_travail: cabinet.horaire_travail,
      specialite: cabinet.specialite
    });
    setEditingCabinet(cabinet);
    setCabinetDialogOpen(true);
  };

  const deleteCabinet = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this cabinet?')) {
      try {
        await cabinetService.deleteCabinet(id);
        toast.success("Cabinet deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete cabinet");
        console.error('Error:', err);
      }
    }
  };

  const filteredCabinets = selectedDoctor === 0 
    ? cabinets 
    : cabinets.filter(c => c.id_docteur === selectedDoctor);

  const cabinetStats = {
    total: cabinets.length,
    bySpecialty: cabinets.reduce((acc, cabinet) => {
      acc[cabinet.specialite] = (acc[cabinet.specialite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Doctor Cabinet Management</h1>
        <p className="text-muted-foreground">Manage medical cabinets, schedules, and doctor assignments</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Cabinets", value: cabinetStats.total, icon: Building, color: "text-primary" },
          { label: "Active Doctors", value: doctors.length, icon: Stethoscope, color: "text-blue-600" },
          { label: "Specialties", value: Object.keys(cabinetStats.bySpecialty).length, icon: Star, color: "text-amber-600" },
          { label: "24/7 Service", value: cabinets.filter(c => c.horaire_travail === "24/7").length, icon: Clock, color: "text-green-600" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="cabinets" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="cabinets" className="gap-2">
            <Building className="h-4 w-4" />Cabinets
          </TabsTrigger>
          <TabsTrigger value="doctors" className="gap-2">
            <Stethoscope className="h-4 w-4" />Doctors
          </TabsTrigger>
        </TabsList>

        {/* Cabinets Tab */}
        <TabsContent value="cabinets">
          <Card className="shadow-card">
            <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
              <div>
                <CardTitle className="font-heading text-lg">Medical Cabinets</CardTitle>
                <CardDescription>Manage cabinet locations and operating hours</CardDescription>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Select value={selectedDoctor.toString()} onValueChange={(v) => setSelectedDoctor(parseInt(v))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Doctors</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id_docteur} value={doctor.id_docteur!.toString()}>
                        {doctor.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={cabinetDialogOpen} onOpenChange={(open) => { 
                  setCabinetDialogOpen(open); 
                  if (!open) { 
                    setCabinetForm(emptyCabinet); 
                    setEditingCabinet(null); 
                  } 
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-gradient-medical hover:opacity-90">
                      <Plus className="h-4 w-4 mr-1" />Add Cabinet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-heading">
                        {editingCabinet ? "Edit Cabinet" : "Add New Cabinet"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label>Cabinet Name *</Label>
                        <Input 
                          value={cabinetForm.nom_cabinet} 
                          onChange={(e) => setCabinetForm({ ...cabinetForm, nom_cabinet: e.target.value })} 
                          placeholder="e.g. City Medical Center" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Doctor *</Label>
                        <Select value={cabinetForm.id_docteur.toString()} onValueChange={(v) => setCabinetForm({ ...cabinetForm, id_docteur: parseInt(v) })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id_docteur} value={doctor.id_docteur!.toString()}>
                                {doctor.nom} - {doctor.specialite}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Address *</Label>
                        <Input 
                          value={cabinetForm.adresse} 
                          onChange={(e) => setCabinetForm({ ...cabinetForm, adresse: e.target.value })} 
                          placeholder="123 Main St, City" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Phone</Label>
                        <Input 
                          value={cabinetForm.telephone} 
                          onChange={(e) => setCabinetForm({ ...cabinetForm, telephone: e.target.value })} 
                          placeholder="+1 234 567 8900" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Specialty *</Label>
                          <Select value={cabinetForm.specialite} onValueChange={(v) => setCabinetForm({ ...cabinetForm, specialite: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {specialties.map((specialty) => (
                                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Working Hours</Label>
                          <Select value={cabinetForm.horaire_travail} onValueChange={(v) => setCabinetForm({ ...cabinetForm, horaire_travail: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {workingHours.map((hours) => (
                                <SelectItem key={hours} value={hours}>{hours}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={saveCabinet} className="bg-gradient-medical hover:opacity-90">
                          {editingCabinet ? "Update" : "Create"} Cabinet
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">Loading cabinets...</div>
              ) : error ? (
                <div className="text-red-500 p-8">Error: {error}</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCabinets.map((cabinet, i) => (
                    <motion.div key={cabinet.id_cabinet} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                      <Card className="shadow-card hover:shadow-elevated transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center">
                                <Building className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-heading font-semibold">{cabinet.nom_cabinet}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {doctors.find(d => d.id_docteur === cabinet.id_docteur)?.nom}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editCabinet(cabinet)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteCabinet(cabinet.id_cabinet!)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {cabinet.adresse}
                            </div>
                            {cabinet.telephone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {cabinet.telephone}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {cabinet.horaire_travail}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {cabinet.specialite}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {filteredCabinets.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No cabinets found.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Available Doctors</CardTitle>
              <CardDescription>View all doctors and their specialties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doctor, i) => (
                  <motion.div key={doctor.id_docteur} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="shadow-card hover:shadow-elevated transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-heading font-semibold">{doctor.nom}</h3>
                            <p className="text-sm text-muted-foreground">{doctor.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {doctor.specialite}
                        </Badge>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {cabinets.filter(c => c.id_docteur === doctor.id_docteur).length} cabinet(s)
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {doctors.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No doctors available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
