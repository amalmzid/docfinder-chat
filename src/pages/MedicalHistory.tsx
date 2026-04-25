import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Heart, AlertCircle, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { historiqueService, HistoriqueMedical } from "@/services/historiqueService";
import { userService } from "@/services/userService";

export default function MedicalHistory() {
  const [antecedents, setAntecedents] = useState("");
  const [allergies, setAllergies] = useState("");
  const [traitements, setTraitements] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [historiqueList, setHistoriqueList] = useState<HistoriqueMedical[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistorique();
    fetchPatients();
  }, []);

  const fetchHistorique = async () => {
    try {
      const data = await historiqueService.getAllHistorique();
      setHistoriqueList(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch medical history", variant: "destructive" });
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await userService.getAllUsers();
      const patientList = data.filter(user => user.role === 'patient');
      setPatients(patientList);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch patients", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPatientData = patients.find(p => p.nom === selectedPatient);
      await historiqueService.createHistorique({
        antecedents,
        allergies,
        traitements,
        id_patient: selectedPatientData?.id,
      });
      toast({ title: "Medical History Added!", description: "Record has been saved successfully" });
      fetchHistorique();
      setAntecedents("");
      setAllergies("");
      setTraitements("");
      setSelectedPatient("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to save medical history", variant: "destructive" });
    }
  };

  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold mb-2">Medical History</h1>
      <p className="text-muted-foreground mb-8">Manage patient medical records and history</p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Add Medical History Form */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Add Medical Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Patient</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger><SelectValue placeholder="Choose a patient" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.nom}>
                        {patient.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Medical History (Antecedents)</Label>
                <Textarea
                  placeholder="Enter patient's medical history..."
                  value={antecedents}
                  onChange={(e) => setAntecedents(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Allergies</Label>
                <Textarea
                  placeholder="Enter known allergies..."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Current Treatments</Label>
                <Textarea
                  placeholder="Enter current medications/treatments..."
                  value={traitements}
                  onChange={(e) => setTraitements(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Save Medical Record
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Medical Records */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" /> Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historiqueList.map((record) => (
                <motion.div
                  key={record.id_historique}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{record.patient_nom || "Unknown Patient"}</p>
                    <Badge variant="outline">ID: {record.id_historique}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">History:</span>
                      <span className="text-sm text-muted-foreground">{record.antecedents}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Allergies:</span>
                      <span className="text-sm text-muted-foreground">{record.allergies}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Treatments:</span>
                      <span className="text-sm text-muted-foreground">{record.traitements}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {historiqueList.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No medical records found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
