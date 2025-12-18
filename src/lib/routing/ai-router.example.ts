/**
 * Example usage of AIRouter
 * 
 * This file demonstrates how to use the AIRouter to route AI requests
 * to different models based on user tier.
 */

import { AIRouter, createAIRouter } from './ai-router';
import type { UserTier } from '@/lib/config/ai-models.config';

// Example 1: Create router for a specific tier
async function exampleBasicUsage() {
  // Create router for premium user
  const router = new AIRouter('premium');
  
  // Check which model will be used
  console.log('Using model:', router.getModelName()); // "gpt-4o"
  console.log('User tier:', router.getTier()); // "premium"
  
  // Make AI request
  const result = await router.chatCompletion([
    { role: 'system', content: 'You are a helpful programming tutor.' },
    { role: 'user', content: 'Explain what a variable is in Python.' }
  ]);
  
  console.log('AI Response:', result.raw);
  console.log('Model used:', result.model);
  console.log('Tier:', result.tier);
}

// Example 2: Using static factory methods
async function exampleStaticMethods() {
  // Create routers using static methods
  const freeRouter = AIRouter.forFree();
  const premiumRouter = AIRouter.forPremium();
  const proRouter = AIRouter.forProPlus();
  
  console.log('Free model:', freeRouter.getModelName()); // "gemini-1.5-flash"
  console.log('Premium model:', premiumRouter.getModelName()); // "gpt-4o"
  console.log('Pro+ model:', proRouter.getModelName()); // "claude-3-5-sonnet"
}

// Example 3: Using helper function
async function exampleHelperFunction() {
  const userTier: UserTier = 'premium';
  const router = createAIRouter(userTier);
  
  const result = await router.chatCompletion([
    { role: 'user', content: 'Write a hello world program in Python' }
  ], {
    temperature: 0.7,
    maxTokens: 500
  });
  
  console.log(result.raw);
}

// Example 4: Automatic fallback to free tier on error
async function exampleFallback() {
  // If premium model fails, it automatically falls back to free tier
  const router = new AIRouter('premium');
  
  try {
    const result = await router.chatCompletion([
      { role: 'user', content: 'Explain loops in JavaScript' }
    ]);
    
    // Even if premium model failed and fallback was used,
    // result.tier will still show 'premium'
    console.log('Response received from:', result.model);
    console.log('User tier:', result.tier);
  } catch (error) {
    console.error('Both premium and fallback failed:', error);
  }
}

// Example 5: Using in API routes
async function exampleApiRoute(userTier: UserTier) {
  // In your API route, get user tier from database
  // Then create router with that tier
  const router = createAIRouter(userTier);
  
  if (!router.isConfigured()) {
    throw new Error('AI is not configured');
  }
  
  const result = await router.chatCompletion([
    { role: 'system', content: 'You are a code reviewer.' },
    { role: 'user', content: 'Review this code: print("hello")' }
  ], {
    responseFormat: { type: 'json_object' }
  });
  
  return result;
}

// Example 6: Getting model configuration
function exampleModelConfig() {
  const router = new AIRouter('pro_plus');
  const config = router.getModelConfig();
  
  console.log('Model name:', config.name); // "Claude 3.5 Sonnet"
  console.log('Model ID:', config.model); // "claude-3-5-sonnet"
  console.log('Description:', config.description);
  console.log('Max tokens:', config.maxTokens); // 2500
  console.log('Temperature:', config.temperature); // 0.8
}

// Export examples for documentation
export {
  exampleBasicUsage,
  exampleStaticMethods,
  exampleHelperFunction,
  exampleFallback,
  exampleApiRoute,
  exampleModelConfig
};
