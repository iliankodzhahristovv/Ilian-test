import posthog from 'posthog-js'

// Client-side PostHog configuration
export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

    if (POSTHOG_KEY) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll capture manually
        capture_pageleave: true,
        loaded: () => {
          if (process.env.NODE_ENV === 'development') console.log('PostHog loaded')
        }
      })
    } else {
      console.warn('PostHog key not found. Please add NEXT_PUBLIC_POSTHOG_KEY to your environment variables.')
    }
  }
}

// Event tracking helper functions
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties)
  }
}

// Specific tracking functions for your expense tracker
export const trackExpenseEvent = {
  added: (expense: { amount: number; category: string; description?: string }) => {
    trackEvent('expense_added', {
      amount: expense.amount,
      category: expense.category,
      has_description: !!expense.description,
    })
  },
  
  edited: (expense: { amount: number; category: string; expenseId: string }) => {
    trackEvent('expense_edited', {
      amount: expense.amount,
      category: expense.category,
      expense_id: expense.expenseId,
    })
  },
  
  deleted: (expenseId: string) => {
    trackEvent('expense_deleted', {
      expense_id: expenseId,
    })
  }
}

export const trackUserEvent = {
  signedUp: (userId: string) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.identify(userId)
      posthog.capture('user_signed_up')
    }
  },
  
  signedIn: (userId: string) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.identify(userId)
      posthog.capture('user_signed_in')
    }
  },
  
  signedOut: () => {
    trackEvent('user_signed_out')
    if (typeof window !== 'undefined' && posthog) {
      posthog.reset()
    }
  }
}

export const trackPageView = (pageName: string) => {
  trackEvent('$pageview', {
    $current_url: window.location.href,
    page_name: pageName
  })
}

export default posthog
