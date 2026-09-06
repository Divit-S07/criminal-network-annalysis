# AI-Powered Criminal Network Analysis System

An investigator-facing intelligence dashboard that transforms fragmented investigation records into an interactive relationship graph.

The system uses AI-assisted analysis to identify **potential connections, investigative leads, relationships, patterns, timelines, and geographic links** across multiple investigation data sources.

> **Important:** This is a decision-support system. It does not label or declare anyone a criminal. All findings are presented using investigative-lead terminology such as **Potential Connection**, **Investigative Lead**, and **Confidence**.

---

## 🚀 Features

* 📂 Upload one or multiple files
* 📄 CSV, PDF, DOCX, JPG, and PNG support
* 🔐 JWT authentication
* 🔑 Secure password hashing with bcrypt
* 🔍 Local file validation
* 🔐 SHA-256 duplicate file detection
* 📝 PDF, DOCX, and CSV extraction
* 👁️ OCR extraction for images
* 🧹 Data cleaning
* 🔄 Data normalization
* ♻️ Duplicate record detection
* 🤖 Gemini AI-powered analysis
* 🧩 Entity extraction
* 🔗 Relationship detection and inference
* 🕸️ Interactive network graph
* 📊 Investigation analytics
* 🚨 Explainable alerts
* 📚 Evidence and provenance tracking
* 🕒 Timeline analysis
* 🗺️ Geographic visualization
* 📑 Report generation
* 🔎 Entity and relationship exploration
* 🛡️ Privacy-aware AI processing

---

# 🏗️ Technology Stack

## Frontend

* React 19
* Vite
* TypeScript
* Tailwind CSS v4
* React Router
* Axios
* Cytoscape.js
* Leaflet
* Recharts
* Lucide Icons

## Backend

* Node.js
* Express.js
* JavaScript
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer

## Data Processing

* pdf-parse
* mammoth
* csv-parse
* Tesseract OCR

## AI

* Google Gemini API

Gemini is the only external AI service used by the application.

---

# 🔄 Data Processing Workflow

```text
Upload Files
     ↓
Local Validation
     ↓
SHA-256 Duplicate Detection
     ↓
File Extraction
     ↓
Data Cleaning
     ↓
Data Normalization
     ↓
Duplicate Record Detection
     ↓
Structured JSON Generation
     ↓
Gemini AI
     ↓
Entity Extraction
     ↓
Relationship Inference
     ↓
Entity Resolution
     ↓
Evidence Linking
     ↓
Network Graph
     ↓
Analytics
     ↓
Explainable Alerts
     ↓
Investigator Dashboard
```

---

# 📂 1. File Upload

Investigators can upload one or multiple investigation files.

### Supported formats

| File Type | Processing              |
| --------- | ----------------------- |
| CSV       | Structured data parsing |
| PDF       | Text extraction         |
| DOCX      | Document extraction     |
| JPG       | OCR                     |
| PNG       | OCR                     |

### File Size

Maximum file size:

```text
10 MB per file
```

---

# 🔍 2. Local Validation

Files are validated locally before analysis.

Validation includes:

* File type validation
* File size validation
* File integrity checks
* SHA-256 hash generation
* Duplicate file detection

Invalid records are not silently deleted. Validation problems are preserved and marked for review.

---

# 📝 3. Data Extraction

The system automatically extracts information based on the uploaded file type.

```text
CSV
 ↓
CSV Parser
 ↓
Structured Records
```

```text
PDF
 ↓
PDF Parser
 ↓
Extracted Text
```

```text
DOCX
 ↓
Mammoth
 ↓
Extracted Text
```

```text
JPG / PNG
 ↓
Tesseract OCR
 ↓
Extracted Text
```

---

# 🧹 4. Data Cleaning

Extracted data is cleaned before further analysis.

Cleaning includes:

