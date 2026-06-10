# Product Requirements Document (PRD): DealVote

## 1. Executive Summary
**DealVote** is a specialized, community-moderated marketplace connecting buyers and sellers of used PC hardware, laptops, and electronics. Unlike traditional marketplaces, DealVote employs a Reddit-style upvote/downvote mechanism to crowd-source pricing fairness, ensuring that well-priced items gain visibility while overpriced or misleading listings are pushed to the bottom of the feed. The system facilitates discovery and communication but does not process financial transactions.

## 2. Architecture & Technology Stack
* **Backend:** ASP.NET Core (C#)
* **Architecture Pattern:** Modular Monolith using Vertical Slice Architecture (VSA).
* **API Design:** Minimal APIs (Strictly no MediatR; utilizing direct handler injection or static delegates).
* **Identity Provider:** Keycloak (OIDC/OAuth2).
* **Frontend:** React (Responsive web design for desktop and mobile).
* **Database:** PostgreSQL (Relational data, Full-Text Search, and JSONB for faceted filtering).
* **Real-time Communication:** SignalR (WebSockets).
* **Media Storage:** Cloudinary.
* **Caching:**

## 3. Core Domain Modules (Vertical Slices)

### 3.1. Identity & Profiles Module
* **Authentication:** Offloaded entirely to Keycloak.
* **User Profiles:** * Users have a public profile displaying their 5-star rating (Uber-style).
    * Displays lifetime metrics: Total items sold, total items bought.
    * Displays user history: Active listings and past sold listings.
* **Reputation System:** Ratings are calculated based on post-transaction feedback from both buyers and sellers.

### 3.2. Catalog & Marketplace Module
* **Listing Creation:** Authenticated users can create listings containing:
    * Title, Description, Price.
    * Images (uploaded to Cloudinary).
    * Hardware-specific categories and facets (e.g., Generation, Socket, VRAM, Form Factor).
* **Listing Lifecycle:**
    * Active: Visible in the main feed and search results.
    * Sold: Sellers manually mark items as "Sold". The item is immediately removed from the main feed and search results, but remains visible in the seller's and buyer's historical profiles for reference.
* **Public Access:** Unauthenticated users can view the feed, search, and filter, but cannot vote, chat, or view full user profiles.

### 3.3. Search & Discovery Module
* **Feed Algorithm:** * Listings are ordered descending by total vote score.
    * Heavy downvotes push listings to the absolute bottom of the pagination.
* **Faceted Filtering:** Dynamic filtering based on hardware categories (e.g., filtering Motherboards by Intel/AMD, Socket Type, Generation, and Price Range).
* **Search Engine:** Implemented via PostgreSQL Full-Text Search on Titles/Descriptions, combined with JSONB queries for dynamic hardware attributes.

### 3.4. Voting & Interaction Module
* **Core Action:** Authenticated users can Upvote or Downvote an active listing.
* **Anti-Manipulation Rules:**
    * *Account Age:* New accounts are restricted from voting for the first `X` days.
    * *Device/IP Limiting:* Prevent rapid sequential voting from the same IP address.
    * *Self-Voting:* Users cannot vote on their own listings.

### 3.5. Communication Module (Chat)
* **Real-Time Messaging:** Instant messaging between prospective buyers and sellers via SignalR.
* **Media Sharing:** Users can upload and send images directly within the chat interface (backed by Cloudinary).
* **Contextual Chats:** Chat threads are intrinsically linked to the specific Product ID being discussed.

### 3.6. Moderation Module
* **Reporting System:** Users can flag listings or for:
    * Inappropriate content.
    * Spam / Scam attempts.
    * Mis-categorization.
* **Admin Dashboard:** Basic UI for platform administrators to review flagged items, shadowban users, or delete listings.

## 4. Non-Functional Requirements (NFRs)

### 4.1. Performance & Caching
* **Public Feed Speed:** Unauthenticated feed requests and standard search queries must be cached to achieve sub-200ms response times.
* **Cache Invalidation:** The feed cache should be on a short sliding expiration (e.g., 60 seconds) or event-driven invalidation to balance performance with vote accuracy.

### 4.2. Scalability
* The Modular Monolith must enforce strict boundaries between domains (e.g., `Catalog` cannot directly access `Identity` database tables). Communication between slices should happen via domain events or explicit internal service calls.
* SignalR hubs must be designed statelessly to allow scaling out via a backplane (e.g., Garnet/Redis) in the future.

### 4.3. Security
* **Endpoints:** All state-mutating endpoints (Minimal APIs) must require valid JWTs issued by Keycloak.
* **Rate Limiting:** Implement ASP.NET Core Rate Limiting middleware to protect login flows, listing creation, and voting endpoints from automated bot abuse.

### 4.4. UI/UX
* **Responsive Design:** The React frontend must prioritize a mobile-first layout, ensuring the chat and voting interfaces are highly usable on small touch screens.
* **State Management:** Minimal global state; favor localized fetching and caching (e.g., React Query or SWR) for handling the feed and voting states.
