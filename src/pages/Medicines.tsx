import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Pill, Package, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Medicine {
  id_medicament: string;
  nom: string;
  categorie: string;
  prix: string;
  disponibilite: string;
  id_pharmacie: string;
  pharmacy_name: string;
}

export default function Medicines() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async (searchTerm?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = searchTerm 
        ? `http://localhost/heal-u/backend/api/medicines.php?search=${encodeURIComponent(searchTerm)}`
        : 'http://localhost/heal-u/backend/api/medicines.php';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch medicines');
      }
      
      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch medicines');
      }
      
      const medicinesData: Medicine[] = data;
      setMedicines(medicinesData);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(medicinesData.map((m: Medicine) => m.categorie || 'Uncategorized').filter(Boolean)));
      setCategories(['All', ...uniqueCategories]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.length >= 2 || value.length === 0) {
      fetchMedicines(value);
    }
  };

  const filtered = medicines.filter((m) => {
    const matchCat = category === "All" || m.categorie === category;
    return matchCat;
  });

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center py-16 text-destructive">
          <p className="text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Medicines</h1>
        <p className="text-muted-foreground">Browse our medicine catalog and check availability</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search medicines..." 
            className="pl-10" 
            value={search} 
            onChange={(e) => handleSearch(e.target.value)} 
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((med, i) => (
          <motion.div
            key={med.id_medicament}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="h-full shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-5">
                <div className="h-10 w-10 rounded-lg bg-medical-light-green flex items-center justify-center mb-3">
                  <Pill className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">{med.nom}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-primary">${med.prix}</span>
                  <Badge variant={med.disponibilite === "1" ? "default" : "secondary"} className={`text-xs ${med.disponibilite === "1" ? "bg-secondary" : ""}`}>
                    {med.disponibilite === "1" ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{med.categorie}</span>
                </div>
                {med.pharmacy_name && (
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{med.pharmacy_name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No medicines found.</p>
        </div>
      )}
    </div>
  );
}
