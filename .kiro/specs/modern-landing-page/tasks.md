# Implementation Plan: Modern Landing Page

## Overview

This implementation plan breaks down the modern landing page feature into discrete, incremental coding tasks. The approach follows a bottom-up strategy: building core data models and utilities first, then implementing individual components, integrating with Redux state management, and finally wiring everything together in the main LandingPage container.

The implementation uses React 19.2 with TypeScript for type safety, Redux Toolkit for state management, Firebase for statistics and testimonials data, and fast-check for property-based testing. The landing page will integrate seamlessly with the existing FurniVision application architecture.

## Tasks

- [x] 1. Project setup and data models
  - [x] 1.1 Create landing page directory structure
    - Create /src/pages/LandingPage directory
    - Create /src/components/landing directory for landing-specific components
    - Create /src/store/slices/landingSlice.ts for landing page state
    - _Requirements: 18.1, 18.3_
  
  - [x] 1.2 Define TypeScript interfaces for landing page data models
    - Define Feature interface (id, icon, title, description, order)
    - Define Benefit interface (id, icon, title, description, order)
    - Define Testimonial interface (id, name, avatar, rating, review, date, verified)
    - Define Statistics interface (userCount, designCount, furnitureCount)
    - Define StatisticsCache interface (data, timestamp)
    - _Requirements: 4.1, 6.1, 7.1, 8.1, 19.1, 20.1_
  
  - [x] 1.3 Create static data constants
    - Create features array with 4+ feature objects (2D/3D visualization, furniture library, save/load, real-time editing)
    - Create benefits array with 3+ benefit objects (time-saving, cost-effective, professional results)
    - Add validation for data structure completeness
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_
  
  - [ ]* 1.4 Write property tests for data model validation
    - **Property 1: Feature Card Completeness** - All features have icon, title, description
    - **Property 2: Benefit Card Completeness** - All benefits have icon
    - **Property 13: Testimonial Data Validation** - All testimonials have valid name, rating (1-5), review
    - **Validates: Requirements 4.6, 6.4, 8.3, 20.5**

- [x] 2. Implement Redux landing page slice
  - [x] 2.1 Create landingSlice with state shape
    - Define landing page state (statistics, testimonials, loading, error states)
    - Create initial state with default values
    - _Requirements: 7.1, 8.1, 19.1, 20.1_
  
  - [x] 2.2 Implement statistics actions and reducers
    - Create fetchStatistics async thunk
    - Create reducers for statistics loading, success, error states
    - Implement cache check logic (1-hour cache duration)
    - _Requirements: 7.2, 7.3, 7.4, 19.1, 19.2, 19.3, 19.5, 19.6_
  
  - [x] 2.3 Implement testimonials actions and reducers
    - Create fetchTestimonials async thunk
    - Create reducers for testimonials loading, success, error states
    - _Requirements: 8.1, 8.2, 20.1, 20.2_
  
  - [x] 2.4 Create selectors for landing page state
    - Create selectStatistics selector
    - Create selectTestimonials selector
    - Create selectStatisticsLoading selector
    - Create selectTestimonialsLoading selector
    - _Requirements: 7.1, 8.1_
  
  - [ ]* 2.5 Write unit tests for landing slice
    - Test fetchStatistics thunk with success and error cases
    - Test fetchTestimonials thunk with success and error cases
    - Test selectors return correct values
    - Test cache logic prevents unnecessary fetches
    - _Requirements: 19.5, 20.5_

- [x] 3. Implement statistics and testimonials services
  - [x] 3.1 Create statistics service
    - Implement fetchUserCount function (Firebase Authentication)
    - Implement fetchDesignCount function (Firestore designs collection)
    - Implement getFurnitureCount function (static count from library)
    - Implement cache read/write functions (localStorage)
    - Add error handling with fallback values (1000+ users, 5000+ designs, 200+ furniture)
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_
  
  - [x] 3.2 Create testimonials service
    - Implement fetchTestimonials function (Firestore or static config)
    - Implement testimonial validation function
    - Add error handling with empty state fallback
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  
  - [ ]* 3.3 Write property test for statistics cache
    - **Property 12: Statistics Cache Validity** - Cache used when timestamp < 1 hour old
    - **Validates: Requirements 19.5**
  
  - [ ]* 3.4 Write unit tests for services
    - Test statistics service with Firebase success and error cases
    - Test testimonials service with Firestore success and error cases
    - Test cache read/write with localStorage
    - Test fallback values on error
    - _Requirements: 19.4, 20.4_

