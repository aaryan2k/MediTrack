# 💊 MediTrack

**MediTrack** is a medication management app built with React Native and Expo that helps users keep track of their medications, research drug information, and stay on top of their dosing schedules.

The app combines **Firebase**, **OpenFDA**, **RxNorm**, and an **AI-powered research agent** built with **LangGraph and Gemini** to provide medication warnings and drug interaction information.

---

## ✨ Features

### 💊 Medication Management

* Search for medications using drug names or RxNorm identifiers
* Save medications to your personal medication list
* View detailed medication information
* Remove medications from your saved list
* Support for multiple medications

### ⏰ Medication Reminders

* Create customized medication schedules
* Select specific days of the week
* Configure multiple doses per day
* View upcoming doses
* Mark medications as taken
* Track medication history

### 📅 Medication Calendar

* View scheduled medications by day
* Easily see upcoming doses
* Visual indicators for days with scheduled medications

### 🔎 Drug Information

MediTrack retrieves medication information from multiple sources:

1. **OpenFDA** — retrieves information directly from FDA drug labeling
2. **RxNorm** — provides standardized medication identifiers
3. **AI Research Agent** — fills in missing information using Gemini and Tavily
4. **Firestore Cache** — stores previously retrieved drug information to avoid unnecessary API calls

Drug information includes:

* ⚠️ Warnings
* 💊 Drug interactions
* 🔗 Sources for retrieved information

### 🤖 AI-Powered Research

When OpenFDA doesn't provide complete information, MediTrack can use a LangGraph agent to research the medication.

The agent:

* Uses **Gemini** to determine what information is needed
* Uses **Tavily** to search the web when necessary
* Prioritizes authoritative medical sources
* Returns structured medication information
* Limits external research calls to avoid unnecessary API usage

---

## 🏗️ Architecture

```text
┌───────────────────────────────┐
│       React Native App        │
│          Expo Router          │
└───────────────┬───────────────┘
                │
                ▼
        ┌───────────────┐
        │    Firebase   │
        │   Firestore   │
        └───────┬───────┘
                │
         Cache Miss
                │
                ▼
┌───────────────────────────────┐
│         FastAPI Backend       │
├───────────────────────────────┤
│                               │
│  OpenFDA       LangGraph      │
│     │             │           │
│     │          Gemini         │
│     │             │           │
│     │          Tavily         │
│     │             │           │
└─────┴─────────────┴───────────┘
                │
                ▼
        Structured Drug Info
                │
                ▼
        Firestore Cache
```

### Drug Information Flow

```text
User searches for medication
            │
            ▼
     Check Firestore
            │
       ┌────┴────┐
       │         │
     Found     Not Found
       │         │
       │         ▼
       │      OpenFDA
       │         │
       │    Complete?
       │      ┌──┴──┐
       │     Yes    No
       │      │      │
       │      │      ▼
       │      │   Gemini
       │      │      │
       │      │   Tavily
       │      │      │
       └──────┴──────┘
              │
              ▼
        Display Results
              │
              ▼
       Cache in Firestore
```

---

## 🛠️ Tech Stack

### Frontend

* **React Native**
* **Expo**
* **Expo Router**
* **TypeScript**
* **NativeWind / Tailwind CSS**

### Backend

* **Python**
* **FastAPI**
* **LangGraph**
* **LangChain**
* **Google Gemini**

### APIs & Services

* **Firebase Authentication**
* **Cloud Firestore**
* **RxNorm API**
* **OpenFDA API**
* **Tavily**

### Data & ML

* Structured drug information retrieval
* AI-assisted web research
* Cached medication information

---

## 📁 Project Structure

```text
medicine_app/
│
├── src/
│   ├── app/
│   │   ├── index.tsx
│   │   ├── search/
│   │   ├── saved/
│   │   ├── profile/
│   │   └── reminder/
│   │
│   ├── components/
│   ├── services/
│   │   ├── api.ts
│   │   └── drugInfo.ts
│   │
│   └── firebase/
│       └── config.ts
│
├── backend/
│   ├── main.py
│   └── ai/
│       ├── agent.py
│       └── model.py
│
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* Python 3
* Expo CLI
* A Firebase project
* API keys for Gemini and Tavily

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd medicine_app
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure Firebase

Create your Firebase project and configure your Firebase credentials in:

```text
src/firebase/config.ts
```

Enable:

* Firebase Authentication
* Cloud Firestore

### 4. Configure environment variables

Create a `.env` file for the backend:

```env
GOOGLE_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
FDA_API_KEY=your_openfda_api_key
```

> **Never commit API keys or `.env` files to Git.**

### 5. Install backend dependencies

Navigate to the backend:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 6. Start the FastAPI server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 7. Start the Expo app

From the project root:

```bash
npx expo start
```

For iOS:

```bash
npx expo run:ios
```

---

## 🔐 Security

MediTrack uses Firebase Authentication to protect user-specific data.

User-specific information is stored under:

```text
Users/
└── {userId}/
    ├── medications/
    └── doseHistory/
```

Cached medication information is stored separately:

```text
DrugInfo/
└── {rxcui}
```

API keys for Gemini, Tavily, and OpenFDA should remain on the backend and should **never be exposed in the client application**.

---

## 🧠 AI Research Agent

The AI component is implemented using **LangGraph**.

The agent receives medication information and determines whether additional research is necessary.

```text
Medication Information
          │
          ▼
       Gemini
          │
     Need research?
       ┌──┴──┐
      No    Yes
       │      │
       │      ▼
       │    Tavily
       │      │
       └──────┘
          │
          ▼
   Structured DrugInfo
```

The agent is intentionally limited in how many external search calls it can make, helping reduce unnecessary API usage and preventing uncontrolled tool loops.

---

## 📊 Data Sources

MediTrack uses several sources for medication information:

| Source        | Purpose                                                  |
| ------------- | -------------------------------------------------------- |
| **RxNorm**    | Medication identification and RxCUI lookup               |
| **OpenFDA**   | FDA drug labeling and safety information                 |
| **Tavily**    | Web research when additional information is required     |
| **Gemini**    | Research reasoning and structured information extraction |
| **Firestore** | Cached medication information                            |

---

## ⚠️ Disclaimer

MediTrack is an educational/software project and **is not a substitute for professional medical advice**.

Medication information may be incomplete, outdated, or incorrectly interpreted. Users should consult a qualified healthcare professional before making decisions about medications or treatment.

---

## 🔮 Future Improvements

* [ ] Push notifications for medication reminders
* [ ] Improved dose history and adherence tracking
* [ ] More robust drug interaction detection
* [ ] Additional authoritative medical sources
* [ ] Backend deployment
* [ ] Improved AI source verification
* [ ] Offline access to cached medication information
* [ ] Personalized medication insights

---

## 👨‍💻 Built With

Built as a full-stack project combining **React Native, Firebase, FastAPI, LangGraph, and Gemini** to explore mobile development, API integration, AI agents, and medication information retrieval.

**MediTrack — making medication management simpler.** 💊
