import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Demo from "./pages/Demo";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import DemoDashboard from "./pages/DemoDashboard";

/* =========================================================
   PATIENT
========================================================= */

import PatientDashboard from "./pages/PatientDashboard";
import PatientInformation from "./pages/PatientInformation";
import PatientDailyReport from "./pages/PatientDailyReport";
import PatientVitals from "./pages/PatientVitals";
import PatientMedications from "./pages/PatientMedications";
import PatientQuestions from "./pages/PatientQuestions";
import PatientVoiceResponses from "./pages/PatientVoiceResponses";
import PatientAppointments from "./pages/PatientAppointments";
import PatientTimeline from "./pages/PatientTimeline";
import PatientNotifications from "./pages/PatientNotifications";
import PatientNotes from "./pages/PatientNotes";

/* =========================================================
   NURSE
========================================================= */

import {
  NurseDashboard,
  NursePatients,
  NursePatientDetail,
  NurseReports,
  NurseNotes,
  NurseNotifications,
} from "./pages/nurse/NursePages";

import { NurseVitals } from "./pages/NurseVitals";

/* =========================================================
   DOCTOR
========================================================= */

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorPatientDetail from "./pages/doctor/DoctorPatientDetail";
import DoctorReports from "./pages/doctor/DoctorReports";
import DoctorVitals from "./pages/doctor/DoctorVitals";
import DoctorNotes from "./pages/doctor/DoctorNotes";
import DoctorNotifications from "./pages/doctor/DoctorNotifications";

import DoctorQuestions from "./pages/doctor/DoctorQuestions";
import DoctorVoiceResponses from "./pages/doctor/DoctorVoiceResponses";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";

/* =========================================================
   ADMIN
========================================================= */

import AdminDashboard from "./pages/AdminDashboard";

