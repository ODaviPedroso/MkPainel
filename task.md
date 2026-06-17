# MKPainel Development Task List

## Stage 1: Initial Setup and Architecture Reference
- [x] Document design guidelines and UI mockup references <!-- id: 1 -->
- [x] Setup .NET 8 Clean Architecture project structure and solution files <!-- id: 2 -->

## Stage 2: Core Domain and Database
- [x] Implement C# entities and Enums in Domain layer <!-- id: 3 -->
- [x] Create EF Core DbContext and database migrations in Infrastructure layer <!-- id: 4 -->

## Stage 3: Backend Services and API Implementation
- [x] Implement external API integrations (Google Ads / Meta Ads Mock Services) <!-- id: 5 -->
- [x] Implement Google & Meta OAuth mock logic <!-- id: 6 -->
- [x] Implement OpenAI Service with function calling/recommendation generation logic <!-- id: 7 -->
- [x] Develop Backend API Endpoints (Auth, Dashboard, Campaigns, AI Suggestions) <!-- id: 8 -->
- [x] Write Unit/Integration Tests for Backend APIs <!-- id: 9 -->

## Stage 4: Frontend Development
- [x] Initialize React frontend project <!-- id: 10 -->
- [x] Implement frontend design style guidelines, colors, global CSS <!-- id: 11 -->
- [x] Create Dashboard Layout, navigation, and sidebar <!-- id: 12 -->
- [x] Develop main dashboard screen with KPIs, campaign list, and AI recommendations panel <!-- id: 13 -->
- [x] Develop account onboarding & platform connection flows <!-- id: 14 -->
- [x] Integrate frontend with Backend APIs (OAuth callback, metrics syncing, approving suggestions) <!-- id: 15 -->

## Stage 5: Verification & QA Testing
- [x] E2E Testing of AI Recommendation Flow (Human-in-the-Loop approval) <!-- id: 16 -->
- [x] Verify metrics calculation and balance warnings <!-- id: 17 -->
- [x] General bug fixing and styling adjustments <!-- id: 18 -->
