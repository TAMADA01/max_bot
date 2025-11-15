import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationFormPage from "./pages/ApplicationFormPage";
import NotFoundPage from "./pages/NotFoundPage";
import ApplicationDetailsPage from "./pages/ApplicationDetailsPage";

import MaxRedirectHandler from "./MaxRedirectHandler";

function App() {
    return (
        <Router>
            <MaxRedirectHandler />

            <div className="App">
                <Routes>
                    {/* Страница со списком заявок */}
                    <Route path="/applications" element={<ApplicationsPage/>}/>

                    {/* Страница создания заявки */}
                    <Route path="/applications/create" element={<ApplicationFormPage/>}/>

                    {/* Страница с информацией о заявке */}
                    <Route path="/applications/:id" element={<ApplicationDetailsPage/>}/>

                    {/* Страница 404 */}
                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
