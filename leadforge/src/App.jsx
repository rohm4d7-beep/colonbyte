import { Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';

export default function App() {
  return (
    <div className="min-h-screen bg-bg">
      <TopBar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
        </Routes>
      </main>
    </div>
  );
}
