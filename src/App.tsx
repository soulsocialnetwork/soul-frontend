import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
const InitialPage = lazy(() => import('./pages/Initial'));
import { AuthProvider } from './context/AuthContext';
const AuthPage = lazy(() => import('./pages/Auth'));
const FeedPage = lazy(() => import('./pages/Feed'));
const SoulsPage = lazy(() => import('./pages/Soults'));
const ScreentimePage = lazy(() => import('./pages/Screentime'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const MessagesPage = lazy(() => import('./pages/Messages'));
const CreatePage = lazy(() => import('./pages/Create'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const UserProfilePage = lazy(() => import('./pages/UserProfile'));
const PostDetailPage = lazy(() => import('./pages/PostDetail'));
const CreateHighlightPage = lazy(() => import('./pages/CreateHighlight/CreateHighlightPage'));
const DigitalEducationPage = lazy(() => import('./pages/DigitalEducation'));
const DataTransparencyPage = lazy(() => import('./pages/DataTransparency'));
import { PrivateRoute, PublicRoute } from './components/router/PrivateRoute';
const VerifyEmailPage = lazy(() => import('./pages/Auth/VerifyEmail.tsx'));
const ModerationPage = lazy(() => import('./pages/Moderation'));

const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPassword'));

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Suspense fallback={<div role="status" className="p-8 text-center">Carregando...</div>}><Routes>
          {/* Rotas públicas — se já logado, vai pro feed */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<InitialPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
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
        </Routes></Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}