import { lazy, Suspense, useEffect, useState } from 'react';
import { ScreenUsageTracker } from './hooks/useScreenUsage';
import { useNotificationCount } from './hooks/useNotificationCount';
import { useAuth } from './context/AuthContext';
import { notificationService } from './services/notificationService';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
const InitialPage = lazy(() => import('./pages/Initial'));
import { AuthProvider } from './context/AuthContext';
import { SoulzinhoCursor } from './components/ui/SoulzinhoCursor';
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
const LegalPage = lazy(() => import('./pages/Legal'));
import { PrivateRoute, PublicRoute } from './components/router/PrivateRoute';
const VerifyEmailPage = lazy(() => import('./pages/Auth/VerifyEmail.tsx'));
const EmailVerificationPreviewPage = lazy(() => import('./pages/Auth/EmailVerificationPreview.tsx'));
const ConfirmEmailChangePage = lazy(() => import('./pages/Auth/ConfirmEmailChange.tsx'));
const ModerationPage = lazy(() => import('./pages/Moderation'));
const PromotePage = lazy(() => import('./pages/Promote'));

const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPassword'));

function NotificationTitle() {
  const count = useNotificationCount();
  useEffect(() => {
    document.title = count > 0 ? `(${count}) Soul` : 'Soul';
  }, [count]);
  return null;
}

function BrowserNotifications() {
  const { user } = useAuth();
  const [permissionVersion, setPermissionVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setPermissionVersion(version => version + 1);
    window.addEventListener('soul:browser-permission-updated', refresh);
    return () => window.removeEventListener('soul:browser-permission-updated', refresh);
  }, []);
  useEffect(() => {
    if (!user?.notifPush || !('Notification' in window) || Notification.permission !== 'granted') return;
    let active = true;
    let initialized = false;
    let seen = new Set<string>();
    const refresh = async () => {
      try {
        const page = await notificationService.getNotifications(0, 20);
        if (!active) return;
        const unread = page.content.filter(item => !item.read);
        const minutesNow = new Date().getHours() * 60 + new Date().getMinutes();
        const minutesOf = (value: string) => {
          const [hours, minutes] = value.split(':').map(Number);
          return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : 0;
        };
        const quietStart = minutesOf(user.quietModeStart || '22:00');
        const quietEnd = minutesOf(user.quietModeEnd || '08:00');
        const inQuietHours = quietStart <= quietEnd
          ? minutesNow >= quietStart && minutesNow < quietEnd
          : minutesNow >= quietStart || minutesNow < quietEnd;
        if (initialized && (!user.notifQuietMode || !inQuietHours) && Notification.permission === 'granted') {
          for (const item of unread.filter(item => !seen.has(item.id)).reverse()) {
            try {
              const notification = new Notification('Soul', {
                body: item.type === 'MESSAGE' ? `Nova mensagem de @${item.triggerUsername}` : `Nova interação de @${item.triggerUsername}`,
                tag: item.id,
              });
              notification.onclick = () => { window.focus(); window.location.assign(item.type === 'MESSAGE' && item.referenceId ? `/messages?conversation=${encodeURIComponent(item.referenceId)}` : '/feed'); notification.close(); };
            } catch { /* Alguns navegadores móveis exigem um service worker para notificações. */ }
          }
        }
        seen = new Set(unread.map(item => item.id));
        initialized = true;
      } catch { }
    };
    void refresh();
    const interval = window.setInterval(refresh, 15000);
    return () => { active = false; clearInterval(interval); };
  }, [user?.id, user?.notifPush, user?.notifQuietMode, user?.quietModeStart, user?.quietModeEnd, permissionVersion]);
  return null;
}

// organiza as rotas públicas, autenticadas e administrativas carregadas sob demanda
export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <SoulzinhoCursor />
        <ScreenUsageTracker />
        <NotificationTitle />
        <BrowserNotifications />
        <Suspense fallback={<div role="status" className="p-8 text-center">Carregando...</div>}><Routes>
          <Route path="/confirm-email-change" element={<ConfirmEmailChangePage />} />
          <Route path="/diretrizes" element={<LegalPage />} />
          <Route path="/privacidade" element={<LegalPage />} />
          <Route path="/termos" element={<LegalPage />} />
          <Route element={<PublicRoute />}>
            <Route path="/" element={<InitialPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/confirmar-email" element={<EmailVerificationPreviewPage />} />
          </Route>

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
            <Route path="/highlights/:id/edit" element={<CreateHighlightPage />} />
            <Route path="/education" element={<DigitalEducationPage />} />
            <Route path="/transparency" element={<DataTransparencyPage />} />
            <Route path="/moderation" element={<ModerationPage />} />
            <Route path="/promote" element={<PromotePage />} />
          </Route>
        </Routes></Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