* Removing empty rows
* Trimming whitespace
* Normalizing dates
* Standardizing values
* Handling missing fields
* Detecting malformed records

---

# 🔄 5. Data Normalization

Different sources may use different field names for the same information.

For example:

```text
phone_number
mobile
contact_number
phone

        ↓

phone
```

Similarly:

```text
transaction_date
txn_date
date_of_transaction

        ↓

transactionDate
```

The system converts different input formats into a common canonical schema.

---

# ♻️ 6. Duplicate Detection

The system checks whether extracted records already exist.

Potential duplicate records are flagged instead of being silently removed.

Example:

```json
{
  "duplicate": true,
  "requiresReview": true
}
```

---

# 🤖 7. Structured JSON & Gemini AI

Only cleaned and normalized structured data is prepared for AI processing.

Example:

```json
{
  "caseId": "CASE-001",
  "records": [
    {
      "person": "Person A",
      "phone": "XXXXXXXXXX",
      "location": "Location A",
      "date": "2026-08-20"
    }
  ]
}
```

The structured JSON is sent to Gemini.

Gemini can assist with:

* Entity extraction
* Entity matching
* Relationship identification
* Relationship inference
* Pattern identification
* Potential connections
* Investigative leads

The AI does **not** determine whether a person is guilty or a criminal.

---

# 🧩 8. Entity Resolution

The system can identify potentially matching entities across different records.

For example:

```text
Raj Kumar
R. Kumar
Rajkumar
```

may be identified as potential matches.

Uncertain matches are flagged:

```text
requiresReview = true
```

Uncertain entities are **never automatically merged**.

---

# 🔗 9. Relationship Analysis

Relationships are categorized as either observed or inferred.

### Observed Relationship

A relationship directly supported by source data.

```text
Person A ─── Phone Contact ─── Person B
```

### Inferred Relationship

A potential relationship inferred from available evidence.

```text
Person A ─── Potential Connection ─── Person B
```

Every relationship must contain provenance.

---

# 📚 Evidence & Provenance

Each relationship stores information about its supporting evidence.

A relationship contains:

```text
Source Entity
Relationship Type
Target Entity
Status
Confidence
Source File
Evidence ID
Timestamp
```

Example:

```json
{
  "sourceEntity": "Entity-A",
  "relationshipType": "phone-contact",
  "targetEntity": "Entity-B",
  "status": "observed",
  "confidence": 0.94,
  "sourceFile": "call_records.csv",
  "evidenceId": "EVID-001",
  "timestamp": "2026-08-20T10:30:00Z"
}
```

No relationship should exist without supporting provenance.

---

# 🕸️ Network Visualization

The Network module provides an interactive graph of entities and relationships.

Example:

```text
                 ┌─────────────┐
                 │   Person A  │
                 └──────┬──────┘
                        │
                   Phone Contact
                        │
                        ▼
                 ┌─────────────┐
                 │   Person B  │
                 └──────┬──────┘
                        │
                    Transaction
                        │
                        ▼
                 ┌─────────────┐
                 │   Account C │
                 └─────────────┘
```

Investigators can explore:

* Direct connections
* Indirect connections
* Relationship types
* Highly connected entities
* Observed relationships
* Inferred relationships
* Evidence-backed connections

---

# 📊 Dashboard

The dashboard provides an overview of the investigation.

It can display:

* Total entities
* Total relationships
* Potential connections
* Investigative leads
* Evidence count
* Alert count
* High-confidence relationships
* Timeline events
* Geographic activity

---

# 🚨 Alerts

The system generates explainable alerts from detected patterns.

Examples include:

* Potential connections
* Repeated contacts
* Shared identifiers
* Transaction relationships
* Geographic overlaps
* Unusual activity patterns
* Highly connected entities

Each alert should provide supporting evidence and confidence information.

---

# 🕒 Timeline

Timeline analysis organizes investigation events chronologically.

Example:

