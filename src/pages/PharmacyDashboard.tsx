import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Store, Pill, Plus, Pencil, Trash2, Search, Package,
  MapPin, Phone, Clock, TrendingUp, AlertTriangle, CheckCircle2, LogOut, Edit, Save, Mail
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Medicine {
  id_medicament: number;
  id_pharmacie: number;
  nom: string;
  categorie: string;
  prix: number;
  disponibilite: number;
}

const categories = ["Antibiotics", "Pain Relief", "Diabetes", "Cardiovascular", "Gastrointestinal", "Allergy", "Vitamins", "Dermatology"];

const emptyMedicine: Omit<Medicine, "id_medicament" | "id_pharmacie"> = {
  nom: "",
  categorie: "Antibiotics",
  prix: 0,
  disponibilite: 1
};

export default function PharmacyDashboard() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [medForm, setMedForm] = useState(emptyMedicine);
  const [editingMedId, setEditingMedId] = useState<number | null>(null);
  const [medDialogOpen, setMedDialogOpen] = useState(false);
  
  // Get pharmacy data from localStorage (from unified login)
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const pharmacy = userData.role === 'pharmacy' ? userData : null;
  const isAuthenticated = !!pharmacy;
  
  // Pharmacy profile state
  const [profileForm, setProfileForm] = useState({
    nom: pharmacy?.name || "",
    email: pharmacy?.email || "",
    adresse: pharmacy?.address || "",
    horaireOuverture: pharmacy?.openingHours || ""
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    console.log('useEffect triggered:', { isAuthenticated, pharmacy });
    
    if (isAuthenticated && pharmacy && pharmacy.id) {
      console.log('Calling fetchMedicines...');
      fetchMedicines();
      setProfileForm({
        nom: pharmacy.name,
        email: pharmacy.email,
        adresse: pharmacy.address,
        horaireOuverture: pharmacy.openingHours
      });
    } else {
      console.log('Not fetching medicines. isAuthenticated:', isAuthenticated, 'pharmacy:', pharmacy);
    }
  }, [isAuthenticated]); // Only re-run when auth changes, not pharmacy object

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      
      if (!pharmacy?.id) {
        console.error('No pharmacy ID available');
        toast.error('Pharmacy ID not found');
        return;
      }
      
      console.log('Fetching medicines for pharmacy ID:', pharmacy?.id);
      
      const response = await fetch(`http://localhost/heal-u/backend/api/pharmacy_medicines.php?id_pharmacie=${pharmacy?.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Medicines fetched:', data);
      
      setMedicines(data);
      
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const saveMedicine = async () => {
    if (!medForm.nom || medForm.prix <= 0) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const url = editingMedId !== null 
        ? `http://localhost/heal-u/backend/api/pharmacy_medicines.php?id=${editingMedId}`
        : 'http://localhost/heal-u/backend/api/pharmacy_medicines.php';
      
      const method = editingMedId !== null ? 'PUT' : 'POST';
      const body = editingMedId !== null 
        ? medForm 
        : { ...medForm, id_pharmacie: pharmacy?.id };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingMedId ? "Medicine updated successfully!" : "Medicine added successfully!");
        setMedForm(emptyMedicine);
        setEditingMedId(null);
        setMedDialogOpen(false);
        fetchMedicines();
      } else {
        toast.error(data.message || 'Failed to save medicine');
      }
    } catch (error) {
      toast.error('Error saving medicine');
      console.error('Error:', error);
    }
  };

  const editMedicine = (med: Medicine) => {
    setMedForm({
      nom: med.nom,
      categorie: med.categorie,
      prix: med.prix,
      disponibilite: med.disponibilite
    });
    setEditingMedId(med.id_medicament);
    setMedDialogOpen(true);
  };

  const deleteMedicine = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        const response = await fetch(`http://localhost/heal-u/backend/api/pharmacy_medicines.php?id=${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Medicine removed successfully.");
          fetchMedicines();
        } else {
          toast.error(data.message || 'Failed to delete medicine');
        }
      } catch (error) {
        toast.error('Error deleting medicine');
        console.error('Error:', error);
      }
    }
  };

  const updatePharmacyProfile = async () => {
    if (!pharmacy) return;
    
    setSavingProfile(true);
    try {
      const response = await fetch(`http://localhost/heal-u/backend/api/pharmacy_profile.php?id=${pharmacy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Pharmacy profile updated successfully!");
        setEditingProfile(false);
        // Update pharmacy context with new data
        window.location.reload(); // Simple refresh to update context
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
      console.error('Error:', error);
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelProfileEdit = () => {
    setProfileForm({
      nom: pharmacy?.nom || "",
      email: pharmacy?.email || "",
      adresse: pharmacy?.adresse || "",
      horaireOuverture: pharmacy?.horaireOuverture || ""
    });
    setEditingProfile(false);
  };

  const filteredMedicines = medicines.filter((m) => 
    m.nom.toLowerCase().includes(search.toLowerCase()) &&
    m.disponibilite === 1
  );

  const totalMedicines = medicines.filter(m => m.disponibilite === 1).length;
  const unavailableMedicines = medicines.filter((m) => m.disponibilite === 0).length;

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pharmacy Login Required</h1>
          <p className="text-muted-foreground">Please log in to access your pharmacy dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground">Manage your inventory and medicines for {pharmacy?.name}</p>
        </div>
        <Button variant="outline" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Medicines", value: totalMedicines, icon: Pill, color: "text-primary" },
          { label: "Available", value: totalMedicines, icon: Package, color: "text-secondary" },
          { label: "Unavailable", value: unavailableMedicines, icon: AlertTriangle, color: "text-destructive" },
          { label: "Total Items", value: medicines.length, icon: TrendingUp, color: "text-amber-600" },
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

      <Tabs defaultValue="medicines" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="medicines" className="gap-2"><Pill className="h-4 w-4" />Medicines</TabsTrigger>
          <TabsTrigger value="profile" className="gap-2"><Store className="h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Clock className="h-4 w-4" />Settings</TabsTrigger>
        </TabsList>

        {/* Medicines Tab */}
        <TabsContent value="medicines">
          <Card className="shadow-card">
            <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
              <div>
                <CardTitle className="font-heading text-lg">Medicine Inventory</CardTitle>
                <CardDescription>Add, edit or remove medicines from your inventory</CardDescription>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search…" className="pl-10 w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Dialog open={medDialogOpen} onOpenChange={(open) => { setMedDialogOpen(open); if (!open) { setMedForm(emptyMedicine); setEditingMedId(null); } }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-gradient-medical hover:opacity-90"><Plus className="h-4 w-4 mr-1" />Add Medicine</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-heading">{editingMedId ? "Edit Medicine" : "Add New Medicine"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label>Medicine Name *</Label>
                        <Input value={medForm.nom} onChange={(e) => setMedForm({ ...medForm, nom: e.target.value })} placeholder="e.g. Paracetamol 500mg" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Category</Label>
                          <Select value={medForm.categorie} onValueChange={(v) => setMedForm({ ...medForm, categorie: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Price ($) *</Label>
                          <Input type="number" min={0} step={0.01} value={medForm.prix || ""} onChange={(e) => setMedForm({ ...medForm, prix: parseFloat(e.target.value) || 0 })} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Availability</Label>
                        <Select value={medForm.disponibilite.toString()} onValueChange={(v) => setMedForm({ ...medForm, disponibilite: parseInt(v) })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Available</SelectItem>
                            <SelectItem value="0">Unavailable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={saveMedicine} className="bg-gradient-medical hover:opacity-90">{editingMedId ? "Update" : "Add Medicine"}</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">Loading medicines...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedicines.map((med) => (
                      <TableRow key={med.id_medicament}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{med.nom}</p>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{med.categorie}</Badge></TableCell>
                        <TableCell className="text-right font-medium">${med.prix.toFixed(2)}</TableCell>
                        <TableCell>
                          {med.disponibilite === 1 ? (
                            <Badge className="text-xs bg-secondary/15 text-secondary border-secondary/30">Available</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Unavailable</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editMedicine(med)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMedicine(med.id_medicament)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredMedicines.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No medicines found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="shadow-card">
            <CardHeader className="flex-row items-center justify-between space-y-0 gap-4">
              <div>
                <CardTitle className="font-heading text-lg">Pharmacy Profile</CardTitle>
                <CardDescription>Manage your pharmacy information and contact details</CardDescription>
              </div>
              <div className="flex gap-2">
                {editingProfile ? (
                  <>
                    <Button variant="outline" size="sm" onClick={cancelProfileEdit}>
                      Cancel
                    </Button>
                    <Button size="sm" className="bg-gradient-medical hover:opacity-90" onClick={updatePharmacyProfile} disabled={savingProfile}>
                      <Save className="h-4 w-4 mr-1" />{savingProfile ? "Saving..." : "Save"}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                    <Edit className="h-4 w-4 mr-1" />Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Pharmacy Name</Label>
                    {editingProfile ? (
                      <Input 
                        value={profileForm.nom} 
                        onChange={(e) => setProfileForm({...profileForm, nom: e.target.value})}
                        placeholder="Enter pharmacy name"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <Store className="h-4 w-4 text-primary" />
                        <span className="font-medium">{pharmacy?.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label>Email Address</Label>
                    {editingProfile ? (
                      <Input 
                        type="email"
                        value={profileForm.email} 
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="font-medium">{pharmacy?.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Address</Label>
                    {editingProfile ? (
                      <Textarea 
                        value={profileForm.adresse} 
                        onChange={(e) => setProfileForm({...profileForm, adresse: e.target.value})}
                        placeholder="Enter pharmacy address"
                        rows={3}
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{pharmacy?.adresse}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label>Operating Hours</Label>
                    {editingProfile ? (
                      <Input 
                        value={profileForm.horaireOuverture} 
                        onChange={(e) => setProfileForm({...profileForm, horaireOuverture: e.target.value})}
                        placeholder="e.g. 08:00 - 22:00"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">{pharmacy?.horaireOuverture}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Pharmacy Settings</CardTitle>
              <CardDescription>Configure your pharmacy operating hours and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Operating Hours</h4>
                      <p className="text-sm text-muted-foreground">Current: {pharmacy?.horaireOuverture}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                      <Clock className="h-4 w-4 mr-1" />Update Hours
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Contact Information</h4>
                      <p className="text-sm text-muted-foreground">Email: {pharmacy?.email}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                      <Edit className="h-4 w-4 mr-1" />Edit Contact
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Location</h4>
                      <p className="text-sm text-muted-foreground">{pharmacy?.adresse}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                      <MapPin className="h-4 w-4 mr-1" />Update Location
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
