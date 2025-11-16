# Requirements Document

## Introduction

This document defines requirements for implementing complete internationalization (i18n) of the VibeStudy platform. Currently, the application has partial localization where some UI elements remain in Russian when the user switches to English. The goal is to ensure that 100% of user-facing content, including AI-generated responses, buttons, labels, tasks, and all other interface elements, are properly localized based on the selected language.

## Glossary

- **VibeStudy Platform**: The 90-day programming education web application
- **Locale**: The user's selected language preference (Russian or English)
- **LocaleSwitcher**: The UI component that allows users to toggle between languages
- **Translation Keys**: Structured keys used to retrieve localized strings from translation files
- **AI-Generated Content**: Dynamic content created by the Hugging Face API including theory, tasks, hints, and explanations
- **Hardcoded Strings**: Text strings directly embedded in component code rather than retrieved from translation files
- **i18n System**: The internationalization infrastructure consisting of translation files, locale store, and helper functions

## Requirements

### Requirement 1

**User Story:** As a user, I want all UI elements to display in my selected language, so that I can fully understand the interface without encountering mixed-language content

#### Acceptance Criteria

1. WHEN the user selects English via the LocaleSwitcher, THE VibeStudy Platform SHALL display all buttons, labels, headings, and navigation elements in English
2. WHEN the user selects Russian via the LocaleSwitcher, THE VibeStudy Platform SHALL display all buttons, labels, headings, and navigation elements in Russian
3. THE VibeStudy Platform SHALL eliminate all hardcoded Russian strings from component files
4. THE VibeStudy Platform SHALL retrieve all UI text from the centralized translation files located in src/lib/i18n/locales/
5. WHERE a component displays user-facing text, THE VibeStudy Platform SHALL use translation keys to fetch the appropriate localized string

### Requirement 2

**User Story:** As a user, I want AI-generated content (theory, tasks, hints, explanations) to be in my selected language, so that I can learn effectively in my preferred language

#### Acceptance Criteria

1. WHEN the user requests theory generation, THE VibeStudy Platform SHALL pass the current locale to the AI API endpoint
2. WHEN the user requests task generation, THE VibeStudy Platform SHALL pass the current locale to the AI API endpoint
3. WHEN the user requests a hint, THE VibeStudy Platform SHALL pass the current locale to the AI API endpoint
4. WHEN the user requests code explanation, THE VibeStudy Platform SHALL pass the current locale to the AI API endpoint
5. THE VibeStudy Platform SHALL include locale-specific system prompts that instruct the AI to respond in the target language

### Requirement 3

**User Story:** As a user, I want task descriptions, solution hints, and feedback messages to appear in my selected language, so that I can understand what is expected and receive clear guidance

#### Acceptance Criteria

1. WHEN a task is displayed in the TaskModal, THE VibeStudy Platform SHALL show the task prompt in the selected locale
2. WHEN a task includes a solution hint, THE VibeStudy Platform SHALL display the hint text in the selected locale
3. WHEN code validation returns feedback, THE VibeStudy Platform SHALL present success or error messages in the selected locale
4. THE VibeStudy Platform SHALL localize all task-related labels including "Theory", "Tasks", "Recap Task", and task difficulty indicators
5. WHEN the user completes a task, THE VibeStudy Platform SHALL display completion messages in the selected locale

### Requirement 4

**User Story:** As a user, I want the Playground interface to be fully localized, so that I can experiment with code using interface elements in my preferred language

#### Acceptance Criteria

1. WHEN the user opens the Playground, THE VibeStudy Platform SHALL display all section headings in the selected locale
2. THE VibeStudy Platform SHALL localize all Playground buttons including "Run Code", "Format", "Clear", and "Save"
3. THE VibeStudy Platform SHALL display Playground tips and instructions in the selected locale
4. WHEN code execution produces output, THE VibeStudy Platform SHALL show status messages ("Running...", "Loading editor...") in the selected locale
5. THE VibeStudy Platform SHALL localize the language selection prompt in the Playground

### Requirement 5

**User Story:** As a user, I want error messages, loading states, and system notifications to appear in my selected language, so that I can understand system feedback and status updates

#### Acceptance Criteria

1. WHEN the application displays a loading indicator, THE VibeStudy Platform SHALL show loading text in the selected locale
2. WHEN an error occurs during API calls, THE VibeStudy Platform SHALL present error messages in the selected locale
3. WHEN the user performs an action that triggers a notification, THE VibeStudy Platform SHALL display the notification message in the selected locale
4. THE VibeStudy Platform SHALL localize all validation messages for user input fields
5. THE VibeStudy Platform SHALL localize all confirmation dialog messages

### Requirement 6

**User Story:** As a user, I want the onboarding tour and help content to be in my selected language, so that I can learn how to use the platform effectively

#### Acceptance Criteria

1. WHEN the onboarding tour is displayed, THE VibeStudy Platform SHALL show all tour steps in the selected locale
2. THE VibeStudy Platform SHALL localize all onboarding button labels including "Next", "Previous", "Skip", and "Complete"
3. THE VibeStudy Platform SHALL display onboarding tooltips and descriptions in the selected locale
4. WHERE help content or instructional text is shown, THE VibeStudy Platform SHALL retrieve it from translation files
5. THE VibeStudy Platform SHALL localize all placeholder text in input fields

### Requirement 7

**User Story:** As a user, I want language selection descriptions and programming language information to be localized, so that I can make informed choices about my learning path

#### Acceptance Criteria

1. WHEN the LanguageSelector component is displayed, THE VibeStudy Platform SHALL show the heading and description in the selected locale
2. THE VibeStudy Platform SHALL localize programming language descriptions for Python, JavaScript, TypeScript, Java, C++, C#, and Go
3. THE VibeStudy Platform SHALL display language selection instructions in the selected locale
4. WHERE language features or characteristics are described, THE VibeStudy Platform SHALL present them in the selected locale
5. THE VibeStudy Platform SHALL localize the "Active" status indicator for the selected programming language

### Requirement 8

**User Story:** As a developer, I want a consistent pattern for accessing translations throughout the codebase, so that maintaining and extending localization is straightforward

#### Acceptance Criteria

1. THE VibeStudy Platform SHALL provide a useTranslations hook that returns the current locale's translation object
2. THE VibeStudy Platform SHALL ensure all components use the useTranslations hook to access localized strings
3. THE VibeStudy Platform SHALL maintain type safety for translation keys using TypeScript
4. THE VibeStudy Platform SHALL organize translation keys in a hierarchical structure matching feature areas
5. WHERE new features are added, THE VibeStudy Platform SHALL require translation keys for both Russian and English locales