```text
10 Aug
 │
 ├── Phone Contact
 │
15 Aug
 │
 ├── Transaction
 │
20 Aug
 │
 ├── Location Overlap
 │
25 Aug
 │
 └── Potential Connection
```

This helps investigators understand relationships between events over time.

---

# 🗺️ Map

The Map module visualizes geographic information from investigation records.

It can display:

* Locations
* Events
* Entity activity
* Geographic overlaps
* Investigation-related movements

---

# 📑 Reports

The system can generate investigation reports containing:

* Case information
* Entity summary
* Relationship summary
* Evidence
* Timeline
* Geographic information
* Alerts
* Investigative leads
* Confidence information

---

# 🔐 Authentication & Security

The backend uses JWT authentication.

Passwords are hashed using bcrypt.

Protected API requests require:

```http
Authorization: Bearer <JWT>
```

Users can access only authorized investigation resources.

---

### Models

```text
User
Case
SourceFile
RawRecord
Entity
Relationship
Evidence
AnalysisJob
Alert
TimelineEvent
AuditEvent
```

---

# 🔗 API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Cases

```http
POST /api/cases
GET  /api/cases
GET  /api/cases/:id
```

## Files

```http
POST /api/files/upload
GET  /api/files
```
 
## Analysis

```http
POST /api/analysis/start
GET  /api/analysis/:jobId
GET  /api/analysis/:jobId/results
```

## Entities

```http
GET /api/entities
GET /api/entities/:id
```

## Relationships

```http
GET /api/relationships
GET /api/relationships/:id
```

## Evidence

```http
GET /api/evidence
GET /api/evidence/:id
```

## Alerts

```http
GET   /api/alerts
PATCH /api/alerts/:id/status
```

## Timeline & Map

```http
GET /api/timeline
GET /api/map-data
```

## Network

```http
GET /api/network/:caseId
```

## Reports

```http
POST /api/reports/generate
```

## Health Check

```http
GET /api/health
```

All endpoints except authentication and health endpoints require JWT authentication.

---

# 💻 Local Installation

## Prerequisites

Install the following:

* Node.js
* npm

Verify installation:

```bash
node --version
npm --version

```

---

# 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_FOLDER>

````
# 2. Install Backend

```bash

cd backend
npm install

```
# 3. Configure Backend
Create:

```bash

copy env.example.txt .evn

```

Gemini API key:

```text
https://aistudio.google.com/apikey
```

Gemini is optional for the deterministic pipeline.

---

# 5. Start Backend

```bash
npm run dev
```

Backend:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

---

# 6. Install Frontend

Open another terminal and return to the project root:

```bash
cd ..
npm install

```

Start the frontend:

```bash

  npm run dev

```

Frontend:

```text
http://localhost:5173
```

---

# 7. Frontend Environment

Create a `.env` file in the project root if required:

```env
VITE_API_URL=http://localhost:3000/api
```

---

# 👤 First Login

Open:

```text
http://localhost:5173
```

Register an investigator account from the application.

You can also use the API:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Investigator\",\"email\":\"inv@police.gov.in\",\"password\":\"secret123\"}"
```

Then log in using the registered credentials.

The JWT is stored in the frontend and automatically attached to authenticated API requests.

---

# 📂 Application Usage

## Step 1 — Create a Case

Create or select an investigation case.

## Step 2 — Upload Data

Upload one or multiple files:

```text
CSV
PDF
DOCX
JPG
PNG
```

## Step 3 — Automatic Processing

The system performs:

```text
Validation
   ↓
Hashing
   ↓
Extraction
   ↓
Cleaning
   ↓
Normalization
   ↓
