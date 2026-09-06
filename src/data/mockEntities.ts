import type { Entity, Case, Location, DashboardStats } from "@/types";

export const cases: Case[] = [
  { id: "CASE-1042", name: "Financial Investigation", date: "2026-08-14", location: "Chennai", persons: 8, relationships: 42, status: "Active", lastUpdated: "2026-08-20", description: "Investigation into suspected financial network operating across multiple districts." },
  { id: "CASE-1087", name: "Communication Network Probe", date: "2026-07-22", location: "Mumbai", persons: 12, relationships: 67, status: "Active", lastUpdated: "2026-08-18", description: "Analysis of communication patterns linked to organized activity." },
  { id: "CASE-1103", name: "Vehicle Tracking Operation", date: "2026-06-10", location: "Delhi", persons: 6, relationships: 31, status: "Under Review", lastUpdated: "2026-08-05", description: "Monitoring vehicle movements associated with persons of interest." },
  { id: "CASE-1119", name: "Cross-District Link Analysis", date: "2026-08-01", location: "Hyderabad", persons: 15, relationships: 89, status: "Active", lastUpdated: "2026-08-22", description: "Identifying cross-district connections between multiple investigation subjects." },
  { id: "CASE-1134", name: "Location Pattern Study", date: "2026-05-18", location: "Bangalore", persons: 9, relationships: 53, status: "Active", lastUpdated: "2026-08-15", description: "Geographic pattern analysis of entity movements and meeting points." },
  { id: "CASE-1148", name: "Account Flow Investigation", date: "2026-07-05", location: "Pune", persons: 7, relationships: 38, status: "Under Review", lastUpdated: "2026-08-12", description: "Tracing financial account flows between entities of interest." },
  { id: "CASE-1156", name: "Multi-Source Correlation", date: "2026-08-10", location: "Kolkata", persons: 11, relationships: 72, status: "Active", lastUpdated: "2026-08-21", description: "Correlating communication, location, and financial data across cases." },
  { id: "CASE-1167", name: "Network Topology Mapping", date: "2026-04-20", location: "Ahmedabad", persons: 10, relationships: 58, status: "Closed", lastUpdated: "2026-07-30", description: "Mapping the complete network topology of a known organized group." },
];

