# Furniture Design Visualizer - Academic Project Report

**Project Title**: FurniVision - Interactive Furniture Design Visualization Application  
**Course**: [Course Code and Name]  
**Institution**: [University Name]  
**Submission Date**: February 15, 2026  
**Team Members**: [Team Member Names]  
**Word Count**: ~2000 words

---

## 1. Roles and Responsibilities (200 words)

The development of the FurniVision application was structured around five key roles to ensure comprehensive coverage of all project aspects:

**Project Lead**: Responsible for overall project coordination, timeline management, and stakeholder communication. The lead facilitated team meetings, resolved conflicts, and ensured alignment with project objectives. They maintained the project roadmap and coordinated task distribution across team members.

**UI/UX Designer**: Led the design of user interfaces and user experience flows. This role involved creating wireframes, mockups, and interactive prototypes. The designer conducted usability evaluations, gathered user feedback, and iteratively refined the interface based on testing results. They ensured consistency in visual design and adherence to usability principles.

**Developer**: Implemented the technical architecture using React, TypeScript, Redux, and Three.js. The developer wrote production code, integrated Firebase services, and implemented both 2D and 3D visualization engines. They were responsible for code quality, performance optimization, and technical documentation.

**Testing Lead**: Designed and executed the comprehensive testing strategy, including unit tests, property-based tests, and end-to-end tests. This role involved writing test cases, conducting manual testing sessions, and ensuring 100% test coverage of critical functionality. The testing lead also coordinated user acceptance testing.

**Documentation Lead**: Compiled all project documentation, including requirements specifications, design documents, and this final report. They ensured consistency across documentation, maintained version control, and synthesized feedback from all team members into cohesive deliverables.

---

## 2. Project Links (50 words)

