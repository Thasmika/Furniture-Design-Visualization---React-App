# Design Document: Modern Landing Page

## Overview

This design document specifies the architecture and implementation approach for the modern landing page feature of the FurniVision application. The landing page will serve as the primary entry point for both authenticated and unauthenticated users, replacing the current redirect to /designs with a compelling, professional showcase of the application's capabilities.

The landing page will be built using React 19.2 with TypeScript, integrating seamlessly with the existing Redux Toolkit state management, Firebase authentication, and React Router navigation. The design emphasizes responsive layouts, modern animations, accessibility compliance (WCAG 2.1 Level AA), and performance optimization.

Key design principles:
- Component reusability: Leverage existing components where possible
- Progressive enhancement: Core content accessible without JavaScript
- Mobile-first responsive design: Optimize for all screen sizes
- Performance-first: Lazy loading, optimized images, minimal bundle size
- Accessibility-first: Semantic HTML, keyboard navigation, screen reader support

## Architecture

### Component Hierarchy

```
LandingPage (Container)
├── LandingNavBar
│   ├── Logo
│   ├── NavLinks (Desktop)
│   ├── MobileMenu (Mobile)
│   └── AuthButtons / UserMenu
├── HeroSection
│   ├── HeroContent
│   │   ├── Headline
│   │   ├── Tagline
│   │   └── CTAButtons
│   └── HeroBackground (Gradient/Animation)
├── FeaturesSection
│   └── FeatureCard[] (Grid)
│       ├── FeatureIcon
│       ├── FeatureTitle
│       └── FeatureDescription
├── AboutSection
│   ├── AboutContent
│   └── AboutVisual
├── BenefitsSection
│   └── BenefitCard[] (Grid)
│       ├── BenefitIcon
│       ├── BenefitTitle
│       └── BenefitDescription
├── StatisticsSection
│   └── StatCard[] (Grid)
│       ├── StatIcon
│       ├── StatNumber (Animated Counter)
│       └── StatLabel
├── TestimonialsSection
│   ├── TestimonialCarousel / Grid
│   └── TestimonialCard[]
│       ├── UserAvatar
│       ├── UserName
│       ├── StarRating
│       └── ReviewText
├── CTASection
│   ├── CTAHeadline
│   ├── CTADescription
│   └── CTAButton
└── Footer
    ├── FooterLogo
    ├── FooterLinks
    ├── SocialLinks
    └── Copyright
```

### State Management

The landing page will integrate with the existing Redux store structure:

**Existing State (Reused)**:
- `auth.user`: Determines authenticated vs unauthenticated UI
- `auth.loading`: Shows loading states during authentication checks

**New State (Landing Page Slice)**:
```typescript
interface LandingPageState {
  statistics: {
    userCount: number;
    designCount: number;
    furnitureCount: number;
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
  };
  testimonials: {
    data: Testimonial[];
    loading: boolean;
    error: string | null;
  };
}
```

### Routing Integration

The landing page will be integrated into the existing React Router configuration:

```typescript
// Update App.tsx routing
<Route path="/" element={<LandingPage />} />
```

The existing `ProtectedRoute` and `PublicRoute` components will NOT wrap the landing page, as it should be accessible to all users with conditional content based on authentication state.

### Data Flow

1. **Authentication State**: Landing page subscribes to `auth.user` from Redux store
2. **Statistics Data**: Fetched on component mount with 1-hour cache
   - User count: Firebase Authentication user count
   - Design count: Firestore `designs` collection count
   - Furniture count: Static count from furniture library
3. **Testimonials Data**: Loaded from Firestore `testimonials` collection or static config
4. **Navigation**: Uses React Router's `useNavigate` hook for programmatic navigation

## Components and Interfaces

### LandingPage (Main Container)

**Responsibility**: Root component that orchestrates all landing page sections

**Props**: None (uses Redux for state)

**State Management**:
- Subscribes to `auth.user` for authentication state
- Dispatches actions to fetch statistics and testimonials
- Manages scroll position for navbar styling

