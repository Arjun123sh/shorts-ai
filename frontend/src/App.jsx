import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Video, Home as HomeIcon, LayoutDashboard } from 'lucide-react';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import JobDetails from './pages/JobDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <nav className="glass sticky top-0 z-50 rounded-b-2xl mx-4 mt-2 px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:text-blue-400 transition-colors">
            <Video className="w-8 h-8 text-blue-500" />
            <span>Shorts AI</span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <HomeIcon className="w-4 h-4" />
              <span>Create</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </nav>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/job/:id" element={<JobDetails />} />
          </Routes>
        </main>

        <footer className="text-center py-6 text-slate-500 text-sm">
          Built with React & FastAPI
        </footer>
      </div>
    </Router>
  );
}

export default App;