export const persons: Entity[] = [
  { id: "P001", type: "PERSON", label: "Arjun Mehta", properties: { age: "34", occupation: "Businessman", address: "Chennai" }, cases: ["CASE-1042", "CASE-1119"], networkImportance: "High" },
  { id: "P002", type: "PERSON", label: "Priya Sharma", properties: { age: "29", occupation: "Accountant", address: "Mumbai" }, cases: ["CASE-1087"], networkImportance: "Medium" },
  { id: "P003", type: "PERSON", label: "Vikram Singh", properties: { age: "41", occupation: "Driver", address: "Delhi" }, cases: ["CASE-1103", "CASE-1119"], networkImportance: "Medium" },
  { id: "P004", type: "PERSON", label: "Neha Gupta", properties: { age: "27", occupation: "Clerk", address: "Hyderabad" }, cases: ["CASE-1119", "CASE-1134"], networkImportance: "Low" },
  { id: "P005", type: "PERSON", label: "Rajesh Kumar", properties: { age: "38", occupation: "Contractor", address: "Chennai" }, cases: ["CASE-1042"], networkImportance: "High" },
  { id: "P006", type: "PERSON", label: "Anita Desai", properties: { age: "32", occupation: "Manager", address: "Pune" }, cases: ["CASE-1148", "CASE-1156"], networkImportance: "Medium" },
  { id: "P007", type: "PERSON", label: "Suresh Patel", properties: { age: "45", occupation: "Owner", address: "Ahmedabad" }, cases: ["CASE-1167"], networkImportance: "High" },
  { id: "P008", type: "PERSON", label: "Kavita Nair", properties: { age: "30", occupation: "Receptionist", address: "Bangalore" }, cases: ["CASE-1134"], networkImportance: "Low" },
  { id: "P009", type: "PERSON", label: "Deepak Verma", properties: { age: "36", occupation: "Salesman", address: "Delhi" }, cases: ["CASE-1103"], networkImportance: "Low" },
  { id: "P010", type: "PERSON", label: "Lakshmi Iyer", properties: { age: "42", occupation: "Broker", address: "Chennai" }, cases: ["CASE-1042", "CASE-1119"], networkImportance: "High" },
  { id: "P011", type: "PERSON", label: "Mohammed Ali", properties: { age: "33", occupation: "Vendor", address: "Mumbai" }, cases: ["CASE-1087"], networkImportance: "Medium" },
  { id: "P012", type: "PERSON", label: "Pooja Reddy", properties: { age: "28", occupation: "Clerk", address: "Hyderabad" }, cases: ["CASE-1119"], networkImportance: "Low" },
  { id: "P013", type: "PERSON", label: "Amit Joshi", properties: { age: "39", occupation: "Supervisor", address: "Pune" }, cases: ["CASE-1148"], networkImportance: "Medium" },
  { id: "P014", type: "PERSON", label: "Sunita Rao", properties: { age: "35", occupation: "Accountant", address: "Bangalore" }, cases: ["CASE-1134", "CASE-1156"], networkImportance: "Medium" },
  { id: "P015", type: "PERSON", label: "Ravi Teja", properties: { age: "31", occupation: "Technician", address: "Hyderabad" }, cases: ["CASE-1119"], networkImportance: "Low" },
  { id: "P016", type: "PERSON", label: "Geeta Kumari", properties: { age: "44", occupation: "Housewife", address: "Delhi" }, cases: ["CASE-1103", "CASE-1156"], networkImportance: "Medium" },
  { id: "P017", type: "PERSON", label: "Bharat Mishra", properties: { age: "37", occupation: "Driver", address: "Kolkata" }, cases: ["CASE-1156"], networkImportance: "Low" },
  { id: "P018", type: "PERSON", label: "Fatima Begum", properties: { age: "26", occupation: "Student", address: "Mumbai" }, cases: ["CASE-1087"], networkImportance: "Low" },
  { id: "P019", type: "PERSON", label: "Ganesh Pandey", properties: { age: "48", occupation: "Retired", address: "Ahmedabad" }, cases: ["CASE-1167"], networkImportance: "Medium" },
  { id: "P020", type: "PERSON", label: "Meena Kumari", properties: { age: "30", occupation: "Nurse", address: "Chennai" }, cases: ["CASE-1042"], networkImportance: "Low" },
  { id: "P021", type: "PERSON", label: "Prakash Yadav", properties: { age: "40", occupation: "Mechanic", address: "Delhi" }, cases: ["CASE-1103", "CASE-1119"], networkImportance: "Medium" },
  { id: "P022", type: "PERSON", label: "Shobha Devi", properties: { age: "46", occupation: "Farmer", address: "Kolkata" }, cases: ["CASE-1156"], networkImportance: "Low" },
  { id: "P023", type: "PERSON", label: "Karthik Sundaram", properties: { age: "33", occupation: "Consultant", address: "Chennai" }, cases: ["CASE-1042", "CASE-1087", "CASE-1119"], networkImportance: "High" },
  { id: "P024", type: "PERSON", label: "Divya Bhat", properties: { age: "29", occupation: "Designer", address: "Bangalore" }, cases: ["CASE-1134"], networkImportance: "Low" },
  { id: "P025", type: "PERSON", label: "Sanjay Kulkarni", properties: { age: "38", occupation: "Accountant", address: "Pune" }, cases: ["CASE-1148", "CASE-1156"], networkImportance: "Medium" },
];

export const phones: Entity[] = [
  { id: "PH001", type: "PHONE", label: "9876543210", properties: { carrier: "Airtel", type: "Prepaid" }, cases: ["CASE-1042"], networkImportance: "Medium" },
  { id: "PH002", type: "PHONE", label: "9988776655", properties: { carrier: "Jio", type: "Postpaid" }, cases: ["CASE-1087"], networkImportance: "Low" },
  { id: "PH003", type: "PHONE", label: "9123456780", properties: { carrier: "Vodafone", type: "Prepaid" }, cases: ["CASE-1103"], networkImportance: "Medium" },
  { id: "PH004", type: "PHONE", label: "8765432109", properties: { carrier: "BSNL", type: "Postpaid" }, cases: ["CASE-1119"], networkImportance: "High" },
  { id: "PH005", type: "PHONE", label: "7654321098", properties: { carrier: "Airtel", type: "Prepaid" }, cases: ["CASE-1134"], networkImportance: "Low" },
  { id: "PH006", type: "PHONE", label: "9012345678", properties: { carrier: "Jio", type: "Prepaid" }, cases: ["CASE-1148"], networkImportance: "Medium" },
  { id: "PH007", type: "PHONE", label: "8123456789", properties: { carrier: "Vodafone", type: "Postpaid" }, cases: ["CASE-1156"], networkImportance: "Low" },
  { id: "PH008", type: "PHONE", label: "9234567890", properties: { carrier: "Airtel", type: "Prepaid" }, cases: ["CASE-1042", "CASE-1119"], networkImportance: "High" },
  { id: "PH009", type: "PHONE", label: "8345678901", properties: { carrier: "BSNL", type: "Postpaid" }, cases: ["CASE-1167"], networkImportance: "Medium" },
  { id: "PH010", type: "PHONE", label: "7456789012", properties: { carrier: "Jio", type: "Prepaid" }, cases: ["CASE-1103"], networkImportance: "Low" },
];

