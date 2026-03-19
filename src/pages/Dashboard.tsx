import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarCheck, Pill, Activity, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Total Patients", value: "2,847", icon: Users, change: "+12%" },
  { label: "Appointments Today", value: "34", icon: CalendarCheck, change: "+5%" },
  { label: "Medicines Available", value: "1,256", icon: Pill, change: "+3%" },
  { label: "Active Doctors", value: "48", icon: Activity, change: "+8%" },
];

const recentActivity = [
  { action: "New appointment booked", user: "John Smith", time: "5 min ago" },
  { action: "Prescription created", user: "Dr. Sarah Johnson", time: "12 min ago" },
  { action: "Medicine stock updated", user: "Pharmacy Team", time: "25 min ago" },
  { action: "Patient registered", user: "Emily Brown", time: "1 hour ago" },
  { action: "Consultation completed", user: "Dr. Michael Chen", time: "2 hours ago" },
];

export default function Dashboard() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of E-MedCare platform activity</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-medical-light-green text-secondary">
                    <TrendingUp className="h-3 w-3 mr-1" />{stat.change}
                  </Badge>
                </div>
                <p className="font-heading text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.user}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
