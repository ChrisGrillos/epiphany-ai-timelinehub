import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const SESSION_ID_KEY = 'epiphany_session_id';

function getOrCreateSessionId() {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

export function useInteractionTracking() {
  const sessionId = getOrCreateSessionId();
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trackPageView = (entityId, entityTitle, entityType, category, tags = []) => {
    base44.functions.invoke('trackInteraction', {
      event_type: 'page_view',
      entity_id: entityId,
      entity_title: entityTitle,
      entity_type: entityType,
      category,
      tags,
      session_id: sessionId
    }).catch(() => {});
  };

  const trackEvent = (eventType, data = {}) => {
    base44.functions.invoke('trackInteraction', {
      event_type: eventType,
      session_id: sessionId,
      ...data
    }).catch(() => {});
  };

  const trackTimeOnPage = (entityId, entityTitle, entityType) => {
    const cleanup = () => {
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeOnPage > 5) { // Only track if spent more than 5 seconds
        base44.functions.invoke('trackInteraction', {
          event_type: 'time_on_page',
          entity_id: entityId,
          entity_title: entityTitle,
          entity_type: entityType,
          time_on_page: timeOnPage,
          scroll_depth: maxScrollRef.current,
          session_id: sessionId
        }).catch(() => {});
      }
    };

    return cleanup;
  };

  return { trackPageView, trackEvent, trackTimeOnPage, sessionId };
}