import { useState, useEffect } from "react";
import { pharmacyService, Pharmacy } from "../services/pharmacyService";
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
  MapPin, Phone, Clock, TrendingUp, AlertTriangle, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  inStock: boolean;
  description: string;
}


const initialMedicines: Medicine[] = [
  { id: 1, name: "Amoxicillin 500mg", category: "Antibiotics", price: 12.99, stock: 150, inStock: true, description: "Broad-spectrum antibiotic for bacterial infections." },
  { id: 2, name: "Ibuprofen 400mg", category: "Pain Relief", price: 8.49, stock: 300, inStock: true, description: "Anti-inflammatory for pain and fever." },
  { id: 3, name: "Metformin 850mg", category: "Diabetes", price: 15.99, stock: 80, inStock: true, description: "Oral medication for type 2 diabetes." },
  { id: 4, name: "Lisinopril 10mg", category: "Cardiovascular", price: 11.49, stock: 0, inStock: false, description: "ACE inhibitor for blood pressure management." },
  { id: 5, name: "Omeprazole 20mg", category: "Gastrointestinal", price: 9.99, stock: 200, inStock: true, description: "Proton pump inhibitor for acid reflux." },
  { id: 6, name: "Cetirizine 10mg", category: "Allergy", price: 6.99, stock: 450, inStock: true, description: "Antihistamine for allergy symptoms." },
];

const categories = ["Antibiotics", "Pain Relief", "Diabetes", "Cardiovascular", "Gastrointestinal", "Allergy", "Vitamins", "Dermatology"];

const emptyMedicine: Omit<Medicine, "id"> = { name: "", category: "Antibiotics", price: 0, stock: 0, inStock: true, description: "" };
const emptyPharmacy: Omit<Pharmacy, 'id_pharmacie'> = { nom: "", adresse: "", horaireOuverture: "08:00 - 22:00" };