export const vehicles: Entity[] = [
  { id: "V001", type: "VEHICLE", label: "TN38AB1234", properties: { make: "Maruti Swift", color: "White", year: "2022" }, cases: ["CASE-1042"], networkImportance: "Medium" },
  { id: "V002", type: "VEHICLE", label: "MH12CD5678", properties: { make: "Hyundai Creta", color: "Black", year: "2023" }, cases: ["CASE-1087"], networkImportance: "Low" },
  { id: "V003", type: "VEHICLE", label: "DL09EF9012", properties: { make: "Toyota Innova", color: "Silver", year: "2021" }, cases: ["CASE-1103"], networkImportance: "Medium" },
  { id: "V004", type: "VEHICLE", label: "TS09GH3456", properties: { make: "Honda City", color: "Blue", year: "2022" }, cases: ["CASE-1119"], networkImportance: "High" },
  { id: "V005", type: "VEHICLE", label: "KA01JK7890", properties: { make: "Tata Nexon", color: "Red", year: "2023" }, cases: ["CASE-1134"], networkImportance: "Low" },
  { id: "V006", type: "VEHICLE", label: "MH14LM1234", properties: { make: "Maruti Baleno", color: "Grey", year: "2021" }, cases: ["CASE-1148"], networkImportance: "Medium" },
  { id: "V007", type: "VEHICLE", label: "WB06NP5678", properties: { make: "Hyundai Verna", color: "White", year: "2022" }, cases: ["CASE-1156"], networkImportance: "Low" },
  { id: "V008", type: "VEHICLE", label: "GJ01QR9012", properties: { make: "Ford EcoSport", color: "Black", year: "2020" }, cases: ["CASE-1167"], networkImportance: "Medium" },
];

export const accounts: Entity[] = [
  { id: "ACC001", type: "ACCOUNT", label: "SBI-40218765432", properties: { bank: "SBI", type: "Savings" }, cases: ["CASE-1042"], networkImportance: "Medium" },
  { id: "ACC002", type: "ACCOUNT", label: "HDFC-51987654321", properties: { bank: "HDFC", type: "Current" }, cases: ["CASE-1087"], networkImportance: "Low" },
  { id: "ACC003", type: "ACCOUNT", label: "ICICI-62109876543", properties: { bank: "ICICI", type: "Savings" }, cases: ["CASE-1148"], networkImportance: "Medium" },
  { id: "ACC004", type: "ACCOUNT", label: "AXIS-31234567890", properties: { bank: "Axis", type: "Current" }, cases: ["CASE-1119"], networkImportance: "High" },
  { id: "ACC005", type: "ACCOUNT", label: "PNB-78901234567", properties: { bank: "PNB", type: "Savings" }, cases: ["CASE-1156"], networkImportance: "Low" },
  { id: "ACC006", type: "ACCOUNT", label: "BOB-45678901234", properties: { bank: "BOB", type: "Current" }, cases: ["CASE-1167"], networkImportance: "Medium" },
];

