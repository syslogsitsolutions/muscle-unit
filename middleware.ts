import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)", // Protects all routes under /dashboard
  // Add any other routes you want to protect here
  // For example: '/profile', '/settings'
]);

export default clerkMiddleware(async (authFunction, req) => {
  if (isProtectedRoute(req)) {
    const authResult = await authFunction();
    if (!authResult.userId) {
      // If user is not signed in, redirect to sign-in page.
      // The returnBackUrl ensures the user is sent to their original destination after signing in.
      return authResult.redirectToSignIn({ returnBackUrl: req.url });
    }
    // If userId exists, user is signed in, and request to protected route can proceed.
  }
  // For non-protected routes, or if user is signed in on a protected route,
  // the middleware implicitly allows the request to continue by not returning a response.
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
