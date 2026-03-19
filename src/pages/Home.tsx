import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Pill,
  CalendarCheck,
  MessageCircle,
  Search,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Stethoscope,
    title: "Find Doctors",
    description: "Search specialists by category and book appointments instantly.",
  },
  {
    icon: Pill,
    title: "Medicine Catalog",
    description: "Browse medicines, check availability, and find nearby pharmacies.",
  },
  {
    icon: CalendarCheck,
    title: "Easy Appointments",
    description: "Schedule and manage your medical appointments with ease.",
  },
  {
    icon: MessageCircle,
    title: "Online Consultation",
    description: "Chat with doctors from the comfort of your home.",
  },
  {
    icon: Search,
    title: "Medical Chatbot",
    description: "Get instant answers to basic health questions 24/7.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description: "Your health data is protected with enterprise-grade security.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-medical opacity-5" />
        <div className="container relative py-20 md:py-32 flex flex-col items-center text-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Your Health, Our Priority
            </span>
            <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
              Modern Healthcare{" "}
              <span className="text-gradient-medical">Made Simple</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Connect with top doctors, manage prescriptions, and access healthcare services — all in one platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Button size="lg" className="bg-gradient-medical hover:opacity-90 text-lg px-8" asChild>
              <Link to="/register">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link to="/doctors">Browse Doctors</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Everything You Need
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              A comprehensive medical platform designed for patients, doctors, and pharmacists.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={item}>
                <Card className="h-full border shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="rounded-2xl bg-gradient-medical p-8 md:p-12 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
              Join thousands of patients and healthcare professionals on E-MedCare.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link to="/register">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
