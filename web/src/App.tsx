import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationFormPage from "./pages/ApplicationFormPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";


function App() {
  return (
      <Router>
        <div className="App">
          <Routes>
            {/* Страница со списком заявок */}
            <Route path="/applications" element={<ApplicationsPage />} />

            {/* Страница создания заявки */}
            <Route path="/applications/create" element={<ApplicationFormPage />} />

            {/* Страница 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