export const locationEntities: Entity[] = [
  { id: "L001", type: "LOCATION", label: "T. Nagar, Chennai", properties: { district: "Chennai", state: "Tamil Nadu" }, cases: ["CASE-1042"], networkImportance: "High" },
  { id: "L002", type: "LOCATION", label: "Andheri, Mumbai", properties: { district: "Mumbai", state: "Maharashtra" }, cases: ["CASE-1087"], networkImportance: "Medium" },
  { id: "L003", type: "LOCATION", label: "Connaught Place, Delhi", properties: { district: "New Delhi", state: "Delhi" }, cases: ["CASE-1103"], networkImportance: "Medium" },
  { id: "L004", type: "LOCATION", label: "Banjara Hills, Hyderabad", properties: { district: "Hyderabad", state: "Telangana" }, cases: ["CASE-1119"], networkImportance: "High" },
  { id: "L005", type: "LOCATION", label: "Koramangala, Bangalore", properties: { district: "Bangalore", state: "Karnataka" }, cases: ["CASE-1134"], networkImportance: "Medium" },
  { id: "L006", type: "LOCATION", label: "Kothrud, Pune", properties: { district: "Pune", state: "Maharashtra" }, cases: ["CASE-1148"], networkImportance: "Low" },
  { id: "L007", type: "LOCATION", label: "Salt Lake, Kolkata", properties: { district: "Kolkata", state: "West Bengal" }, cases: ["CASE-1156"], networkImportance: "Medium" },
  { id: "L008", type: "LOCATION", label: "Vastrapur, Ahmedabad", properties: { district: "Ahmedabad", state: "Gujarat" }, cases: ["CASE-1167"], networkImportance: "Low" },
  { id: "L009", type: "LOCATION", label: "Marina Beach, Chennai", properties: { district: "Chennai", state: "Tamil Nadu" }, cases: ["CASE-1042", "CASE-1119"], networkImportance: "Medium" },
  { id: "L010", type: "LOCATION", label: "Bandra, Mumbai", properties: { district: "Mumbai", state: "Maharashtra" }, cases: ["CASE-1087"], networkImportance: "Low" },
  { id: "L011", type: "LOCATION", label: "Shivajinagar, Pune", properties: { district: "Pune", state: "Maharashtra" }, cases: ["CASE-1148"], networkImportance: "Low" },
  { id: "L012", type: "LOCATION", label: "Indiranagar, Bangalore", properties: { district: "Bangalore", state: "Karnataka" }, cases: ["CASE-1134", "CASE-1156"], networkImportance: "Medium" },
];

export const locations: Location[] = [
  { id: "L001", name: "T. Nagar, Chennai", lat: 13.0418, lng: 80.2341, type: "Meeting Point", entities: ["P001", "P005", "P010"], cases: ["CASE-1042"], events: [] },
  { id: "L002", name: "Andheri, Mumbai", lat: 19.1197, lng: 72.8464, type: "Office", entities: ["P002", "P011"], cases: ["CASE-1087"], events: [] },
  { id: "L003", name: "Connaught Place, Delhi", lat: 28.6315, lng: 77.2167, type: "Commercial", entities: ["P003", "P009"], cases: ["CASE-1103"], events: [] },
  { id: "L004", name: "Banjara Hills, Hyderabad", lat: 17.4156, lng: 78.4347, type: "Residential", entities: ["P004", "P012", "P015"], cases: ["CASE-1119"], events: [] },
  { id: "L005", name: "Koramangala, Bangalore", lat: 12.9352, lng: 77.6245, type: "Commercial", entities: ["P008", "P024"], cases: ["CASE-1134"], events: [] },
  { id: "L006", name: "Kothrud, Pune", lat: 18.5074, lng: 73.8078, type: "Residential", entities: ["P006", "P013"], cases: ["CASE-1148"], events: [] },
  { id: "L007", name: "Salt Lake, Kolkata", lat: 22.5804, lng: 88.4169, type: "Commercial", entities: ["P016", "P017", "P022"], cases: ["CASE-1156"], events: [] },
  { id: "L008", name: "Vastrapur, Ahmedabad", lat: 23.0367, lng: 72.5294, type: "Meeting Point", entities: ["P007", "P019"], cases: ["CASE-1167"], events: [] },
  { id: "L009", name: "Marina Beach, Chennai", lat: 13.0499, lng: 80.2824, type: "Public Area", entities: ["P001", "P023"], cases: ["CASE-1042", "CASE-1119"], events: [] },
  { id: "L010", name: "Bandra, Mumbai", lat: 19.0596, lng: 72.8295, type: "Residential", entities: ["P011", "P018"], cases: ["CASE-1087"], events: [] },
  { id: "L011", name: "Shivajinagar, Pune", lat: 18.5308, lng: 73.8472, type: "Commercial", entities: ["P013", "P025"], cases: ["CASE-1148"], events: [] },
  { id: "L012", name: "Indiranagar, Bangalore", lat: 12.9784, lng: 77.6408, type: "Meeting Point", entities: ["P014", "P024"], cases: ["CASE-1134", "CASE-1156"], events: [] },
];

export const allEntities: Entity[] = [...persons, ...phones, ...vehicles, ...accounts, ...locationEntities];

export const dashboardStats: DashboardStats = {
  totalCases: cases.length,
  persons: persons.length,
  phones: phones.length,
  vehicles: vehicles.length,
  accounts: accounts.length,
  relationships: 122,
  alerts: 4,
};
