export interface Persona {
  id: string;
  name: string;
  initials: string;
  blurb: string;
  icon: string;
}

export interface AppContext {
  persona: Persona | null;
  state: string;
  pin?: string;
  lang: string;
}

export type RouteId = 'home' | 'timeline' | 'chat' | 'rescue' | 'booth' | 'dates';

export interface Tweaks {
  theme: 'warm' | 'midnight' | 'paper';
  size: 'md' | 'lg' | 'xl';
  hero: string;
  chat: string;
}

declare global {
  interface Window {
    __seedChat?: string | null;
    GLOSSARY?: Record<string, string>;
  }
}