- [x] 4. Implement utility components and hooks
  - [x] 4.1 Create StarRating component
    - Implement StarRating component with rating prop (1-5)
    - Render filled and empty stars based on rating value
    - Add ARIA label for accessibility
    - _Requirements: 8.4, 16.5_
  
  - [ ]* 4.2 Write property test for StarRating
    - **Property 6: Star Rating Rendering** - Correct number of filled/empty stars for any rating 1-5
    - **Validates: Requirements 8.4**
  
  - [x] 4.3 Create useIntersectionObserver hook
    - Implement custom hook for detecting element visibility
    - Return isVisible state for triggering animations
    - Add support for threshold and rootMargin options
    - _Requirements: 4.5, 5.5, 15.4_
  
  - [x] 4.4 Create useCountAnimation hook
    - Implement custom hook for animating numbers from 0 to target value
    - Use requestAnimationFrame for smooth 60fps animation
    - Duration: 1 second
    - _Requirements: 7.5, 15.6_
  
  - [ ]* 4.5 Write unit tests for utility components
    - Test StarRating renders correct stars
    - Test useIntersectionObserver detects visibility
    - Test useCountAnimation animates to target value
    - _Requirements: 7.5, 8.4_

- [x] 5. Implement LandingNavBar component
  - [x] 5.1 Create LandingNavBar component structure
    - Create component with props (isScrolled, isAuthenticated, userEmail)
    - Implement fixed positioning with scroll-triggered styling
    - Add FurniVision logo/name
    - _Requirements: 10.1, 10.5, 10.6, 10.7, 11.1_
  
  - [x] 5.2 Implement navigation links for unauthenticated users
    - Add anchor links to sections (Features, About, Testimonials)
    - Add Login and Register buttons
    - Implement smooth scroll behavior (500ms)
    - _Requirements: 10.2, 10.3, 10.4_
  
  - [x] 5.3 Implement navigation links for authenticated users
    - Add Dashboard and Profile links
    - Display user email
    - Add Logout button with Redux logout action
    - Hide Login/Register links
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 5.4 Implement responsive mobile menu
    - Add hamburger menu icon for mobile (<768px)
    - Implement menu toggle state
    - Add slide-in animation for mobile menu
    - Ensure minimum 44x44px touch targets
    - _Requirements: 12.3, 12.4, 12.6_
  
  - [x] 5.5 Add accessibility features to navbar
    - Use semantic <nav> element
    - Add ARIA labels for hamburger menu and icon buttons
    - Implement keyboard navigation support
    - Add visible focus indicators
    - _Requirements: 1.5, 16.1, 16.3, 16.4, 16.5_
  
  - [ ]* 5.6 Write property tests for navbar
    - **Property 8: Keyboard Accessibility** - All interactive elements reachable via Tab
    - **Property 9: Icon Button ARIA Labels** - All icon-only buttons have aria-label
    - **Validates: Requirements 1.5, 16.3, 16.5**
  
  - [ ]* 5.7 Write unit tests for LandingNavBar
    - Test navbar renders with unauthenticated state
    - Test navbar renders with authenticated state
    - Test hamburger menu toggles on mobile
    - Test logout button dispatches action
    - Test smooth scroll on anchor link click
    - _Requirements: 10.1, 10.4, 11.4_

- [x] 6. Implement HeroSection component
  - [x] 6.1 Create HeroSection component structure
    - Create component with isAuthenticated prop
    - Add gradient background with CSS
    - Implement responsive typography with clamp()
    - _Requirements: 2.1, 2.2, 2.3, 14.5_
  
  - [x] 6.2 Implement hero content and CTAs
    - Add headline: "Design Your Dream Space with FurniVision"
    - Add tagline describing value proposition
    - Add conditional CTA buttons based on auth state
    - Implement navigation on button click
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_
  
  - [x] 6.3 Add animations and visual effects
    - Implement fade-in animation on mount (500ms)
    - Add hover effects to CTA buttons
    - Ensure 4.5:1 contrast ratio for text
    - _Requirements: 2.4, 2.5, 3.5, 15.3, 16.7_
  
  - [ ]* 6.4 Write property test for CTA navigation
    - **Property 14: CTA Navigation** - CTAs navigate to correct routes based on auth state
    - **Validates: Requirements 3.4**
  
  - [ ]* 6.5 Write unit tests for HeroSection
    - Test hero renders with unauthenticated CTAs
    - Test hero renders with authenticated CTAs
    - Test CTA buttons navigate to correct routes
    - Test fade-in animation triggers
    - _Requirements: 2.1, 3.1, 3.3, 3.4_

