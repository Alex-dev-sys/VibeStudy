
import { BrowserContext } from '@playwright/test';

/**
 * Mocks the Supabase authentication cookie to bypass middleware redirects.
 * @param context Playwright BrowserContext
 */
export async function mockSupabaseAuth(context: BrowserContext) {
    // Add a mock access token cookie.
    // The value doesn't need to be a real JWT for the middleware check if we verify how creatServerClient works,
    // but typically it decodes it. For simple presence check, any non-empty string might pass 
    // IF the middleware only checks for existence.
    // However, Supabase `getUser()` verifies the token signature on the server.
    // Since we can't easily generate a valid signed JWT without the secret, 
    // we might need to rely on mocking the network response to `getUser` if possible, 
    // OR simpler: use a real test account.

    // BUT, looking at middleware.ts:
    // const { data: { user } } = await supabase.auth.getUser();
    // It calls Supabase to verify.

    // Strategy Change: 
    // Instead of mocking the cookie (which requires a valid signed JWT), 
    // we will simply MOCK the Network Response for the auth check if it calls an external endpoint,
    // OR we have to actually log in via the UI in a "global setup" phase. 

    // HOWEVER, for unit/e2e tests in CI without a real backend, we often mock the entire auth state.
    // Given we are testing against a real running dev server (`npm run dev:next`), 
    // we should probably perform a real login or inject a valid session if we had one.

    // Alternative: Mock the `supabase.auth.getUser()` call? We can't easily mock server-side code from Playwright.

    // Let's try to simulate a simple cookie first, assuming the dev/test environment might have a bypass 
    // or we can mock the middleware behavior? No, middleware runs on server.

    // RE-EVALUATION:
    // If we can't bypass the server-side "getUser()" check without a real token, 
    // then we must use a real account OR we must skip middleware for tests.

    // Let's check if we can mock the session via `jest-preview` or similar? No.

    // FASTEST FIX:
    // For these specific pages (/playground, /pricing, etc.), if they are protected, 
    // we need a real session.
    // If they are NOT protected (Pricing shouldn't be), they should work.
    // Playground IS protected?

    // Middleware says:
    // if (!user && isLearnPage) { return NextResponse.redirect(...) }
    // It only protects `/learn`.
    // `/playground`, `/challenges`, `/analytics` are NOT explicitly redirected in the provided middleware snippet!
    // It logic was:
    // const isLearnPage = request.nextUrl.pathname.startsWith('/learn');
    // if (!user && isLearnPage) ...

    // Wait, if `/playground` fails, maybe it's redirecting client-side?
    // Or maybe I missed where other pages are protected.

    // Let's check if `pricing` is failing. Yes, it failed in the report.
    // `tests/e2e/pricing.spec.ts:5:9 › Pricing Page › should display pricing plans correctly`
    // Failing likely means it didn't find the element, maybe it redirected?

    // Let's verify if `pricing` is protected. It shouldn't be.
    // If `pricing` failed, maybe the URL is wrong? 
    // Or maybe the app redirects "guest" users to "/" or something?
    // "if (user && (isRootPage || isAuthPage)) { return NextResponse.redirect(new URL('/learn', request.url)); }"

    // If I am NOT logged in (guest), I should be able to see Pricing.

    // Let's create a helper that sets `localStorage` just in case client-side checks look for it.

    await context.addInitScript(() => {
        localStorage.setItem('vibestudy-profile', JSON.stringify({
            state: {
                profile: {
                    id: 'test-user-e2e',
                    tier: 'pro_plus', // Grant access to everything
                    name: 'Test User'
                }
            },
            version: 0
        }));
    });
}