**Key Behaviors**:
- Fetches statistics on mount (with cache check)
- Fetches testimonials on mount
- Implements Intersection Observer for scroll animations
- Handles smooth scrolling for anchor links

### LandingNavBar

**Responsibility**: Fixed navigation bar with responsive behavior

**Props**:
```typescript
interface LandingNavBarProps {
  isScrolled: boolean; // Adds background when scrolled
  isAuthenticated: boolean;
  userEmail?: string | null;
}
```

**Key Features**:
- Fixed positioning with scroll-triggered background
- Hamburger menu for mobile (<768px)
- Smooth scroll to sections via anchor links
- Conditional rendering: Login/Register vs Dashboard/Logout

**Accessibility**:
- Semantic `<nav>` element
- ARIA labels for hamburger menu
- Keyboard navigation support
- Focus trap in mobile menu

### HeroSection

**Responsibility**: Eye-catching first impression with value proposition

**Props**:
```typescript
interface HeroSectionProps {
  isAuthenticated: boolean;
}
```

**Key Features**:
- Gradient background with CSS animations
- Responsive typography (clamp for fluid sizing)
- Conditional CTA buttons based on auth state
- Fade-in animation on mount (500ms)

**Content**:
- Headline: "Design Your Dream Space with FurniVision"
- Tagline: "Professional 2D/3D furniture visualization tool for interior designers and homeowners"
- CTA (Unauthenticated): "Get Started" → /register, "Sign In" → /login
- CTA (Authenticated): "Go to Dashboard" → /designs

### FeaturesSection

**Responsibility**: Showcase key application capabilities

**Props**: None

**Data Structure**:
```typescript
interface Feature {
  id: string;
  icon: string; // Emoji or icon identifier
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: 'visualization',
    icon: '👁️',
    title: '2D/3D Visualization',
    description: 'Switch seamlessly between 2D floor plans and immersive 3D views'
  },
  {
    id: 'library',
    icon: '🪑',
    title: 'Furniture Library',
    description: 'Access hundreds of furniture pieces with accurate dimensions'
  },
  {
    id: 'save-load',
    icon: '💾',
    title: 'Save & Load Designs',
    description: 'Cloud storage for all your designs, accessible anywhere'
  },
  {
    id: 'real-time',
    icon: '⚡',
    title: 'Real-time Editing',
    description: 'Instant updates as you drag, resize, and rotate furniture'
  }
];
```

**Layout**:
- Responsive grid: 1 column (mobile), 2 columns (tablet), 4 columns (desktop)
- Slide-in animation when entering viewport
- Hover effects on cards

### AboutSection

**Responsibility**: Explain application purpose and mission

**Props**: None

**Content**:
- 150-200 words describing FurniVision's purpose
- Complementary visual (illustration or screenshot)
- Fade-in animation when entering viewport (300ms)

### BenefitsSection

**Responsibility**: Highlight user advantages

**Props**: None

**Data Structure**:
```typescript
interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    id: 'time-saving',
    icon: '⏱️',
    title: 'Save Time',
    description: 'Plan your space in minutes, not hours'
  },
  {
    id: 'cost-effective',
    icon: '💰',
    title: 'Cost Effective',
    description: 'Avoid expensive mistakes before purchasing furniture'
  },
  {
    id: 'professional',
    icon: '✨',
    title: 'Professional Results',
    description: 'Create designs that look like they came from a pro'
  }
];
```

**Layout**:
- Responsive grid: 1 column (mobile), 3 columns (desktop)
- Staggered fade-in animations

### StatisticsSection

**Responsibility**: Display impressive metrics with animated counters

**Props**:
```typescript
interface StatisticsSectionProps {
  statistics: {
    userCount: number;
    designCount: number;
    furnitureCount: number;
  };
  loading: boolean;
}
```

**Key Features**:
- Animated number counting from 0 to actual value (1 second duration)
- Triggered when section enters viewport
- Fallback values if fetch fails: 1000+ users, 5000+ designs, 200+ furniture pieces

