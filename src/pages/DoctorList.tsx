import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const doctors = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology", rating: 4.9, reviews: 124, available: true, location: "New York", image: "SJ" },
  { id: 2, name: "Dr. Michael Chen", specialty: "Dermatology", rating: 4.8, reviews: 98, available: true, location: "Los Angeles", image: "MC" },
  { id: 3, name: "Dr. Emily Davis", specialty: "Pediatrics", rating: 4.7, reviews: 156, available: false, location: "Chicago", image: "ED" },
  { id: 4, name: "Dr. James Wilson", specialty: "Neurology", rating: 4.9, reviews: 87, available: true, location: "Houston", image: "JW" },
  { id: 5, name: "Dr. Lisa Anderson", specialty: "Orthopedics", rating: 4.6, reviews: 112, available: true, location: "Phoenix", image: "LA" },
  { id: 6, name: "Dr. Robert Brown", specialty: "Cardiology", rating: 4.8, reviews: 143, available: true, location: "San Diego", image: "RB" },
];

const specialties = ["All", "Cardiology", "Dermatology", "Pediatrics", "Neurology", "Orthopedics"];

export default function DoctorList() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");

  const filtered = doctors.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialty === "All" || d.specialty === specialty;
    return matchSearch && matchSpec;
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Find a Doctor</h1>
        <p className="text-muted-foreground">Browse our network of healthcare professionals</p>
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
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-medical flex items-center justify-center text-primary-foreground font-heading font-bold text-lg shrink-0">
                    {doc.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold truncate">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{doc.rating}</span>
                      <span className="text-xs text-muted-foreground">({doc.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{doc.location}</span>
                  <Badge variant={doc.available ? "default" : "secondary"} className={`ml-auto text-xs ${doc.available ? "bg-secondary" : ""}`}>
                    {doc.available ? "Available" : "Unavailable"}
                  </Badge>
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
