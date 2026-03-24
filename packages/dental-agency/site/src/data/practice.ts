export const PRACTICE = {
  name: "Edison Dental 27",
  tagline: "Where you are listened to, understood, and most importantly, cared for.",
  phone: "(732) 906-8883",
  address: "2 Route 27, Suite #400, Edison NJ, 08820",
  email: "info@edisondental27.com",
  established: 2004,
  logo: "https://www.edisondental27.com/wp-content/uploads/2020/05/ed27-logo-white-right.png",
  heroImage: "https://www.edisondental27.com/wp-content/uploads/2021/05/header-update-dec2021.jpg",
  hours: [
    { day: "Monday", time: "9:00 AM – 4:00 PM" },
    { day: "Tuesday", time: "9:00 AM – 4:00 PM" },
    { day: "Wednesday", time: "Closed" },
    { day: "Thursday", time: "9:00 AM – 4:00 PM" },
    { day: "Friday", time: "9:00 AM – 4:00 PM" },
    { day: "Saturday", time: "Closed" },
    { day: "Sunday", time: "Closed" },
  ],
} as const;

export const DOCTORS = [
  {
    name: "Dr. Yan Ma",
    title: "DDS – General & Cosmetic Dentistry",
    degree: "New York University College of Dentistry",
    undergrad: "Beijing University School of Stomatology",
    memberships: [
      "American Dental Association",
      "Academy of General Dentistry",
      "Omicron Kappa Upsilon Dental Honor Society",
    ],
    color: "bg-blush",
    initials: "YM",
    photo: "https://www.edisondental27.com/wp-content/uploads/2019/11/dr-ma-300x300.png",
  },
  {
    name: "Dr. Michael Chung",
    title: "DDS – Orthodontics",
    degree: "Columbia University College of Dental Medicine",
    undergrad: "New York University",
    memberships: [
      "American Association of Orthodontists",
      "New Jersey Association of Orthodontists",
      "American Dental Association",
      "New Jersey Dental Association",
      "Orthodontic Education and Research Foundation",
    ],
    color: "bg-mint",
    initials: "MC",
    photo: "https://www.edisondental27.com/wp-content/uploads/2019/11/dr-chung-300x300.png",
  },
] as const;

export interface Service {
  name: string;
  description: string;
  category: string;
  estimatedCost: { low: number; high: number };
  insuranceCoverage: number;
  icon: string;
}

export const SERVICE_CATEGORIES = [
  {
    name: "General & Preventive",
    accent: "bg-butter",
    textAccent: "text-espresso",
    services: [
      { name: "Regular Check-ups", description: "Comprehensive oral examination with cleaning", estimatedCost: { low: 150, high: 300 }, insuranceCoverage: 80, icon: "🦷" },
      { name: "Fillings", description: "Tooth-colored composite or amalgam restorations", estimatedCost: { low: 150, high: 400 }, insuranceCoverage: 70, icon: "✦" },
      { name: "Root Canal Therapy", description: "Endodontic treatment to save infected teeth", estimatedCost: { low: 700, high: 1500 }, insuranceCoverage: 50, icon: "🔬" },
      { name: "Crowns & Bridges", description: "Custom dental crowns and bridgework for damaged or missing teeth", estimatedCost: { low: 800, high: 2000 }, insuranceCoverage: 50, icon: "👑" },
      { name: "Dentures", description: "Complete and partial denture solutions", estimatedCost: { low: 1000, high: 3500 }, insuranceCoverage: 50, icon: "😁" },
      { name: "Periodontal Treatment", description: "Deep cleaning and gum disease management", estimatedCost: { low: 250, high: 1000 }, insuranceCoverage: 60, icon: "🩺" },
      { name: "Extractions", description: "Simple and surgical tooth removal", estimatedCost: { low: 150, high: 600 }, insuranceCoverage: 70, icon: "⚡" },
    ],
  },
  {
    name: "Cosmetic Dentistry",
    accent: "bg-blush",
    textAccent: "text-espresso",
    services: [
      { name: "Teeth Whitening", description: "Professional Zoom whitening for a brighter smile", estimatedCost: { low: 300, high: 800 }, insuranceCoverage: 0, icon: "✨" },
      { name: "Veneers", description: "Porcelain veneers for a perfect smile makeover", estimatedCost: { low: 800, high: 2500 }, insuranceCoverage: 0, icon: "💎" },
      { name: "Composite Bonding", description: "Tooth-colored resin to repair chips and gaps", estimatedCost: { low: 200, high: 600 }, insuranceCoverage: 30, icon: "🎨" },
      { name: "Chipped Tooth Repair", description: "Restore chipped or cracked teeth to full form", estimatedCost: { low: 150, high: 500 }, insuranceCoverage: 40, icon: "🔧" },
    ],
  },
  {
    name: "Implant Dentistry",
    accent: "bg-sage",
    textAccent: "text-espresso",
    services: [
      { name: "Single Tooth Implant", description: "Titanium implant with custom crown replacement", estimatedCost: { low: 2000, high: 5000 }, insuranceCoverage: 30, icon: "📌" },
      { name: "Multi-Teeth Implants", description: "Multiple implant solution for several missing teeth", estimatedCost: { low: 4000, high: 10000 }, insuranceCoverage: 25, icon: "🏗️" },
      { name: "Implant-Supported Overdentures", description: "Implant-anchored dentures for superior stability", estimatedCost: { low: 5000, high: 15000 }, insuranceCoverage: 20, icon: "⚓" },
      { name: "All-on-4 Dental Implants", description: "Full arch restoration with just four implants", estimatedCost: { low: 15000, high: 30000 }, insuranceCoverage: 15, icon: "🌟" },
    ],
  },
  {
    name: "Orthodontics",
    accent: "bg-lavender",
    textAccent: "text-espresso",
    services: [
      { name: "Metal Braces", description: "Traditional stainless steel brackets and wires", estimatedCost: { low: 3000, high: 7000 }, insuranceCoverage: 50, icon: "🔗" },
      { name: "Invisalign", description: "Clear aligner therapy for discreet straightening", estimatedCost: { low: 3500, high: 8000 }, insuranceCoverage: 40, icon: "🪟" },
      { name: "Ceramic Braces", description: "Tooth-colored brackets that blend with your smile", estimatedCost: { low: 3500, high: 7500 }, insuranceCoverage: 45, icon: "🤍" },
      { name: "Orthodontic Appliances", description: "Retainers, expanders, and specialized devices", estimatedCost: { low: 500, high: 2000 }, insuranceCoverage: 50, icon: "⚙️" },
    ],
  },
  {
    name: "Pediatric Dentistry",
    accent: "bg-butter",
    textAccent: "text-espresso",
    services: [
      { name: "Children's Check-ups", description: "Gentle, fun dental exams for kids", estimatedCost: { low: 100, high: 250 }, insuranceCoverage: 80, icon: "🧒" },
      { name: "Fluoride Treatment", description: "Protective fluoride application for growing teeth", estimatedCost: { low: 25, high: 75 }, insuranceCoverage: 80, icon: "🛡️" },
      { name: "Sealants", description: "Protective coating for cavity-prone molars", estimatedCost: { low: 30, high: 75 }, insuranceCoverage: 80, icon: "🔒" },
      { name: "Pediatric Fillings", description: "Gentle cavity treatment for children", estimatedCost: { low: 100, high: 300 }, insuranceCoverage: 70, icon: "🌈" },
      { name: "Pediatric Extractions", description: "Safe tooth removal for baby or problem teeth", estimatedCost: { low: 100, high: 350 }, insuranceCoverage: 70, icon: "🧸" },
    ],
  },
];

