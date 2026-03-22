import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Calendar, MapPin, Edit, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { doctorService, Doctor } from "@/services/doctorService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const specialties = ["All", "cardiologie", "pediatrie", "dermatologie", "chirurgie generale", "gynecologie", "ophtalmologie", "neurologie", "psychiatrie", "rhumatologie", "orthopedie"];

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    nom: "",
    email: "",
    mot_de_passe: "",
    role: "medecin",
    specialite: "cardiologie"
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getAllDoctors();
      setDoctors(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch doctors');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    try {
      await doctorService.createDoctor(newDoctor);
      setNewDoctor({
        nom: "",
        email: "",
        mot_de_passe: "",
        role: "medecin",
        specialite: "cardiologie"
      });
      setIsAddDialogOpen(false);
      fetchDoctors();
    } catch (err) {
      setError('Failed to add doctor');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorService.deleteDoctor(id);
        setDoctors(doctors.filter(d => d.id_docteur !== id));
      } catch (err) {
        setError('Failed to delete doctor');
        console.error('Error:', err);
      }
    }
  };

  const filtered = doctors.filter((d) => {
    const matchSearch = d.nom.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialty === "All" || d.specialite === specialty;
    return matchSearch && matchSpec;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Loading doctors...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Error: {error}</div>;
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Find a Doctor</h1>
          <p className="text-muted-foreground">Browse our network of healthcare professionals</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">
                  Name
                </Label>
                <Input
                  id="nom"
                  value={newDoctor.nom}
                  onChange={(e) => setNewDoctor({...newDoctor, nom: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mot_de_passe" className="text-right">
                  Password
                </Label>
                <Input
                  id="mot_de_passe"
                  type="password"
                  value={newDoctor.mot_de_passe}
                  onChange={(e) => setNewDoctor({...newDoctor, mot_de_passe: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select value={newDoctor.role} onValueChange={(value) => setNewDoctor({...newDoctor, role: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medecin">Medecin</SelectItem>
                    <SelectItem value="chirurgien">Chirurgien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialite" className="text-right">
                  Specialty
                </Label>
                <Select value={newDoctor.specialite} onValueChange={(value) => setNewDoctor({...newDoctor, specialite: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.filter(s => s !== "All").map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDoctor}>
                Add Doctor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((doc, i) => (
          <motion.div
            key={doc.id_docteur}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-medical flex items-center justify-center text-primary-foreground font-heading font-bold text-lg shrink-0">
                    {doc.nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold truncate">{doc.nom}</h3>
                    <p className="text-sm text-muted-foreground">{doc.specialite}</p>
                    <p className="text-xs text-muted-foreground">{doc.email}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {doc.role}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(doc.id_docteur!)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link to="/consultation"><Calendar className="mr-1 h-3.5 w-3.5" />Consult</Link>
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-medical hover:opacity-90" asChild>
                    <Link to="/appointments">Book Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No doctors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
