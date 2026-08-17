import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store';
import { getToken } from './lib/api';

import Landing from './screens/Landing';
import SignUp from './screens/auth/SignUp';
import LogIn from './screens/auth/LogIn';
import Recover from './screens/auth/Recover';
import Onboarding from './screens/onboarding/Onboarding';

import Shell from './components/Shell';
import Home from './screens/Home';
import Missions from './screens/Missions';
import MissionDetail from './screens/MissionDetail';
import Forgetting from './screens/Forgetting';
import Timeline from './screens/Timeline';
import Chat from './screens/Chat';
import ActionCenter from './screens/ActionCenter';
import NoviHub from './screens/NoviHub';
import Intelligence from './screens/Intelligence';
import Agents from './screens/Agents';
import AgentDetail from './screens/AgentDetail';
import Autonomy from './screens/Autonomy';
import Memory from './screens/Memory';
import Settings from './screens/Settings';
import Permission from './screens/Permission';
import MissionComplete from './screens/MissionComplete';

import ConfirmSheet from './components/ConfirmSheet';
import Toasts from './components/Toasts';

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useStore((s) => s.user);
  const booted = useStore((s) => s.booted);
  const loc = useLocation();
  if (!booted) return <BootScreen />;
  if (!user && !getToken()) return <Navigate to="/welcome" replace state={{ from: loc }} />;
  if (!user) return <BootScreen />;
  return children;
}

function BootScreen() {
  return (
    <div style={{ height: '100dvh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div className="eyebrow" style={{ letterSpacing: '0.22em' }}>NOVI</div>
        <div className="spin" />
      </div>
    </div>
  );
}

export default function App() {
  const boot = useStore((s) => s.boot);
  const booted = useStore((s) => s.booted);
  const user = useStore((s) => s.user);

  useEffect(() => { boot(); }, [boot]);

  // Safety net: surface an unexpected failed action instead of silently swallowing it.
  useEffect(() => {
    const onReject = (e: PromiseRejectionEvent) => {
      const msg = e.reason instanceof Error ? e.reason.message : '';
      if (msg && !/not authenticated/i.test(msg)) {
        useStore.getState().toast('Something went wrong. Please try again.');
      }
    };
    window.addEventListener('unhandledrejection', onReject);
    return () => window.removeEventListener('unhandledrejection', onReject);
  }, []);

  if (!booted) return <BootScreen />;

  return (
    <>
      <Routes>
        {/* Public / auth */}
        <Route path="/welcome" element={user ? <Navigate to="/" replace /> : <Landing />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUp />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LogIn />} />
        <Route path="/recover" element={<Recover />} />

        {/* First-run mission creation */}
        <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
        <Route path="/new" element={<RequireAuth><Onboarding /></RequireAuth>} />

        {/* Permission + completion are full-screen moments */}
        <Route path="/permission" element={<RequireAuth><Permission /></RequireAuth>} />
        <Route path="/missions/:id/complete" element={<RequireAuth><MissionComplete /></RequireAuth>} />

        {/* Main app (shell) */}
        <Route element={<RequireAuth><Shell /></RequireAuth>}>
          <Route path="/" element={<Home />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/missions/:id" element={<MissionDetail />} />
          <Route path="/missions/:id/forgetting" element={<Forgetting />} />
          <Route path="/missions/:id/timeline" element={<Timeline />} />
          <Route path="/missions/:id/chat" element={<Chat />} />
          <Route path="/actions" element={<ActionCenter />} />
          <Route path="/novi" element={<NoviHub />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/autonomy" element={<Autonomy />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? '/' : '/welcome'} replace />} />
      </Routes>

      <ConfirmSheet />
      <Toasts />
    </>
  );
}