**Layout**:
- Responsive grid: 2 columns (mobile), 4 columns (desktop)
- Each stat has icon, number, and label

### TestimonialsSection

**Responsibility**: Display user reviews and ratings

**Props**:
```typescript
interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  loading: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  avatar?: string; // URL or null for placeholder
  rating: number; // 1-5
  review: string;
  date?: string;
}
```

**Key Features**:
- Carousel implementation for mobile/tablet
- Grid layout for desktop (3 columns)
- Star rating visualization (filled/empty stars)
- Smooth transitions between testimonials (carousel)

**Fallback**: If no testimonials available, display placeholder message

### CTASection

**Responsibility**: Final call-to-action before footer

**Props**:
```typescript
interface CTASectionProps {
  isAuthenticated: boolean;
}
```

**Content**:
- Headline: "Ready to Transform Your Space?"
- Description: "Join thousands of users creating beautiful room designs"
- CTA (Unauthenticated): "Start Designing Now" → /register
- CTA (Authenticated): "Open Dashboard" → /designs

**Styling**:
- Contrasting background (gradient or solid color)
- Large, prominent button
- Centered layout

### Footer

**Responsibility**: Site-wide footer with links and information

**Props**: None

**Content**:
- FurniVision logo and tagline
- Links: Contact, Reviews, Profile (if authenticated)
- Social media links (Instagram, TikTok, YouTube)
- Copyright: "© 2026 FurniVision Inc. All rights reserved."

**Styling**:
- Distinct background color (teal gradient matching existing design)
- Responsive layout: stacked (mobile), horizontal (desktop)

## Data Models

### Statistics Data Model

```typescript
interface Statistics {
  userCount: number;
  designCount: number;
  furnitureCount: number;
}

interface StatisticsCache {
  data: Statistics;
  timestamp: number;
}
```

**Cache Strategy**:
- Store in localStorage with timestamp
- Cache duration: 1 hour (3600000ms)
- Cache key: `furnivision_landing_stats`

### Testimonial Data Model

```typescript
interface Testimonial {
  id: string;
  name: string;
  avatar: string | null;
  rating: number; // 1-5, validated
  review: string; // Max 200 characters
  date: string; // ISO date string
  verified: boolean; // Optional verification badge
}

interface TestimonialsData {
  testimonials: Testimonial[];
  lastUpdated: string;
}
```

**Validation Rules**:
- `rating`: Must be integer between 1 and 5
- `review`: Non-empty string, max 200 characters
- `name`: Non-empty string, max 50 characters

### Feature/Benefit Data Models

```typescript
interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number; // Display order
}

interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}
```

These will be defined as static constants in the component files, but structured to allow future migration to Firestore if needed.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties and examples. Many criteria relate to visual design, animations, and responsive layouts which are better tested through manual testing, visual regression testing, or accessibility tools rather than property-based tests.

**Redundancy Analysis**:
- Multiple criteria test that specific sections exist (Hero, Features, About, etc.) - these are all examples, not properties
- Multiple criteria test conditional rendering based on auth state - these are examples for specific UI states
- Criteria 4.6, 6.4, 7.6, 8.3, 8.7 all test that cards have required fields - these can be combined into properties about data structure validation
- Criteria 16.2, 16.3, 16.5 all test accessibility rules that apply to all elements of a type - these are properties
- Criteria 8.4 tests star rating rendering which is a property about rating values

**Properties to Implement**:
1. All feature cards have icon, title, and description (combines 4.6)
2. All benefit cards have icon (from 6.4)
3. All stat cards have label and number (from 7.6)
4. All testimonial cards have name, rating, and review (from 8.3)
5. All testimonials have avatar or placeholder (from 8.7)
6. Star ratings render correct number of stars for any rating value (from 8.4)
7. All images have alt text (from 16.2)
8. All interactive elements are keyboard accessible (from 16.3)
9. All icon-only buttons have ARIA labels (from 16.5)
10. Heading hierarchy is logical without skipping levels (from 16.6)
11. Images below fold have lazy loading (from 17.2)
12. Statistics cache works correctly for any timestamp (from 19.5)
13. Testimonial data validation for any testimonial (from 20.5)
14. CTA buttons navigate to correct routes (from 3.4)