- [x] 7. Implement FeaturesSection component
  - [x] 7.1 Create FeatureCard component
    - Create card component with Feature props
    - Display icon, title, and description
    - Add hover effects
    - _Requirements: 4.6_
  
  - [x] 7.2 Create FeaturesSection component
    - Map features array to FeatureCard components
    - Implement responsive grid layout (1/2/4 columns)
    - Add slide-in animation when entering viewport
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_
  
  - [ ]* 7.3 Write property test for feature cards
    - **Property 1: Feature Card Completeness** - All feature cards display icon, title, description
    - **Validates: Requirements 4.6**
  
  - [ ]* 7.4 Write unit tests for FeaturesSection
    - Test section renders all 4+ features
    - Test responsive grid layout classes
    - Test animation triggers on viewport entry
    - _Requirements: 4.1, 4.5_

- [x] 8. Implement AboutSection component
  - [x] 8.1 Create AboutSection component
    - Add 100-300 words describing FurniVision's purpose
    - Add complementary visual (illustration or screenshot)
    - Implement fade-in animation when entering viewport (300ms)
    - Position after FeaturesSection
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 8.2 Write property test for images
    - **Property 7: Image Alt Text** - All img elements have non-empty alt attribute
    - **Validates: Requirements 16.2**
  
  - [ ]* 8.3 Write unit tests for AboutSection
    - Test section renders with content
    - Test fade-in animation triggers
    - Test images have alt text
    - _Requirements: 5.1, 5.5, 16.2_

- [-] 9. Implement BenefitsSection component
  - [x] 9.1 Create BenefitCard component
    - Create card component with Benefit props
    - Display icon, title, and description
    - Add visual hierarchy styling
    - _Requirements: 6.3, 6.4_
  
  - [x] 9.2 Create BenefitsSection component
    - Map benefits array to BenefitCard components
    - Implement responsive grid layout (1/3 columns)
    - Add staggered fade-in animations
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ]* 9.3 Write property test for benefit cards
    - **Property 2: Benefit Card Completeness** - All benefit cards display icon
    - **Validates: Requirements 6.4**
  
  - [ ]* 9.4 Write unit tests for BenefitsSection
    - Test section renders all 3+ benefits
    - Test responsive grid layout classes
    - _Requirements: 6.1, 6.2_

- [x] 10. Implement StatisticsSection component
  - [x] 10.1 Create StatCard component
    - Create card component with stat props (icon, number, label)
    - Use useCountAnimation hook for number animation
    - Trigger animation when entering viewport
    - _Requirements: 7.6_
  
  - [x] 10.2 Create StatisticsSection component
    - Connect to Redux statistics state
    - Map statistics to StatCard components
    - Implement responsive grid layout (2/4 columns)
    - Display fallback values on error
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 19.4_
  
  - [ ]* 10.3 Write property test for stat cards
    - **Property 3: Statistic Card Completeness** - All stat cards display label and number
    - **Validates: Requirements 7.6**
  
  - [ ]* 10.4 Write unit tests for StatisticsSection
    - Test section renders with statistics data
    - Test fallback values on error
    - Test counter animation triggers
    - Test responsive grid layout
    - _Requirements: 7.1, 7.5, 19.4_

- [x] 11. Implement TestimonialsSection component
  - [x] 11.1 Create TestimonialCard component
    - Create card component with Testimonial props
    - Display user name, avatar/placeholder, rating, review text
    - Use StarRating component for rating display
    - _Requirements: 8.3, 8.4, 8.7_
  
  - [x] 11.2 Create TestimonialsSection component
    - Connect to Redux testimonials state
    - Implement carousel for mobile/tablet
    - Implement grid layout for desktop (3 columns)
    - Add smooth transitions between testimonials
    - Display placeholder message when no testimonials available
    - _Requirements: 8.1, 8.2, 8.5, 8.6, 20.4_
  
  - [ ]* 11.3 Write property tests for testimonial cards
    - **Property 4: Testimonial Card Completeness** - All cards have name, rating, review
    - **Property 5: Testimonial Avatar Presence** - All cards have avatar or placeholder
    - **Validates: Requirements 8.3, 8.7**
  
  - [ ]* 11.4 Write unit tests for TestimonialsSection
    - Test section renders with testimonials data
    - Test carousel navigation on mobile
    - Test grid layout on desktop
    - Test placeholder message when no testimonials
    - _Requirements: 8.1, 8.2, 8.5, 20.4_