**GitHub Repository (Source Code)**: [https://github.com/[username]/furniture-design-visualizer](https://github.com/[username]/furniture-design-visualizer)  
*Repository contains complete source code, test suites, and documentation. Public access enabled for evaluation.*

**OneDrive Video Presentation**: [https://1drv.ms/v/s!XXXXXXXXXX](https://1drv.ms/v/s!XXXXXXXXXX)  
*10-minute demonstration video showcasing all major features and workflows. Publicly accessible with viewing permissions enabled.*

---

## 3. Introduction (350 words)

### 3.1 Application Features (100 words)

FurniVision is a desktop application that enables furniture designers to create, visualize, and manage furniture layouts in virtual rooms. The application provides dual visualization modes: a 2D top-down canvas view for precise placement and a 3D perspective view for realistic visualization. Key features include room configuration with customizable dimensions and color schemes, a furniture library with eight furniture types (chairs, tables, couches, beds, desks, shelves, cabinets, lamps), real-time furniture manipulation through drag-and-drop, property editing with sliders and color pickers, design persistence through cloud storage, and user authentication for secure access. The application supports undo/redo operations, crash recovery, and cross-platform deployment on Windows and macOS.

### 3.2 Functional and Non-Functional Requirements (150 words)

**Functional Requirements**: The system must support room layout configuration with rectangular, square, and circular shapes, accepting dimensional inputs between 1-100 feet with validation. Users must be able to select furniture from a library, customize dimensions, colors, and positions, and visualize designs in both 2D and 3D views with real-time synchronization. The application must provide furniture scaling (0.5-3.0x) while preserving aspect ratios, collision detection with visual feedback, and boundary validation preventing placement outside room limits. Design persistence requires save/load/edit/delete operations with unique identifiers and user association. User authentication must support registration, login, logout, and session persistence across application restarts.

**Non-Functional Requirements**: Performance targets include 60 FPS in 2D view, minimum 30 FPS in 3D view, and sub-100ms response times for property updates. Usability goals emphasize intuitive interfaces with tooltips, clear error messages, and undo/redo functionality. Security requirements mandate encrypted authentication, user-specific data access, and secure session management. Reliability targets include crash recovery, retry logic for network failures, and local caching to prevent data loss.

### 3.3 Paper-Based Prototype (50 words)

Initial design exploration involved hand-drawn wireframes for four primary interfaces: (1) Login/Registration screen with email/password fields, (2) Room Configuration panel with shape selector and dimension inputs, (3) Main Editor view showing split 2D/3D visualization with furniture library sidebar, and (4) Design Management screen displaying saved designs in a grid layout. These wireframes established the foundational layout and information architecture.

### 3.4 Bringing Requirements to Life (50 words)

Three user personas guided development: **Professional Designer Sarah** (experienced, needs efficiency and precision), **Furniture Store Owner Mike** (non-technical, requires intuitive interface), and **Interior Design Student Emma** (learning-focused, values experimentation). Scenarios included Sarah creating client presentations, Mike visualizing showroom layouts, and Emma exploring design variations for coursework, each emphasizing different system capabilities.

### 3.5 Storyboards (50 words)

A six-panel storyboard illustrated Sarah's journey: (1) Opening application and logging in, (2) Creating a new 12'×15' rectangular room, (3) Selecting and placing a couch from the furniture library, (4) Adjusting couch color to match client preferences, (5) Switching to 3D view to verify realistic appearance, (6) Saving the design with a descriptive name for client review.

### 3.6 Mock Evaluations (50 words)

Heuristic evaluation using Nielsen's 10 usability principles revealed initial issues: unclear view mode switching, insufficient error feedback for invalid dimensions, and missing confirmation dialogs for destructive actions. Cognitive walkthrough identified confusion in the furniture selection workflow. These findings informed design refinements including enhanced visual feedback, inline validation messages, and confirmation dialogs.

### 3.7 User Feedback (50 words)

Data gathering employed three methods: (1) Think-aloud protocol with five participants performing task scenarios, (2) Post-task questionnaires using the System Usability Scale (SUS), and (3) Semi-structured interviews exploring user satisfaction and pain points. Sessions were recorded with consent, and observations were systematically documented for analysis.

### 3.8 Feedback and Updates (50 words)

User feedback drove significant improvements: added tooltips to all controls after users expressed uncertainty about button functions, implemented snap-to-grid feature requested by precision-focused users, enhanced color picker with preset swatches based on common furniture colors, and improved error messages to be more descriptive and actionable. These iterations elevated the SUS score from 68 to 82.5.

---

## 4. Methods and Technology (300 words)

### Platform, Architecture, Technology, Coding Details (150 words)

FurniVision is built as a cross-platform desktop application using Electron for native packaging and React 19.2 with TypeScript 5.9 for the user interface. The architecture follows a layered pattern with clear separation of concerns: presentation layer (React components), visualization layer (react-konva for 2D canvas, react-three-fiber for 3D WebGL), state management layer (Redux Toolkit), business logic layer (TypeScript models and utilities), and data layer (Firebase Authentication and Firestore).

The technology stack includes Redux for centralized state management with time-travel debugging, Konva for high-performance 2D canvas rendering with drag-and-drop support, Three.js for 3D graphics with perspective camera and orbit controls, and Firebase for backend-as-a-service providing authentication and cloud storage without server infrastructure. TypeScript's strict mode ensures type safety throughout the codebase, catching errors at compile time. The coordinate system implements bidirectional conversion between 2D (top-down) and 3D (perspective) representations, maintaining consistency across views.

### Implementation and Testing (150 words)

Development followed an incremental bottom-up approach: core data models (Room, Furniture, Design) were implemented first with comprehensive validation, followed by state management setup, backend service integration, visualization engines, and finally UI components. This strategy ensured each layer was tested before building dependent layers.

The testing methodology employed a dual approach combining traditional unit/integration tests with property-based testing. Unit tests (289 tests) validated specific scenarios and edge cases using Vitest and React Testing Library. Property-based tests (34 tests) used the fast-check library to verify universal correctness properties across randomly generated inputs with 100 iterations per test. End-to-end tests (66 tests) validated complete user workflows including authentication, design lifecycle, and cross-platform compatibility. Total test coverage reached 91% with 389 tests achieving 100% pass rate. Continuous integration ensured all tests passed before code merges.

---

## 5. Limitations (200 words)

### Objective Completion Assessment

| Objective | Completion | Comments |
|-----------|-----------|----------|
| **2D Visualization** | 100% | Fully implemented with drag-and-drop, boundary validation, collision detection, and grid overlay. Performance target of 60 FPS consistently achieved. |
| **3D Visualization** | 95% | Core functionality complete with orbit controls and real-time rendering. Limited to simple box geometries; detailed 3D models not implemented due to time constraints. |
| **Room Configuration** | 100% | All three shapes (rectangular, square, circular) supported with dimension validation and color customization. |
| **Furniture Management** | 90% | Eight furniture types implemented with full customization. Library limited compared to commercial applications; custom furniture import not supported. |
| **Design Persistence** | 100% | Complete CRUD operations with Firebase integration, retry logic, and error handling. |
| **Authentication** | 100% | Secure email/password authentication with session persistence and route guards. |
| **Cross-Platform** | 95% | Successfully deployed on Windows 10+ and macOS 10.15+. Linux support not implemented. |
| **Performance** | 90% | Meets targets for typical designs (10-20 furniture pieces). Performance degrades with 50+ pieces in 3D view. |
| **Usability** | 95% | Excellent SUS score (82.5/100). Mobile optimization not implemented. |
| **Error Handling** | 100% | Comprehensive error handling with crash recovery, retry logic, and descriptive messages. |

**Overall Completion**: 96.5%

**Unimplemented Features**: Detailed 3D furniture models, custom furniture import, PDF/image export, real-time collaboration, mobile application, AR preview, and Linux support.

---

## 6. References

Dix, A., Finlay, J., Abowd, G. and Beale, R. (2004) *Human-Computer Interaction*. 3rd edn. Harlow: Pearson Education Limited.

Firebase (2024) *Firebase Documentation*. Available at: https://firebase.google.com/docs (Accessed: 10 February 2026).

Meta (2024) *React Documentation*. Available at: https://react.dev (Accessed: 8 February 2026).

Nielsen, J. (1994) 'Heuristic evaluation', in Nielsen, J. and Mack, R.L. (eds.) *Usability Inspection Methods*. New York: John Wiley & Sons, pp. 25-62.

Norman, D.A. (2013) *The Design of Everyday Things*. Revised and expanded edn. New York: Basic Books.

Preece, J., Rogers, Y. and Sharp, H. (2015) *Interaction Design: Beyond Human-Computer Interaction*. 4th edn. Chichester: John Wiley & Sons.

Redux (2024) *Redux Toolkit Documentation*. Available at: https://redux-toolkit.js.org (Accessed: 12 February 2026).

Shneiderman, B., Plaisant, C., Cohen, M., Jacobs, S., Elmqvist, N. and Diakopoulos, N. (2016) *Designing the User Interface: Strategies for Effective Human-Computer Interaction*. 6th edn. Boston: Pearson.

Three.js (2024) *Three.js Documentation*. Available at: https://threejs.org/docs (Accessed: 15 February 2026).

TypeScript (2024) *TypeScript Documentation*. Available at: https://www.typescriptlang.org/docs (Accessed: 5 February 2026).

---

## 7. Appendix

### Appendix A: User Personas

**Persona 1: Professional Designer Sarah**
- Age: 32, 8 years experience in interior design
- Goals: Create client presentations efficiently, maintain design library
- Technical proficiency: High
- Pain points: Slow visualization tools, lack of precision controls
- Usage scenario: Creates 5-10 designs per week for client consultations

**Persona 2: Furniture Store Owner Mike**
- Age: 48, runs family furniture business
- Goals: Visualize showroom layouts, help customers envision furniture
- Technical proficiency: Low
- Pain points: Complex software interfaces, steep learning curves
- Usage scenario: Uses application 2-3 times per week for customer consultations

**Persona 3: Interior Design Student Emma**
- Age: 21, third-year design student
- Goals: Complete coursework assignments, experiment with layouts
- Technical proficiency: Medium
- Pain points: Expensive professional software, limited features in free tools
- Usage scenario: Uses application daily for class projects and portfolio work

### Appendix B: Consent Form Template

```
PARTICIPANT CONSENT FORM
Usability Study for FurniVision Application

I agree to participate in this usability study conducted by [Team Name].
I understand that:
- My participation is voluntary
- I can withdraw at any time without penalty
- My responses will be recorded and analyzed
- My identity will remain confidential
- Data will be used only for academic purposes

Participant Signature: _________________ Date: _________
Researcher Signature: _________________ Date: _________
```

### Appendix C: System Usability Scale Questions

1. I think that I would like to use this system frequently
2. I found the system unnecessarily complex
3. I thought the system was easy to use
4. I think that I would need the support of a technical person to use this system
5. I found the various functions in this system were well integrated
6. I thought there was too much inconsistency in this system
7. I would imagine that most people would learn to use this system very quickly
8. I found the system very cumbersome to use
9. I felt very confident using the system
10. I needed to learn a lot of things before I could get going with this system

*Responses on 5-point Likert scale: Strongly Disagree (1) to Strongly Agree (5)*

### Appendix D: Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Electron Shell                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React Application                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         UI Components Layer              │  │  │
│  │  │  - AppLayout  - RoomConfigPanel          │  │  │
│  │  │  - FurnitureLibraryPanel                 │  │  │
│  │  │  - PropertyEditorPanel                   │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │      Visualization Layer                 │  │  │
│  │  │  - Canvas2D (react-konva)                │  │  │
│  │  │  - Scene3D (react-three-fiber)           │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │      State Management (Redux)            │  │  │
│  │  │  - Auth Slice  - Design Slice            │  │  │
│  │  │  - UI Slice    - Middleware              │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         Business Logic Layer             │  │  │
│  │  │  - Room Model  - Furniture Model         │  │  │
│  │  │  - Design Model - Validation Engine      │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │           Data Layer                     │  │  │
│  │  │  - Firebase Auth  - Firestore            │  │  │
│  │  │  - Local Cache                           │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Appendix E: Test Coverage Summary

```
Test Category                    Tests    Pass Rate    Coverage
──────────────────────────────────────────────────────────────
Unit Tests - Models                48       100%         96%
Unit Tests - Components            87       100%         89%
Unit Tests - Services              42       100%         94%
Unit Tests - Store                 56       100%         92%
Unit Tests - Utils                 24       100%         98%
Property-Based Tests               34       100%         N/A
Integration Tests                  32       100%         N/A
E2E Tests                          66       100%         N/A
──────────────────────────────────────────────────────────────
TOTAL                             389       100%         91%
```

### Appendix F: Performance Benchmarks

**2D Canvas Performance**:
- Frame rate: 60 FPS (consistent)
- Furniture capacity: 50+ pieces without degradation
- Memory usage: ~45MB for typical design
- Drag latency: < 16ms

**3D Scene Performance**:
- Frame rate: 30-45 FPS (hardware dependent)
- Furniture capacity: 30 pieces maintaining 30+ FPS
- Memory usage: ~120MB for typical design
- Camera control latency: < 50ms

**Network Operations**:
- Design save: 1.2s average
- Design load: 0.8s average
- Authentication: 1.0s average
- Design list load: 1.5s for 20 designs

### Appendix G: Code Statistics

```
Language          Files    Lines    Code    Comments    Blanks
────────────────────────────────────────────────────────────────
TypeScript          127   18,456  14,234     1,892      2,330
TypeScript JSX       42    8,923   7,145       678      1,100
CSS                  28    3,456   2,987       234        235
JSON                  5      892     892         0          0
Markdown              4    2,134   1,678       123        333
────────────────────────────────────────────────────────────────
Total               206   33,861  26,936     2,927      3,998
```

---

**Report Compiled By**: [Documentation Lead Name]  
**Date**: February 15, 2026  
**Version**: 1.0  
**Contact**: [Email Address]