### Property 1: Feature Card Completeness

*For any* feature card rendered in the Features section, the card must display an icon, a title, and a description.

**Validates: Requirements 4.6**

### Property 2: Benefit Card Completeness

*For any* benefit card rendered in the Benefits section, the card must display an icon.

**Validates: Requirements 6.4**

### Property 3: Statistic Card Completeness

*For any* statistic card rendered in the Statistics section, the card must display both a label and a numerical value.

**Validates: Requirements 7.6**

### Property 4: Testimonial Card Completeness

*For any* testimonial card rendered in the Testimonials section, the card must display a user name, a rating, and review text.

**Validates: Requirements 8.3**

### Property 5: Testimonial Avatar Presence

*For any* testimonial card rendered, the card must display either a user avatar image or a placeholder image.

**Validates: Requirements 8.7**

### Property 6: Star Rating Rendering

*For any* rating value between 1 and 5, the star rating component must render exactly that number of filled stars and (5 - rating) empty stars.

**Validates: Requirements 8.4**

### Property 7: Image Alt Text

*For any* img element rendered on the landing page, the element must have a non-empty alt attribute.

**Validates: Requirements 16.2**

### Property 8: Keyboard Accessibility

*For any* interactive element (button, link, input) rendered on the landing page, the element must be reachable via keyboard navigation (Tab key).

**Validates: Requirements 1.5, 16.3**

### Property 9: Icon Button ARIA Labels

*For any* button element that contains only an icon (no visible text), the button must have an aria-label attribute.

**Validates: Requirements 16.5**

### Property 10: Heading Hierarchy

*For any* sequence of heading elements (h1, h2, h3, h4, h5, h6) on the landing page, the heading levels must not skip levels (e.g., h1 → h3 is invalid, h1 → h2 → h3 is valid).

**Validates: Requirements 16.6**

### Property 11: Lazy Loading Images

*For any* image element that is positioned below the initial viewport (below the fold), the image must have the loading="lazy" attribute.

**Validates: Requirements 17.2**

### Property 12: Statistics Cache Validity

*For any* timestamp, if the statistics cache exists and the current time minus the cache timestamp is less than 1 hour (3600000ms), then the cached data should be used instead of fetching new data.

**Validates: Requirements 19.5**

### Property 13: Testimonial Data Validation

*For any* testimonial object loaded from the data source, the object must have a non-empty name string, a rating integer between 1 and 5, and a non-empty review string.

**Validates: Requirements 20.5**

### Property 14: CTA Navigation

*For any* CTA button click, the navigation function must be called with the correct route based on authentication state (unauthenticated → /register or /login, authenticated → /designs).

**Validates: Requirements 3.4**

## Error Handling

### Network Errors

**Statistics Fetching**:
- If Firebase Authentication query fails, display fallback value: "1000+ Users"
- If Firestore designs query fails, display fallback value: "5000+ Designs"
- If furniture library count fails, display fallback value: "200+ Furniture Pieces"
- Log errors to console for debugging
- Show user-friendly message: "Statistics temporarily unavailable"

**Testimonials Fetching**:
- If Firestore testimonials query fails, display placeholder message: "User testimonials coming soon"
- Log errors to console for debugging
- Gracefully degrade to empty state without breaking page layout

### Data Validation Errors

**Testimonial Validation**:
- If testimonial missing required fields (name, rating, review), skip that testimonial
- If rating is out of range (not 1-5), default to 5 stars
- If review text exceeds 200 characters, truncate with ellipsis
- Log validation errors to console

**Statistics Validation**:
- If statistics values are negative, display 0
- If statistics values are non-numeric, display fallback values
- If cache data is corrupted, clear cache and fetch fresh data

### Authentication State Errors

**Redux Store Connection**:
- If auth state is undefined, treat as unauthenticated user
- If user object is malformed, log error and treat as unauthenticated
- Ensure all conditional rendering has fallback for undefined states