- [x] 12. Implement CTASection component
  - [x] 12.1 Create CTASection component
    - Create component with isAuthenticated prop
    - Add headline: "Ready to Transform Your Space?"
    - Add description encouraging action
    - Add conditional CTA button based on auth state
    - Implement contrasting background (gradient or solid)
    - Position near bottom of page
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ]* 12.2 Write unit tests for CTASection
    - Test section renders with unauthenticated CTA
    - Test section renders with authenticated CTA
    - Test CTA button navigates to correct route
    - _Requirements: 9.3, 9.4_

- [x] 13. Implement Footer component
  - [x] 13.1 Create Footer component
    - Add FurniVision logo and tagline
    - Add links to Contact, Reviews, Profile (if authenticated)
    - Add social media links (Instagram, TikTok, YouTube)
    - Add copyright: "© 2026 FurniVision Inc. All rights reserved."
    - Implement distinct background color (teal gradient)
    - Implement responsive layout (stacked/horizontal)
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_
  
  - [ ]* 13.2 Write unit tests for Footer
    - Test footer renders with all links
    - Test responsive layout classes
    - Test copyright text displays
    - _Requirements: 21.1, 21.2, 21.3_

- [x] 14. Checkpoint - All individual components complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement main LandingPage container
  - [x] 15.1 Create LandingPage component structure
    - Create main container component
    - Connect to Redux auth and landing state
    - Implement scroll position tracking for navbar
    - _Requirements: 1.1, 1.2, 1.3, 18.1_
  
  - [x] 15.2 Compose all sections in LandingPage
    - Add LandingNavBar with scroll state
    - Add HeroSection with auth state
    - Add FeaturesSection
    - Add AboutSection
    - Add BenefitsSection
    - Add StatisticsSection with statistics data
    - Add TestimonialsSection with testimonials data
    - Add CTASection with auth state
    - Add Footer
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 15.3 Implement data fetching on mount
    - Dispatch fetchStatistics action on mount
    - Dispatch fetchTestimonials action on mount
    - Handle loading and error states
    - _Requirements: 7.1, 8.1, 19.1, 20.1_
  
  - [x] 15.4 Add semantic HTML structure
    - Use semantic elements (header, nav, main, section, footer)
    - Implement logical heading hierarchy (h1, h2, h3)
    - Ensure proper document structure
    - _Requirements: 16.1, 16.6_
  
  - [ ]* 15.5 Write property test for heading hierarchy
    - **Property 10: Heading Hierarchy** - Heading levels don't skip (h1→h2→h3, not h1→h3)
    - **Validates: Requirements 16.6**
  
  - [ ]* 15.6 Write unit tests for LandingPage
    - Test page renders all sections
    - Test data fetching on mount
    - Test scroll position updates navbar state
    - Test semantic HTML structure
    - _Requirements: 1.1, 1.2, 16.1_

- [x] 16. Implement responsive styles and animations
  - [x] 16.1 Create responsive CSS for mobile (<768px)
    - Implement mobile-optimized layouts for all sections
    - Stack all sections vertically
    - Ensure text readable without horizontal scrolling
    - Optimize images for mobile resolutions
    - _Requirements: 12.1, 12.2, 12.5, 12.7_
  
  - [x] 16.2 Create responsive CSS for tablet (768px-1024px)
    - Implement tablet-optimized layouts
    - Use 2-column grids for features and statistics
    - Display full navigation links (no hamburger)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 16.3 Create responsive CSS for desktop (>1024px)
    - Implement desktop-optimized layouts
    - Use 4-column grid for features
    - Center content with max-width 1400px
    - Use larger font sizes and spacing
    - Display CTAs side-by-side
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [x] 16.4 Implement CSS animations
    - Add CSS gradients to hero and CTA sections
    - Add box shadows to cards
    - Implement fade-in animations for sections
    - Implement slide-in animations for cards
    - Add hover effects to interactive elements
    - Limit animations to 60fps
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  
  - [x] 16.5 Add prefers-reduced-motion support
    - Detect prefers-reduced-motion media query
    - Disable animations when user prefers reduced motion
    - _Requirements: 15.7_
  
  - [ ]* 16.6 Write property test for lazy loading
    - **Property 11: Lazy Loading Images** - Images below fold have loading="lazy"
    - **Validates: Requirements 17.2**

