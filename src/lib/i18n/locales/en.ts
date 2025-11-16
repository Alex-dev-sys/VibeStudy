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
    backToLearning: 'Back to Learning',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    namePlaceholder: 'Your name',
    bioPlaceholder: 'Tell us about yourself...',
    joinedToday: 'Joined today',
    joinedDaysAgo: 'with us',
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
  }
};

