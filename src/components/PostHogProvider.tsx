'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { initPostHog, trackUserEvent } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  useEffect(() => {
    // Initialize PostHog
    initPostHog()
  }, [])

  useEffect(() => {
    // Track user authentication state changes
    if (user) {
      trackUserEvent.signedIn(user.id)
    }
  }, [user])

  return <>{children}</>
}

