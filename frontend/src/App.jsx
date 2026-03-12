import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { InterviewProvider } from './context/InterviewContext';
import { ThemeProvider } from 'next-themes';

// Main Portal Components
import Home from './components/Home';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Jobs from './components/Jobs';
import Browse from './components/Browse';
import Profile from './components/Profile';
import JobDescription from './components/JobDescription';
import CodingPracticeList from './components/CodingPracticeList';
import ProblemDetails from './components/ProblemDetails';

// Admin Components
import Companies from './components/admin/Companies';
import CompanyCreate from './components/admin/CompanyCreate';
import CompanySetup from './components/admin/CompanySetup';
import AdminJobs from './components/admin/AdminJobs';
import PostJob from './components/admin/PostJob';
import Applicants from './components/admin/Applicants';
import CodingProblems from './components/admin/CodingProblems';
import CodingProblemList from './components/admin/CodingProblemList';
import EditCodingProblem from './components/admin/EditCodingProblem';

// Interview Bot Components
import LandingPage from './components/LandingPage';
import InterviewSetup from './components/setup/InterviewSetup';
import InterviewRoom from './components/interview/InterviewRoom';
import FeedbackReport from './components/report/FeedbackReport';
import Dashboard from './components/dashboard/Dashboard';
import ResumeParser from './components/resumeParser/ResumeParser';

// Resume Builder Components
import ResumeBuilderLayout from './pages/resume-builder/ResumeBuilderLayout';
import BuilderDashboard from './pages/resume-builder/Dashboard';
import ResumeBuilder from './pages/resume-builder/ResumeBuilder';
import ResumePreview from './pages/resume-builder/Preview';
import { Toaster } from 'react-hot-toast';

import { Provider } from 'react-redux';
import store, { persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
          <InterviewProvider>
            <Router>
            <div className="app">
              <Routes>
                {/* Main Portal Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/description/:id" element={<JobDescription />} />
                <Route path="/coding-practice" element={<CodingPracticeList />} />
                <Route path="/coding-practice/:id" element={<ProblemDetails />} />

                {/* Admin Routes */}
                <Route path="/admin/companies" element={<Companies />} />
                <Route path="/admin/companies/create" element={<CompanyCreate />} />
                <Route path="/admin/companies/:id" element={<CompanySetup />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
                <Route path="/admin/jobs/create" element={<PostJob />} />
                <Route path="/admin/jobs/:id/applicants" element={<Applicants />} />
                <Route path="/admin/coding-problems" element={<CodingProblems />} />
                <Route path="/admin/coding-problems/list" element={<CodingProblemList />} />
                <Route path="/admin/coding-problems/edit/:id" element={<EditCodingProblem />} />

                {/* Interview Bot Routes */}
                <Route path="/interview-bot" element={<LandingPage />} />
                <Route path="/setup" element={<InterviewSetup />} />
                <Route path="/interview/:configId" element={<InterviewRoom />} />
                <Route path="/report/:sessionId" element={<FeedbackReport />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/resume-parser" element={<ResumeParser />} />

                {/* Resume Builder Routes */}
                <Route path="/resume-builder" element={<ResumeBuilderLayout />}>
                  <Route index element={<BuilderDashboard />} />
                  <Route path="builder/:resumeId" element={<ResumeBuilder />} />
                  <Route path="view/:resumeId" element={<ResumePreview />} />
                </Route>
              </Routes>
              <Toaster />
            </div>
          </Router>
        </InterviewProvider>
    </PersistGate>
  </Provider>
  );
}

export default App;