export const TESTIMONIALS = [
  {
    name: "Jin Li",
    text: "This dental office was absolutely fantastic. Professional and very nice.",
    rating: 5,
    service: "General Dentistry",
  },
  {
    name: "Hugh Ang",
    text: "Excellent service from Dr. Ma, who has taken good care of me and my family from more than 10 years ago.",
    rating: 5,
    service: "Preventive Care",
  },
  {
    name: "Jenny W.",
    text: "I have been in this dental clinic for more than 10 years. Dr. Ma is the best dentist I have met.",
    rating: 5,
    service: "General Dentistry",
  },
  {
    name: "Sarah M.",
    text: "Dr. Chung straightened my son's teeth perfectly. The whole orthodontic process was smooth and well-explained.",
    rating: 5,
    service: "Orthodontics",
  },
  {
    name: "David K.",
    text: "The Zoom whitening results were amazing. My smile has never looked better. Highly recommend!",
    rating: 5,
    service: "Cosmetic",
  },
];

export const STATS = [
  { value: "20+", label: "Years of Experience" },
  { value: "95%", label: "Patient Satisfaction" },
  { value: "2", label: "Expert Dentists" },
  { value: "25+", label: "Services Offered" },
];

export const MARQUEE_SERVICES = [
  "Cleaning", "Invisalign", "Root Canals", "Crowns", "Whitening",
  "Implants", "Braces", "Veneers", "Pediatrics", "Extractions",
  "Dentures", "Bonding", "Sealants",
];

export interface Treatment {
  id: string;
  name: string;
  date: string;
  status: "completed" | "upcoming" | "in-progress";
  doctor: string;
  notes: string;
  cost: number;
}

export const MOCK_TREATMENTS: Treatment[] = [
  { id: "t1", name: "Regular Check-up & Cleaning", date: "2026-03-15", status: "completed", doctor: "Dr. Yan Ma", notes: "No cavities found. Next cleaning in 6 months.", cost: 250 },
  { id: "t2", name: "Teeth Whitening (Zoom)", date: "2026-03-20", status: "completed", doctor: "Dr. Yan Ma", notes: "Zoom whitening completed. 4 shades lighter.", cost: 500 },
  { id: "t3", name: "Invisalign Consultation", date: "2026-04-02", status: "upcoming", doctor: "Dr. Michael Chung", notes: "Initial consultation for clear aligner therapy.", cost: 0 },
  { id: "t4", name: "Crown Placement — Tooth #14", date: "2026-04-15", status: "upcoming", doctor: "Dr. Yan Ma", notes: "Porcelain crown fitting. Temporary crown currently in place.", cost: 1200 },
  { id: "t5", name: "Filling — Tooth #30", date: "2026-02-10", status: "completed", doctor: "Dr. Yan Ma", notes: "Small cavity filled with composite resin.", cost: 280 },
];

export interface Appointment {
  id: string;
  date: string;
  time: string;
  service: string;
  doctor: string;
  status: "confirmed" | "pending" | "cancelled";
}

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "a1", date: "2026-04-02", time: "10:00 AM", service: "Invisalign Consultation", doctor: "Dr. Michael Chung", status: "confirmed" },
  { id: "a2", date: "2026-04-15", time: "2:00 PM", service: "Crown Placement", doctor: "Dr. Yan Ma", status: "confirmed" },
  { id: "a3", date: "2026-05-15", time: "9:00 AM", service: "Regular Check-up", doctor: "Dr. Yan Ma", status: "pending" },
];

export const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
];
