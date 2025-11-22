import type { Translations } from './ru';

export const en: Translations = {
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    reset: 'Reset'
  },
  home: {
    title: 'Become a Junior Developer in 90 Days',
    subtitle: 'Structured programming course from scratch to junior level',
    description: 'Theory, practice and AI-generated tasks every day',
    startButton: 'Start Learning',
    playgroundButton: 'Playground',
    features: {
      theory: 'Detailed Theory',
      editor: 'Interactive Editor',
      ai: 'AI Tasks',
      progress: 'Progress Tracking'
    },
    stats: {
      days: 'Days of Learning',
      tasks: 'Practice Tasks',
      languages: 'Languages to Choose'
    },
    footer: 'Free • No Registration • 7 Programming Languages'
  },
  navigation: {
    learn: 'Learn',
    profile: 'Profile',
    analytics: 'Analytics',
    playground: 'Playground',
    logout: 'Logout',
    day: 'Day',
    days: 'Days',
    completed: 'Completed',
    inProgress: 'In Progress',
    locked: 'Locked'
  },
  dashboard: {
    title: '90-Day Plan to Junior',
    subtitle: 'Track progress, switch between days and mark completed tasks',
    profile: 'Profile',
    playground: 'Playground',
    completed: 'Completed',
    streak: 'Streak',
    achievements: 'Achievements',
    days: 'days',
    selectLanguage: 'Choose Learning Language',
    dayNavigation: 'Day Navigation',
    generateTasks: 'Generate Theory and Tasks',
    completeDay: 'Complete Day',
    generating: 'Generating...'
  },
  profile: {
    title: 'Profile',
    subtitle: 'Manage your learning profile',
    backToLearning: 'Back to Learning',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    namePlaceholder: 'Your name',
    bioPlaceholder: 'Tell us about yourself...',
    joinedToday: 'Joined today',
    joinedDaysAgo: 'with us',
    language: 'Programming Language',
    changeLanguage: 'Change Language',
    progress: 'Progress',
    achievements: 'Achievements',
    statistics: 'Statistics',
    settings: 'Settings',
    deleteData: 'Delete All Data',
    confirmDelete: 'Are you sure? This action cannot be undone.',
    dataDeleted: 'All data has been deleted',
    stats: {
      daysCompleted: 'Days Completed',
      achievements: 'Achievements',
      progress: 'Progress'
    }
  },
  achievements: {
    title: 'Achievements',
    unlocked: 'Unlocked',
    progress: 'Progress',
    categories: {
      all: 'All',
      progress: 'Progress',
      streak: 'Streaks',
      tasks: 'Tasks',
      special: 'Special'
    },
    obtained: 'Obtained'
  },
  analytics: {
    title: 'Learning Analytics',
    subtitle: 'Track your progress and get personalized recommendations',
    backToLearning: 'Back to Learning',
    overview: 'Overview',
    detailedStats: 'Detailed Statistics',
    recommendations: 'Recommendations'
  },
  statistics: {
    title: 'Learning Statistics',
    subtitle: 'Detailed analytics of your progress and activity',
    totalDays: 'Days Completed',
    totalTasks: 'Tasks Solved',
    currentStreak: 'Current Streak',
    perfectDays: 'Perfect Days',
    timeAndProgress: 'Time and Progress',
    totalTime: 'Total Learning Time',
    completionRate: 'Completion Rate',
    avgTasksPerDay: 'Avg Tasks/Day',
    longestStreak: 'Longest Streak',
    tasksByDifficulty: 'Tasks by Difficulty',
    progressByWeeks: 'Progress by Weeks',
    activityCalendar: 'Activity Calendar',
    less: 'Less',
    more: 'More'
  },
  playground: {
    title: 'Playground',
    subtitle: 'Experiment with code, test ideas and learn by practice',
    selectLanguage: 'Choose Programming Language',
    codeEditor: 'Code Editor',
    output: 'Program Output',
    outputPlaceholder: 'Your code output will appear here',
    runCode: 'Run Code',
    running: 'Running...',
    format: 'Format',
    clear: 'Clear',
    snippets: 'Snippets',
    export: 'Export',
    savedSnippets: 'Saved Snippets',
    tips: {
      title: 'Playground Usage Tips',
      experiment: 'Experiment: Try different approaches to solving problems',
      test: 'Test Ideas: Check hypotheses before applying them to tasks',
      learn: 'Learn from Mistakes: Don\'t be afraid of errors — they help you learn',
      save: 'Save Code: Copy interesting solutions for future use',
      formatting: 'Use the "✨ Format" button to improve code readability'
    }
  },
  tasks: {
    theory: 'Day Theory',
    tasks: 'Day Tasks',
    recapTask: 'Recap Task',
    recapDescription: 'Review previous day material — don\'t forget what you learned!',
    clickToOpen: 'Click on any task to open editor and start solving',
    checkSolution: 'Check Solution',
    checking: 'Checking...',
    completed: 'Completed',
    hint: 'Hint'
  },
  editor: {
    loading: 'Loading editor...',
    placeholder: 'Write your code here...',
    formatCode: 'Format',
    clearCode: 'Clear',
    runCode: 'Run Code',
    running: 'Running...',
    saveCode: 'Save',
    editorLoadError: 'Failed to load code editor',
    useTextarea: 'Use the text field below:'
  },
  console: {
    log: 'Log',
    error: 'Error',
    warn: 'Warn',
    info: 'Info',
    stackTrace: 'Stack trace',
    copy: 'Copy'
  },
  languageSelector: {
    title: 'Choose Learning Language',
    description: 'You can change the language at any stage — tasks and theory will be automatically adjusted.',
    active: 'ACTIVE',
    languages: {
      python: {
        name: 'Python',
        description: 'Intuitive syntax, suitable for quick start and data analytics.'
      },
      javascript: {
        name: 'JavaScript',
        description: 'Language for frontend and backend, essential tool for web developers.'
      },
      typescript: {
        name: 'TypeScript',
        description: 'Strong typing on top of JavaScript — modern web standard.'
      },
      java: {
        name: 'Java',
        description: 'Reliable industry standard for enterprise systems and Android.'
      },
      cpp: {
        name: 'C++',
        description: 'High performance and memory control for system software and games.'
      },
      csharp: {
        name: 'C#',
        description: '.NET ecosystem for desktop, web, games and cloud.'
      },
      go: {
        name: 'Go',
        description: 'Compact and fast development of microservices and high-load systems.'
      }
    }
  },
  taskModal: {
    taskNumber: 'Task',
    hint: 'Hint',
    getHint: 'Hint',
    thinking: 'Thinking...',
    checkSolution: 'Check',
    checking: 'Checking...',
    clear: 'Clear',
    close: 'Close',
    solutionHint: 'Hint',
    hintNumber: 'Hint',
    hintsUsed: 'Hints used',
    recommendations: 'Improvement Recommendations',
    viewMode: 'View',
    aiChecking: 'AI is checking your solution...',
    hintOutput: 'Hint',
    example: 'Example',
    nextSteps: 'Next Steps',
    solutionCorrect: 'Solution is correct!',
    solutionIncorrect: 'Solution needs improvement',
    checkError: 'Error checking solution'
  },
  onboarding: {
    next: 'Next',
    previous: 'Back',
    skip: 'Skip',
    complete: 'Complete',
    getStarted: 'Get Started',
    keyboardHints: {
      navigate: 'Navigate',
      skipTour: 'Skip'
    },
    steps: [
      {
        title: 'Welcome to VibeStudy!',
        description: 'Let\'s get familiar with the platform. This tour will show you the main features for effective programming learning.'
      },
      {
        title: 'Choose a Programming Language',
        description: 'Start by selecting the language you want to learn. You can switch between languages anytime — progress is saved separately for each.'
      },
      {
        title: '90-Day Course Structure',
        description: 'The course is divided into 90 days. Each day contains theory, practical tasks, and a recap task to reinforce the material.'
      },
      {
        title: 'AI-Powered Content Generation',
        description: 'Click this button to generate theory and tasks for the selected day. AI will create personalized content based on your level.'
      },
      {
        title: 'Track Your Progress',
        description: 'Here you can see your statistics: completed days, current streak, and achievements. Maintain your streak for maximum motivation!'
      },
      {
        title: 'Playground for Experiments',
        description: 'Use the Playground to experiment with code, test ideas, and practice outside of the main assignments.'
      },
      {
        title: 'Ready to Start Learning?',
        description: 'Now you know the basics! Choose a programming language, generate your first day, and begin your journey to a developer career.'
      }
    ]
  },
  errors: {
    generic: 'An error occurred. Please try again later.',
    networkError: 'Network error. Check your internet connection.',
    aiUnavailable: 'AI service is temporarily unavailable. Please try again later.',
    codeCheckFailed: 'Failed to check code',
    loadingFailed: 'Failed to load data',
    hintFailed: 'Failed to get hint. Please try again later.',
    authFailed: 'Failed to verify user authentication'
  },
  notifications: {
    taskCompleted: 'Task completed successfully!',
    dayCompleted: 'Day completed!',
    achievementUnlocked: 'Achievement unlocked!',
    progressSaved: 'Progress saved',
    codeCopied: 'Code copied',
    congratulations: 'Congratulations!'
  },
  validation: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email',
    tooShort: 'Value is too short',
    tooLong: 'Value is too long'
  },
  login: {
    title: 'Sign In or Sign Up',
    welcomeBadge: 'Sign in and continue learning with AI mentor',
    welcomeTitle: 'welcomes you!',
    welcomeDescription: 'Return to your progress, get AI hints, track achievements and build your developer career. Full mode available with Google, email or guest login.',
    aiAssistant: 'AI Assistant',
    aiAssistantDesc: '24/7 hints, code checking and theory explanations.',
    adaptiveProgress: 'Adaptive Progress',
    adaptiveProgressDesc: 'Analytics, recommendations and Telegram reminders to stay on track.',
    emailLabel: 'Email',
    emailPlaceholder: 'your@email.com',
    sendLoginLink: 'Send Login Link',
    emailSentTitle: 'Email Sent!',
    emailSentDescription: 'Check your email',
    emailSentDescriptionEnd: 'and click the link to sign in',
    linkValidFor: 'Link valid for 1 hour',
    continueWithGoogle: 'Continue with Google',
    continueWithEmail: 'Continue with Email',
    continueAsGuest: 'Continue without Registration',
    redirecting: 'Redirecting...',
    termsAndPrivacy: 'By clicking the sign in button, you agree to the terms of use and privacy policy',
    or: 'or',
    errors: {
      otpExpired: 'Login link expired. Request a new link.',
      loginFailed: 'Login error. Please try again.',
      emailSendFailed: 'Failed to send email. Please try again.',
      googleNotConfigured: 'Google sign in not configured. Use Email.'
    }
  },
  feedback: {
    success: 'Success',
    error: 'Error',
    score: 'Score'
  },
  referral: {
    title: 'Referral Program',
    description: 'Invite friends and get 1 month Premium for every 5 completed registrations',
    progress: 'Progress to next reward',
    completed: 'Completed',
    pending: 'Pending',
    total: 'Total',
    yourLink: 'Your referral link',
    copy: 'Copy',
    copied: 'Copied',
    rewardsEarned: 'rewards earned',
    startInviting: 'Invite 5 friends to get 1 month Premium',
    friendsLeft: '{count} friends left to invite',
    howItWorks: 'How it works:',
    step1: 'Share the link with friends',
    step2: 'Friend registers using your link',
    step3: 'After friend\'s first login, referral is counted',
    step4: 'For every 5 referrals you get 1 month Premium',
    authRequired: 'Authentication required to view referral program'
  },
  challenges: {
    title: 'Daily Challenges',
    subtitle: 'Solve new problems every day and improve your skills',
    backToLearning: 'Back to Learning',
    todayChallenge: 'Today\'s Challenge',
    history: 'Challenge History',
    noChallengeToday: 'Today\'s challenge has not been generated yet',
    noChallengeHistory: 'Challenge history is empty',
    difficulty: 'Difficulty',
    topics: 'Topics',
    estimatedTime: 'Estimated Time',
    minutes: 'min',
    solve: 'Solve',
    solved: 'Solved',
    attempted: 'Attempted',
    notAttempted: 'Not Attempted',
    viewSolution: 'View Solution',
    submitSolution: 'Submit Solution',
    submitting: 'Submitting...',
    testCases: 'Test Cases',
    passed: 'Passed',
    failed: 'Failed',
    input: 'Input',
    output: 'Output',
    expected: 'Expected',
    actual: 'Actual',
    constraints: 'Constraints',
    examples: 'Examples',
    description: 'Description',
    inputFormat: 'Input Format',
    outputFormat: 'Output Format',
    explanation: 'Explanation',
    yourSolution: 'Your Solution',
    runTests: 'Run Tests',
    runningTests: 'Running Tests...',
    allTestsPassed: 'All tests passed!',
    someTestsFailed: 'Some tests failed',
    authRequired: 'Authentication required to save progress',
    loadError: 'Failed to load challenge',
    submitError: 'Failed to submit solution',
    selectLanguage: 'Select programming language'
  },
  help: {
    title: 'Help Center',
    subtitle: 'Find answers to frequently asked questions and learn how to use the platform effectively',
    search: 'Search questions...',
    noResults: 'No results found. Try a different query.',
    categories: {
      all: 'All',
      learning: 'Learning',
      playground: 'Playground',
      analytics: 'Analytics',
      progress: 'Progress',
      account: 'Account'
    },
    needMoreHelp: 'Need more help?',
    needMoreHelpDescription: 'If you still have questions, try the interactive tutorial again or contact support.',
    startLearning: 'Start Learning',
    contactSupport: 'Contact Support',
    floatingButton: {
      learn: {
        title: 'How does learning work?',
        startDay: 'How to start a day?',
        completeTasks: 'What to do with tasks?',
        completeDay: 'How to complete a day?',
        streak: 'What is a streak?'
      },
      playground: {
        title: 'How to use the playground?',
        purpose: 'What is the playground for?',
        runCode: 'How to run code?',
        saveSnippet: 'Can I save code?'
      },
      analytics: {
        title: 'How to read analytics?',
        calendar: 'What does the activity calendar show?',
        perfectDays: 'What are "perfect days"?',
        recommendations: 'How to use recommendations?'
      },
      profile: {
        title: 'Profile Management',
        changeLanguage: 'How to change programming language?',
        achievements: 'What are achievements?',
        syncProgress: 'How to sync progress?'
      }
    }
  },
  settings: {
    title: 'Settings',
    replayTutorial: 'Replay Tutorial',
    replayTutorialDescription: 'Go through the interactive tutorial again',
    helpStatistics: 'Help Statistics',
    helpStatisticsDescription: 'See which topics you viewed most often',
    deleteAllData: 'Delete All Data',
    deleteAllDataDescription: 'Delete all progress and start from scratch',
    deleteConfirmTitle: 'Delete all data?',
    deleteConfirmDescription: 'This action cannot be undone. All your progress, achievements and settings will be deleted.',
    tutorialReset: 'Tutorial reset',
    tutorialResetDescription: 'Go to the learning page to start again',
    noHelpStats: 'You haven\'t used the help system yet',
    dataDeleted: 'Data deleted',
    dataDeletedDescription: 'All local data has been deleted. The page will be reloaded.'
  },
  aiAssistant: {
    chat: {
      clearHistory: 'Clear History',
      clearHistoryConfirm: 'Click again to confirm',
      saveConversation: 'Save conversation',
      privacyNotice: 'Chat history is stored only in the current session.',
      privacyNoticeSaved: 'Conversation will be saved to database.',
      privacyNoticeDefault: 'History is deleted when you close the tab.',
      historyCleared: 'Chat history cleared'
    },
    paywall: {
      title: 'AI Assistant Available in Premium',
      subtitle: 'Unlock unlimited access to AI assistant',
      unlimitedRequests: 'Unlimited Requests',
      unlimitedRequestsDesc: 'Ask questions without limits',
      bestModels: 'Best AI Models',
      bestModelsDesc: 'GPT-4o and Claude 3.5 Sonnet',
      personalHelp: 'Personal Help',
      personalHelpDesc: 'Individual recommendations and advice',
      freeTier: 'Free plan: 5 requests per day',
      upgradeButton: 'Upgrade to Premium',
      closeButton: 'Close'
    },
    upgrade: {
      title: 'Subscription Expired',
      subtitle: 'Renew your subscription to continue using AI assistant',
      expiredOn: 'Expired on',
      whatYouGet: 'What you get:',
      unlimitedRequests: 'Unlimited AI requests',
      bestModels: 'Access to best models',
      personalRecommendations: 'Personal recommendations',
      prioritySupport: 'Priority support',
      renewButton: 'Renew Subscription',
      closeButton: 'Close',
      note: 'Your progress and achievements are saved'
    },
    limitReached: {
      title: 'Request Limit Reached',
      subtitle: "You've used all available requests for today",
      usageInfo: 'Used',
      resetInfo: 'Limit resets tomorrow',
      upgradeTitle: 'Want more?',
      upgradeDescription: 'Upgrade to Premium for unlimited access',
      unlimitedRequests: 'Unlimited AI requests',
      advancedModels: 'Advanced AI models',
      priorityGeneration: 'Priority generation',
      upgradeButton: 'Upgrade to Premium',
      closeButton: 'Got it'
    }
  },
  pricing: {
    title: 'Choose Your Plan',
    subtitle: 'Unlock the full potential of learning with premium access',
    backToLearning: 'Back to Learning',
    currentPlan: 'Your current plan',
    validUntil: 'Valid until',
    selectPlan: 'Select Plan',
    currentPlanBadge: 'Current Plan',
    activePlan: 'Active Plan',
    popularBadge: 'Popular',
    tiers: {
      free: {
        name: 'Free',
        duration: 'Forever',
        features: [
          '5 AI requests per day',
          'Basic AI model (Gemini 2.5)',
          'Access to all lessons',
          'Interactive code editor',
          'Progress tracking',
          'Achievement system'
        ]
      },
      premium: {
        name: 'Premium',
        duration: '30 days',
        features: [
          'Unlimited AI requests',
          'Advanced AI model (GPT-4o)',
          'Priority content generation',
          'All Free features',
          'Extended analytics',
          'Personal recommendations'
        ]
      },
      proPlus: {
        name: 'Pro+',
        duration: '30 days',
        features: [
          'Unlimited AI requests',
          'Best AI model (Claude 3.5 Sonnet)',
          'Instant content generation',
          'All Premium features',
          'Detailed learning analytics',
          'Individual development plan',
          'Priority support'
        ]
      }
    },
    benefits: {
      title: 'What You Get with Premium',
      unlimitedAi: {
        title: 'Unlimited AI',
        description: 'Unlimited AI requests for explanations, hints and task generation'
      },
      bestModels: {
        title: 'Best AI Models',
        description: 'Access to GPT-4o and Claude 3.5 Sonnet for maximum learning quality'
      },
      personalization: {
        title: 'Personalization',
        description: 'Individual recommendations and adaptive learning plan'
      }
    },
    faq: {
      title: 'Frequently Asked Questions',
      whatIsTon: {
        question: 'What is TON?',
        answer: 'TON (The Open Network) is a fast and secure blockchain with low fees. You will need a TON Wallet (Tonkeeper, Tonhub, etc.) for payment.'
      },
      howToPay: {
        question: 'How does payment work?',
        answer: 'After selecting a plan, you will receive a wallet address and unique comment. Send the specified amount of TON with this comment, and your tier will be automatically updated.'
      },
      canCancel: {
        question: 'Can I cancel my subscription?',
        answer: 'The subscription is valid for 30 days from the payment date and does not renew automatically. After expiration, you will return to the free plan.'
      },
      paymentNotConfirmed: {
        question: 'What if payment is not confirmed?',
        answer: 'Transaction verification may take a few minutes. If payment is not confirmed, make sure you specified the correct comment and sent the right amount.'
      }
    },
    payment: {
      title: 'Payment',
      sendAmount: 'Send {amount} TON to the specified address',
      amount: 'Amount',
      walletAddress: 'Wallet Address',
      comment: 'Comment (required!)',
      commentWarning: '⚠️ Be sure to specify the comment when transferring',
      validFor: 'Valid for',
      expired: 'Expired',
      scanQr: 'Scan QR code in TON Wallet',
      instructions: {
        title: 'Payment Instructions:',
        step1: '1. Open TON Wallet (Tonkeeper, Tonhub, etc.)',
        step2: '2. Scan QR code or copy address and comment',
        step3: '3. Send {amount} TON with the specified comment',
        step4: '4. Click "Verify Payment" after sending'
      },
      verifyPayment: 'Verify Payment',
      verifying: 'Verifying...',
      close: 'Close',
      needWallet: 'Need a TON Wallet?',
      paymentSuccess: '🎉 Payment successfully confirmed! Your tier has been updated.',
      paymentPending: 'Transaction not found yet. Please wait a few minutes and try again.'
    },
    errors: {
      createPaymentFailed: 'Failed to create payment',
      verifyPaymentFailed: 'Failed to verify payment',
      authRequired: 'Authentication required',
      tonNotConfigured: 'TON payment system is not configured'
    }
  }
};

