import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Pill, Package } from "lucide-react";
import { motion } from "framer-motion";

const medicines = [
  { id: 1, name: "Amoxicillin 500mg", category: "Antibiotics", price: 12.99, inStock: true, description: "Broad-spectrum antibiotic for bacterial infections." },
  { id: 2, name: "Ibuprofen 400mg", category: "Pain Relief", price: 8.49, inStock: true, description: "Anti-inflammatory for pain and fever." },
  { id: 3, name: "Metformin 850mg", category: "Diabetes", price: 15.99, inStock: true, description: "Oral medication for type 2 diabetes." },
  { id: 4, name: "Lisinopril 10mg", category: "Cardiovascular", price: 11.49, inStock: false, description: "ACE inhibitor for blood pressure management." },
  { id: 5, name: "Omeprazole 20mg", category: "Gastrointestinal", price: 9.99, inStock: true, description: "Proton pump inhibitor for acid reflux." },
  { id: 6, name: "Cetirizine 10mg", category: "Allergy", price: 6.99, inStock: true, description: "Antihistamine for allergy symptoms." },
  { id: 7, name: "Atorvastatin 20mg", category: "Cardiovascular", price: 18.99, inStock: true, description: "Statin for cholesterol management." },
  { id: 8, name: "Azithromycin 250mg", category: "Antibiotics", price: 14.49, inStock: false, description: "Macrolide antibiotic for respiratory infections." },
];

const categories = ["All", "Antibiotics", "Pain Relief", "Diabetes", "Cardiovascular", "Gastrointestinal", "Allergy"];

export default function Medicines() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = medicines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || m.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Medicines</h1>
        <p className="text-muted-foreground">Browse our medicine catalog and check availability</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search medicines..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
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
            key={med.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="h-full shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-5">
                <div className="h-10 w-10 rounded-lg bg-medical-light-green flex items-center justify-center mb-3">
                  <Pill className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">{med.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{med.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-primary">${med.price}</span>
                  <Badge variant={med.inStock ? "default" : "secondary"} className={`text-xs ${med.inStock ? "bg-secondary" : ""}`}>
                    {med.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{med.category}</span>
                </div>
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