Duplicate Detection
```

## Step 4 — Analyze

Click:

```text
Analyze
```

The backend creates an `AnalysisJob`.

## Step 5 — Monitor Analysis

The frontend checks:

```http
GET /api/analysis/:jobId
```

for analysis progress.

## Step 6 — Explore Results

After analysis, investigators can explore:

```text
Dashboard
Cases
Network
Alerts
Evidence
Timeline
Map
Reports
```

---

# 🧪 Supported Investigation Data

The platform can process authorized investigation-related data such as:

* Case records
* Contact records
* Phone records
* Transaction records
* Location records
* Identity references
* Communication records
* Incident documents
* Other authorized investigation records

For development and demonstrations, use **synthetic or privacy-safe data**.

---

# 🛡️ Privacy & Ethics

This project is designed as an investigator decision-support system.

The system:

* Does not declare anyone a criminal
* Does not determine guilt
* Uses investigative-lead terminology
* Provides confidence levels
* Provides evidence provenance
* Preserves validation issues
* Flags uncertain entity matches
* Does not automatically merge uncertain entities
* Performs preprocessing locally
* Sends only cleaned structured JSON to Gemini

### Recommended terminology

Use:

```text
Potential Connection
Investigative Lead
Observed Relationship
Inferred Relationship
Confidence
Requires Review
```

Avoid presenting AI findings as:

```text
Criminal
Guilty
Confirmed Criminal
```

---

# 🤖 AI Decision-Support Principle

AI findings are investigative aids and must be reviewed by an authorized investigator.

```text
AI Finding
     ↓
Supporting Evidence
     ↓
Confidence
     ↓
Investigator Review
     ↓
Investigative Decision
```

The system does not replace human investigation or legal decision-making.

---

# 📁 Project Structure

```text
project-root/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── routes/
│   ├── types/
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── env.example.txt
│   └── server.js
│
├── public/
├── .env
├── package.json
├── vite.config.ts
└── README.md
```

---

# ⚡ Quick Start

```bash
# Start MongoDB first

# Terminal 1
cd backend
npm install
npm run dev

# Terminal 2
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🎯 SIH Demonstration Workflow

```text
Login
  ↓
Create Investigation Case
  ↓
Upload Multiple Files
  ↓
Local Validation
  ↓
File Extraction
  ↓
Cleaning
  ↓
Normalization
  ↓
Duplicate Detection
  ↓
Structured JSON
  ↓
Gemini AI Analysis
  ↓
Entity Extraction
  ↓
Relationship Inference
  ↓
Entity Resolution
  ↓
Evidence Linking
  ↓
Interactive Network Graph
  ↓
Analytics
  ↓
Alerts
  ↓
Timeline
  ↓
Map
  ↓
Investigator Review
  ↓
Generate Report
```

---

# 🎯 Project Objective

The objective of the **AI-Powered Criminal Network Analysis System** is to help investigators transform fragmented investigation records into a unified intelligence view.

Instead of manually examining disconnected files:

```text
CSV ─────┐
PDF ─────┤
DOCX ────┤
Images ──┤
Phone ───┤
Transactions
         │
         ▼
   AI-Assisted Analysis
         │
         ▼
┌─────────────────────────┐
│ Entities                │
│ Relationships           │
│ Evidence                │
│ Timeline                │
│ Locations               │
│ Investigative Leads     │
│ Alerts                  │
└─────────────────────────┘
```

The platform provides an interactive and evidence-linked intelligence dashboard that helps investigators discover potential relationships and patterns more efficiently.

---

# ⚠️ Disclaimer

This project is intended for authorized investigative, educational, research, and demonstration purposes.

It is a **decision-support and intelligence-analysis system**.

Its outputs are not determinations of guilt, criminality, or legal responsibility.

Always use appropriate authorization, privacy protections, human review, and applicable laws and regulations when handling real investigation data.

---

# 👥 Smart India Hackathon 2026

## Project

**AI-Powered Criminal Network Analysis System**

### Purpose

Transform fragmented investigation records into an interactive, explainable, evidence-linked network intelligence platform.

---

# 📜 License

Add the appropriate license for your project here.

Example:

```text
MIT License
```