import {
  AdminPatients,
  AdminAdmissions,
  AdminWards,
  AdminDoctors,
  AdminNurses,
  AdminAppointments,
  AdminReports,
  AdminAuditLogs,
  AdminNotifications,
  AdminSettings,
} from "./pages/admin/AdminPages";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC WEBSITE
        ===================================================== */}

        <Route element={<PublicLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/features"
            element={<Features />}
          />

          <Route
            path="/how-it-works"
            element={<HowItWorks />}
          />

          {/* Main Demo Role Selection Page */}
          <Route
            path="/demo"
            element={<Demo />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

        </Route>


        {/* =====================================================
            CARETRACK DEMO SYSTEM

            IMPORTANT:
            Demo uses ONLY DemoDashboard.
            Real Firebase pages are NOT used here.
        ===================================================== */}

        <Route
          path="/demo/:role"
          element={<DashboardLayout />}
        >

          {/* /demo/patient
              /demo/nurse
              /demo/doctor
              /demo/admin
          */}

          <Route
            index
            element={<DemoDashboard />}
          />

          {/* All demo sub-pages stay inside DemoDashboard.
              No Firebase / real system pages are used. */}

          <Route
            path="*"
            element={<DemoDashboard />}
          />

        </Route>


        {/* =====================================================
            REAL PATIENT SYSTEM
        ===================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["patient"]}
            />
          }
        >

          <Route element={<DashboardLayout />}>

            <Route
              path="/patient/dashboard"
              element={<PatientDashboard />}
            />

            <Route
              path="/patient/information"
              element={<PatientInformation />}
            />

            <Route
              path="/patient/daily-report"
              element={<PatientDailyReport />}
            />

            <Route
              path="/patient/vitals"
              element={<PatientVitals />}
            />

            <Route
              path="/patient/medications"
              element={<PatientMedications />}
            />

            <Route
              path="/patient/questions"
              element={<PatientQuestions />}
            />

            <Route
              path="/patient/voice-responses"
              element={<PatientVoiceResponses />}
            />

            <Route
              path="/patient/appointments"
              element={<PatientAppointments />}
            />

            <Route
              path="/patient/timeline"
              element={<PatientTimeline />}
            />

            <Route
              path="/patient/notifications"
              element={<PatientNotifications />}
            />

            <Route
              path="/patient/notes"
              element={<PatientNotes />}
            />

            <Route
              path="/patient/*"
              element={
                <Navigate
                  to="/patient/dashboard"
                  replace
                />
              }
            />

          </Route>

        </Route>


        {/* =====================================================
            REAL NURSE SYSTEM
        ===================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["nurse"]}
            />
          }
        >

          <Route element={<DashboardLayout />}>

            <Route
              path="/nurse/dashboard"
              element={<NurseDashboard />}
            />

            <Route
              path="/nurse/patients"
              element={<NursePatients />}
            />

            <Route
              path="/nurse/patients/:patientId"
              element={<NursePatientDetail />}
            />

            <Route
              path="/nurse/reports"
              element={<NurseReports />}
            />

            <Route
              path="/nurse/vitals"
              element={<NurseVitals />}
            />

            <Route
              path="/nurse/notes"
              element={<NurseNotes />}
            />

            <Route
              path="/nurse/notifications"
              element={<NurseNotifications />}
            />

            <Route
              path="/nurse/*"
              element={
                <Navigate
                  to="/nurse/dashboard"
                  replace
                />
              }
            />

          </Route>

        </Route>


        {/* =====================================================
            REAL DOCTOR SYSTEM
        ===================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["doctor"]}
            />
          }
        >

          <Route element={<DashboardLayout />}>

            {/* Doctor Dashboard */}

            <Route
              path="/doctor/dashboard"
              element={<DoctorDashboard />}
            />

            {/* Doctor Patients */}

            <Route
              path="/doctor/patients"
              element={<DoctorPatients />}
            />

            {/* Doctor Patient Detail */}

            <Route
              path="/doctor/patients/:patientId"
              element={<DoctorPatientDetail />}
            />

            {/* Doctor Questions */}

            <Route
              path="/doctor/questions"
              element={<DoctorQuestions />}
            />

            {/* Doctor Voice Responses */}

            <Route
              path="/doctor/voice-responses"
              element={<DoctorVoiceResponses />}
            />

            {/* Doctor Appointments */}

            <Route
              path="/doctor/appointments"
              element={<DoctorAppointments />}
            />

            {/* Doctor Reports */}

            <Route
              path="/doctor/reports"
              element={<DoctorReports />}
            />

            {/* Doctor Vitals */}

            <Route
              path="/doctor/vitals"
              element={<DoctorVitals />}
            />

            {/* Doctor Notes */}

            <Route
              path="/doctor/notes"
              element={<DoctorNotes />}
            />

            {/* Doctor Notifications */}

            <Route
              path="/doctor/notifications"
              element={<DoctorNotifications />}
            />

            {/* Doctor fallback */}

            <Route
              path="/doctor/*"
              element={
                <Navigate
                  to="/doctor/dashboard"
                  replace
                />
              }
            />

          </Route>

        </Route>


        {/* =====================================================
            REAL ADMIN SYSTEM
        ===================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            />
          }
        >

          <Route element={<DashboardLayout />}>

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/patients"
              element={<AdminPatients />}
            />

            <Route
              path="/admin/admissions"
              element={<AdminAdmissions />}
            />

            <Route
              path="/admin/wards"
              element={<AdminWards />}
            />

            <Route
              path="/admin/doctors"
              element={<AdminDoctors />}
            />

            <Route
              path="/admin/nurses"
              element={<AdminNurses />}
            />

            <Route
              path="/admin/appointments"
              element={<AdminAppointments />}
            />

            <Route
              path="/admin/reports"
              element={<AdminReports />}
            />

            <Route
              path="/admin/audit-logs"
              element={<AdminAuditLogs />}
            />

            <Route
              path="/admin/notifications"
              element={<AdminNotifications />}
            />

            <Route
              path="/admin/settings"
              element={<AdminSettings />}
            />

            <Route
              path="/admin/*"
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

          </Route>

        </Route>


        {/* =====================================================
            GLOBAL FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;