### Navigation Errors

**Route Navigation**:
- Wrap navigation calls in try-catch blocks
- If navigation fails, log error and show toast notification
- Provide fallback: "Unable to navigate. Please try again."

### Cache Errors

**LocalStorage Errors**:
- If localStorage is unavailable (private browsing), skip caching
- If localStorage quota exceeded, clear old cache entries
- If cache read fails, treat as cache miss and fetch fresh data
- If cache write fails, log error but continue with fresh data

### Intersection Observer Errors

**Animation Triggers**:
- Check for Intersection Observer API support before use
- If not supported, show all content without animations
- Wrap observer callbacks in try-catch to prevent crashes
- Gracefully degrade to static content if animations fail

## Testing Strategy

### Dual Testing Approach

The landing page will be tested using both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Rendering of specific sections (Hero, Features, About, etc.)
- Conditional rendering based on authentication state
- User interactions (button clicks, navigation)
- Error states and fallback values
- Component integration with Redux and React Router

**Property-Based Tests**: Focus on universal properties across all inputs
- Data structure validation (features, benefits, testimonials)
- Accessibility compliance (alt text, ARIA labels, keyboard navigation)
- Star rating rendering for all rating values
- Cache behavior for any timestamp
- Heading hierarchy for any heading sequence

### Property-Based Testing Configuration

**Library**: fast-check (already in dependencies)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property reference
- Tag format: `Feature: modern-landing-page, Property {number}: {property_text}`

**Example Test Structure**:
```typescript
import fc from 'fast-check';

// Feature: modern-landing-page, Property 6: Star Rating Rendering
test('star rating renders correct number of stars for any rating', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 5 }),
      (rating) => {
        const { container } = render(<StarRating rating={rating} />);
        const filledStars = container.querySelectorAll('.star-filled');
        const emptyStars = container.querySelectorAll('.star-empty');
        
        expect(filledStars.length).toBe(rating);
        expect(emptyStars.length).toBe(5 - rating);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Focus Areas

**Component Rendering**:
- Landing page renders all sections in correct order
- Each section renders with expected content
- Conditional content based on authentication state

**User Interactions**:
- CTA buttons navigate to correct routes
- Hamburger menu toggles on mobile
- Logout button dispatches logout action
- Anchor links trigger smooth scroll

**Data Fetching**:
- Statistics fetched on mount
- Testimonials fetched on mount
- Cache checked before fetching
- Fallback values displayed on error

**Accessibility**:
- Semantic HTML structure
- Focus management for keyboard navigation
- ARIA attributes on interactive elements
- Reduced motion preference respected

### Integration Testing

**Redux Integration**:
- Landing page subscribes to auth state
- Auth state changes trigger re-render
- Navigation preserves auth state

**Router Integration**:
- Landing page accessible at root route
- Navigation calls use correct routes
- Browser history updated correctly

**Firebase Integration** (E2E tests):
- Statistics fetched from Firebase
- Testimonials fetched from Firestore
- Authentication state synced with Firebase

### Visual Regression Testing

**Recommended Tools**: Percy, Chromatic, or Playwright screenshots

**Test Cases**:
- Landing page at mobile viewport (375px)
- Landing page at tablet viewport (768px)
- Landing page at desktop viewport (1440px)
- Authenticated vs unauthenticated states
- Hover states on interactive elements
- Scroll-triggered navbar styling

### Performance Testing

**Lighthouse CI**:
- Performance score ≥ 85
- Accessibility score = 100
- Best Practices score ≥ 90
- SEO score ≥ 90

**Bundle Size**:
- Landing page chunk < 100KB gzipped
- Total page size < 2MB
- Images optimized (WebP with fallbacks)

### Accessibility Testing

**Automated Tools**:
- axe-core for WCAG 2.1 Level AA compliance
- jest-axe for unit test integration
- Lighthouse accessibility audit

**Manual Testing**:
- Keyboard navigation through all interactive elements
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast verification
- Focus indicator visibility