export default function PharmacyAdmin() {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [pharmacyLoading, setPharmacyLoading] = useState(true);
  const [pharmacyError, setPharmacyError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [medForm, setMedForm] = useState(emptyMedicine);
  const [editingMedId, setEditingMedId] = useState<number | null>(null);
  const [medDialogOpen, setMedDialogOpen] = useState(false);
  const [pharmForm, setPharmForm] = useState<Omit<Pharmacy, 'id_pharmacie'>>(emptyPharmacy);
  const [editingPharmId, setEditingPharmId] = useState<number | null>(null);
  const [pharmDialogOpen, setPharmDialogOpen] = useState(false);

  // Fetch pharmacies from backend
  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setPharmacyLoading(true);
      const data = await pharmacyService.getAllPharmacies();
      setPharmacies(data);
      setPharmacyError(null);
    } catch (err) {
      setPharmacyError('Failed to fetch pharmacies');
      console.error('Error:', err);
    } finally {
      setPharmacyLoading(false);
    }
  };

  // Medicine CRUD
  const saveMedicine = () => {
    if (!medForm.name || !medForm.description || medForm.price <= 0) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (editingMedId !== null) {
      setMedicines((prev) => prev.map((m) => (m.id === editingMedId ? { ...medForm, id: editingMedId, inStock: medForm.stock > 0 } : m)));
      toast.success("Medicine updated successfully!");
    } else {
      const newId = Math.max(0, ...medicines.map((m) => m.id)) + 1;
      setMedicines((prev) => [...prev, { ...medForm, id: newId, inStock: medForm.stock > 0 }]);
      toast.success("Medicine added successfully!");
    }
    setMedForm(emptyMedicine);
    setEditingMedId(null);
    setMedDialogOpen(false);
  };

  const editMedicine = (med: Medicine) => {
    setMedForm(med);
    setEditingMedId(med.id);
    setMedDialogOpen(true);
  };

  const deleteMedicine = (id: number) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    toast.success("Medicine removed.");
  };

  // Pharmacy CRUD
  const savePharmacy = async () => {
    if (!pharmForm.nom || !pharmForm.adresse || !pharmForm.horaireOuverture) {
      toast.error("Please fill all required fields.");
      return;
    }
    
    try {
      if (editingPharmId !== null) {
        await pharmacyService.updatePharmacy(editingPharmId, pharmForm);
        toast.success("Pharmacy updated!");
      } else {
        await pharmacyService.createPharmacy(pharmForm);
        toast.success("Pharmacy added!");
      }
      setPharmForm(emptyPharmacy);
      setEditingPharmId(null);
      setPharmDialogOpen(false);
      fetchPharmacies(); // Refresh the list
    } catch (err) {
      toast.error("Failed to save pharmacy");
      console.error('Error:', err);
    }
  };

  const editPharmacy = (ph: Pharmacy) => {
    setPharmForm({
      nom: ph.nom,
      adresse: ph.adresse,
      horaireOuverture: ph.horaireOuverture
    });
    setEditingPharmId(ph.id_pharmacie!);
    setPharmDialogOpen(true);
  };

  const deletePharmacy = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this pharmacy?')) {
      try {
        await pharmacyService.deletePharmacy(id);
        toast.success("Pharmacy removed.");
        fetchPharmacies(); // Refresh the list
      } catch (err) {
        toast.error("Failed to delete pharmacy");
        console.error('Error:', err);
      }
    }
  };

  const filteredMedicines = medicines.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const totalStock = medicines.reduce((sum, m) => sum + m.stock, 0);
  const outOfStock = medicines.filter((m) => !m.inStock).length;
  const lowStock = medicines.filter((m) => m.stock > 0 && m.stock < 50).length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Pharmacy Management</h1>
        <p className="text-muted-foreground">Manage your pharmacies, inventory and medicines</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Medicines", value: medicines.length, icon: Pill, color: "text-primary" },
          { label: "Total Stock", value: totalStock.toLocaleString(), icon: Package, color: "text-secondary" },
          { label: "Out of Stock", value: outOfStock, icon: AlertTriangle, color: "text-destructive" },
          { label: "Pharmacies", value: pharmacies.length, icon: Store, color: "text-primary" },
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
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="medicines" className="gap-2"><Pill className="h-4 w-4" />Medicines</TabsTrigger>
          <TabsTrigger value="pharmacies" className="gap-2"><Store className="h-4 w-4" />Pharmacies</TabsTrigger>
        </TabsList>

        {/* ─── Medicines Tab ─── */}
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
                        <Label>Name *</Label>
                        <Input value={medForm.name} onChange={(e) => setMedForm({ ...medForm, name: e.target.value })} placeholder="e.g. Paracetamol 500mg" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Category</Label>
                          <Select value={medForm.category} onValueChange={(v) => setMedForm({ ...medForm, category: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Price ($) *</Label>
                          <Input type="number" min={0} step={0.01} value={medForm.price || ""} onChange={(e) => setMedForm({ ...medForm, price: parseFloat(e.target.value) || 0 })} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Stock Quantity</Label>
                        <Input type="number" min={0} value={medForm.stock || ""} onChange={(e) => setMedForm({ ...medForm, stock: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description *</Label>
                        <Textarea rows={3} value={medForm.description} onChange={(e) => setMedForm({ ...medForm, description: e.target.value })} placeholder="Brief description…" />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{med.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{med.description}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{med.category}</Badge></TableCell>
                      <TableCell className="text-right font-medium">${med.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{med.stock}</TableCell>
                      <TableCell>
                        {med.stock === 0 ? (
                          <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                        ) : med.stock < 50 ? (
                          <Badge className="text-xs bg-amber-500/15 text-amber-700 border-amber-300">Low Stock</Badge>
                        ) : (
                          <Badge className="text-xs bg-secondary/15 text-secondary border-secondary/30">In Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editMedicine(med)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMedicine(med.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredMedicines.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No medicines found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Pharmacies Tab ─── */}
        <TabsContent value="pharmacies">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-lg font-semibold">Your Pharmacies</h2>
              <p className="text-sm text-muted-foreground">Manage pharmacy locations and operating hours</p>
            </div>
            <Dialog open={pharmDialogOpen} onOpenChange={(open) => { setPharmDialogOpen(open); if (!open) { setPharmForm(emptyPharmacy); setEditingPharmId(null); } }}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-medical hover:opacity-90"><Plus className="h-4 w-4 mr-1" />Add Pharmacy</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading">{editingPharmId ? "Edit Pharmacy" : "Add New Pharmacy"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label>Pharmacy Name *</Label>
                    <Input value={pharmForm.nom} onChange={(e) => setPharmForm({ ...pharmForm, nom: e.target.value })} placeholder="e.g. MedCare Pharmacy" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Address *</Label>
                    <Input value={pharmForm.adresse} onChange={(e) => setPharmForm({ ...pharmForm, adresse: e.target.value })} placeholder="123 Main St, City" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Operating Hours</Label>
                    <Input value={pharmForm.horaireOuverture} onChange={(e) => setPharmForm({ ...pharmForm, horaireOuverture: e.target.value })} placeholder="08:00 - 22:00" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={savePharmacy} className="bg-gradient-medical hover:opacity-90">{editingPharmId ? "Update" : "Add Pharmacy"}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

            {pharmacyLoading ? (
              <div className="flex justify-center p-8">Loading pharmacies...</div>
            ) : pharmacyError ? (
              <div className="text-red-500 p-8">Error: {pharmacyError}</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pharmacies.map((ph, i) => (
                  <motion.div key={ph.id_pharmacie} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="shadow-card hover:shadow-elevated transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center">
                              <Store className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-heading font-semibold">{ph.nom}</h3>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editPharmacy(ph)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deletePharmacy(ph.id_pharmacie!)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{ph.adresse}</div>
                          <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{ph.horaireOuverture}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
