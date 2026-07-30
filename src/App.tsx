import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InitialPage from './pages/Initial';
import AuthPage from './pages/Auth';
import FeedPage from './pages/Feed';
import SoulsPage from './pages/Soults';
import ScreentimePage from './pages/Screentime';
import ProfilePage from './pages/Profile';
import MessagesPage from './pages/Messages';
import CreatePage from './pages/Create';
import SettingsPage from './pages/Settings';
import UserProfilePage from './pages/UserProfile';
import CreateHighlightPage from './pages/CreateHighlight/CreateHighlightPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InitialPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/soults" element={<SoulsPage />} />
        <Route path="/screentime" element={<ScreentimePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:username" element={<UserProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/highlights/create" element={<CreateHighlightPage />} />
      </Routes>
    </BrowserRouter>
  );
}