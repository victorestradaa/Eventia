'use client';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, any>) => void;
      identify: (id: string, props?: Record<string, any>) => void;
      reset: () => void;
    };
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type EventiumEvent =
  // Página
  | 'pageview'
  | 'scroll_depth_50'
  | 'scroll_depth_75'
  // CTAs landing
  | 'cta_click'
  | 'category_click'
  // Registro
  | 'register_started'
  | 'register_completed'
  | 'register_failed'
  // Login
  | 'login_completed'
  // Marketplace
  | 'provider_view'
  | 'reservation_started'
  | 'reservation_completed'
  | 'payment_started'
  | 'payment_completed'
  // Cliente
  | 'event_created'
  | 'guest_added'
  | 'invitation_sent'
  // Proveedor
  | 'service_published';

export function track(event: EventiumEvent | string, props: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  try {
    const enriched = { ...props, ts: Date.now(), path: window.location.pathname };
    window.posthog?.capture(event, enriched);
    window.gtag?.('event', event, enriched);
  } catch (e) {
    // silencioso por diseño — el tracking nunca debe romper la UI
  }
}

export function identify(userId: string, traits: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.posthog?.identify(userId, traits);
    window.gtag?.('set', 'user_properties', traits);
  } catch {}
}

export function resetUser() {
  if (typeof window === 'undefined') return;
  try {
    window.posthog?.reset();
  } catch {}
}
