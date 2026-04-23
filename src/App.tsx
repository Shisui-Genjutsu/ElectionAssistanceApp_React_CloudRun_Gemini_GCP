import { useState, useEffect } from 'react';
import type { AppContext, RouteId } from './types';
import { Onboarding } from './components/Onboarding';
import { Sidebar, Topbar } from './components/Shell';
import { HomePage } from './components/HomePage';
import { TimelinePage } from './components/TimelinePage';
import { ChatPage } from './components/ChatPage';
import { BoothPage, DatesPage } from './components/OtherPages';
import { RescuePage } from './components/RescuePage';
import { FloatingAssistant } from './components/FloatingAssistant';


function App() {
  const [ctx, setCtx] = useState<AppContext | null>(null);
  const [route, setRoute] = useState<RouteId>('home');
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedCtx = localStorage.getItem('saksham_ctx');
    const savedRoute = localStorage.getItem('saksham_route');
    if (savedCtx) setCtx(JSON.parse(savedCtx));
    if (savedRoute) setRoute(savedRoute as RouteId);
    setLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (ctx) localStorage.setItem('saksham_ctx', JSON.stringify(ctx));
    localStorage.setItem('saksham_route', route);
  }, [ctx, route]);

  if (!loaded) return null;

  if (!ctx) {
    return <Onboarding onDone={(res) => {
      const { startAt, ...newCtx } = res;
      setCtx(newCtx);
      setRoute(startAt);
    }} />;
  }

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} ctx={ctx} />
      
      <main>
        <Topbar route={route} ctx={ctx} setCtx={setCtx} />
        {route === 'home' && <HomePage ctx={ctx} setRoute={setRoute} />}
        {route === 'timeline' && <TimelinePage ctx={ctx} setRoute={setRoute} />}
        {route === 'chat' && <ChatPage ctx={ctx} />}
        {route === 'booth' && <BoothPage ctx={ctx} />}
        {route === 'rescue' && <RescuePage ctx={ctx} />}
        {route === 'dates' && <DatesPage ctx={ctx} />}
      </main>

      <FloatingAssistant route={route} setRoute={setRoute} />

    </div>
  );
}

export default App;