- [x] 17. Integrate with existing application
  - [x] 17.1 Update App.tsx routing
    - Add route for LandingPage at root path (/)
    - Ensure landing page accessible to all users (no ProtectedRoute wrapper)
    - Maintain existing routes (/login, /register, /designs, etc.)
    - _Requirements: 1.1, 1.2, 1.3, 18.3_
  
  - [x] 17.2 Update Redux store configuration
    - Add landingSlice to store configuration
    - Ensure landing state persists correctly
    - _Requirements: 18.1_
  
  - [x] 17.3 Apply existing theme and styling
    - Use existing color scheme (teal gradient, etc.)
    - Reuse existing button components where appropriate
    - Ensure consistent styling with rest of application
    - _Requirements: 18.4, 18.5_
  
  - [x] 17.4 Test authentication state integration
    - Test landing page with unauthenticated user
    - Test landing page with authenticated user
    - Test navigation maintains auth state
    - Test logout from landing page
    - _Requirements: 1.2, 1.3, 18.2, 18.6_
  
  - [ ]* 17.5 Write integration tests
    - Test landing page loads at root route
    - Test navigation from landing page to other routes
    - Test auth state changes update landing page UI
    - _Requirements: 1.1, 18.6_

- [x] 18. Implement performance optimizations
  - [x] 18.1 Optimize images and assets
    - Use WebP format with fallbacks
    - Implement lazy loading for below-fold images
    - Optimize image sizes for different viewports
    - _Requirements: 17.2, 17.3_
  
  - [x] 18.2 Optimize JavaScript bundle
    - Defer non-critical JavaScript loading
    - Use CSS animations instead of JavaScript where possible
    - Minimize total page size to under 2MB
    - _Requirements: 17.4, 17.5, 17.6_
  
  - [x] 18.3 Test performance metrics
    - Run Lighthouse audit
    - Ensure performance score ≥ 85
    - Ensure page loads within 2 seconds
    - _Requirements: 1.4, 17.1_

- [x] 19. Implement accessibility compliance
  - [x] 19.1 Add ARIA attributes
    - Add ARIA labels to icon-only buttons
    - Add ARIA live regions for dynamic content
    - Add ARIA roles where semantic HTML insufficient
    - _Requirements: 16.5_
  
  - [x] 19.2 Ensure keyboard navigation
    - Test all interactive elements accessible via Tab
    - Implement focus trap in mobile menu
    - Add visible focus indicators
    - _Requirements: 1.5, 16.3, 16.4_
  
  - [x] 19.3 Verify color contrast
    - Ensure all text meets 4.5:1 contrast ratio (normal text)
    - Ensure large text meets 3:1 contrast ratio
    - Test with color contrast analyzer
    - _Requirements: 2.5, 16.7_
  
  - [ ]* 19.4 Write accessibility property tests
    - **Property 7: Image Alt Text** - All images have non-empty alt
    - **Property 8: Keyboard Accessibility** - All interactive elements reachable via Tab
    - **Property 9: Icon Button ARIA Labels** - Icon-only buttons have aria-label
    - **Validates: Requirements 16.2, 16.3, 16.5**
  
  - [ ]* 19.5 Run accessibility audit
    - Run axe-core accessibility tests
    - Run Lighthouse accessibility audit (score = 100)
    - Test with screen reader (NVDA, JAWS, or VoiceOver)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [ ] 20. Final checkpoint and testing
  - [ ] 20.1 Run all unit tests
    - Ensure all component unit tests pass
    - Ensure all service unit tests pass
    - Ensure all Redux slice tests pass
    - _Requirements: All_
  
  - [ ] 20.2 Run all property-based tests
    - Ensure all 14 property tests pass with 100+ iterations
    - Verify properties cover all acceptance criteria
    - _Requirements: 4.6, 6.4, 7.6, 8.3, 8.4, 8.7, 16.2, 16.3, 16.5, 16.6, 17.2, 19.5, 20.5_
  
  - [ ] 20.3 Test responsive layouts
    - Test on mobile viewport (375px)
    - Test on tablet viewport (768px)
    - Test on desktop viewport (1440px)
    - _Requirements: 12.1, 13.1, 14.1_
  
  - [ ] 20.4 Test authentication flows
    - Test landing page as unauthenticated user
    - Test landing page as authenticated user
    - Test login flow from landing page
    - Test registration flow from landing page
    - Test logout from landing page
    - _Requirements: 1.2, 1.3, 3.1, 3.2, 3.3, 11.4_
  
  - [ ] 20.5 Final checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- The landing page integrates with existing Redux store, Firebase services, and React Router
- All components use TypeScript for type safety
- Responsive design follows mobile-first approach
- Accessibility compliance targets WCAG 2.1 Level AA
- Performance optimization targets Lighthouse score ≥ 85
