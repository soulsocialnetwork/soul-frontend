import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InitialPage from './pages/Initial';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/Auth';
import FeedPage from './pages/Feed';
import SoulsPage from './pages/Soults';
import ScreentimePage from './pages/Screentime';
import ProfilePage from './pages/Profile';
import MessagesPage from './pages/Messages';
import CreatePage from './pages/Create';
import SettingsPage from './pages/Settings';
import UserProfilePage from './pages/UserProfile';
import PostDetailPage from './pages/PostDetail';
import CreateHighlightPage from './pages/CreateHighlight/CreateHighlightPage';
import DigitalEducationPage from './pages/DigitalEducation';
import DataTransparencyPage from './pages/DataTransparency';
import { PrivateRoute, PublicRoute } from './components/router/PrivateRoute';
import VerifyEmailPage from './pages/Auth/VerifyEmail.tsx';
import ModerationPage from './pages/Moderation';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Routes>
          {/* Rotas públicas — se já logado, vai pro feed */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<InitialPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* Rotas protegidas — requer login */}
          <Route element={<PrivateRoute />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/soults" element={<SoulsPage />} />
            <Route path="/screentime" element={<ScreentimePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<UserProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/highlights/create" element={<CreateHighlightPage />} />
            <Route path="/education" element={<DigitalEducationPage />} />
            <Route path="/transparency" element={<DataTransparencyPage />} />
            <Route path="/moderation" element={<ModerationPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}