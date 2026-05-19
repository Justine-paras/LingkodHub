# LingkodHub: A Web-Based Service Marketplace Platform for Trusted Home Service Transactions

---

## CHAPTER 1: INTRODUCTION

### 1.1 Background of the Study
The rapid urbanization and the growing demands of modern lifestyles have significantly increased the need for on-demand home services. Tasks such as plumbing, electrical repairs, appliance maintenance, carpentry, and general cleaning are essential for household upkeep. However, the informal sector that provides these services remains highly fragmented. 

Traditionally, homeowners and clients rely on word-of-mouth recommendations, neighborhood bulletin boards, or social media platforms like Facebook groups to find local workers. Clients typically post unstructured requests (e.g., "Looking for a plumber nearby"), which initiates an ad-hoc and often chaotic hiring process. This informal approach exposes both the client and the service provider to numerous risks, including fraud, substandard work quality, and safety concerns. 

LingkodHub was conceptualized to formalize this gig-economy sector. By providing a dedicated, structured, and web-based marketplace, LingkodHub bridges the gap between homeowners in need of services and skilled local workers seeking legitimate employment. 

### 1.2 Statement of the Problem
The reliance on unstructured social media platforms for home service transactions presents several critical problems:
1. **Lack of Identity and Skill Verification:** Clients have no reliable way to verify the true identity, background, or professional qualifications of the workers they allow into their homes.
2. **Unstructured and Unsafe Payment Methods:** Transactions are strictly cash-based or peer-to-peer transfers with no escrow protections, leaving clients vulnerable to "runaway" scams and workers vulnerable to unpaid labor.
3. **Absence of a Centralized Reputation System:** Without a standardized rating and review system, excellent workers struggle to build a verifiable portfolio, and clients cannot identify workers with a history of poor performance.
4. **Inefficient Task Tracking:** There is no systematic way to track the lifecycle of a service request—from hiring to arrival, work-in-progress, and final completion.

### 1.3 Objectives of the Study
**General Objective:**
To design, develop, and implement LingkodHub—a secure, web-based service marketplace platform that streamlines the process of hiring, managing, and paying trusted local home service providers.

**Specific Objectives:**
1. To implement a secure Authentication and Verification Module, utilizing Email One-Time Passwords (OTP) and a simulated identity document verification process.
2. To develop a robust Job Posting and Bidding Engine, allowing clients to publish localized service requests and providers to submit competitive offers.
3. To integrate a Simulated Escrow Payment Mechanism that protects funds by logically locking them upon hiring and releasing them only upon verified task completion.
4. To engineer a Programmatic Handshake Workflow—utilizing an underlying messaging infrastructure—to accurately track job statuses (e.g., Arrival Confirmation, Work Submission) without exposing an open-ended peer-to-peer chat interface.
5. To establish a transparent, permanent Review and Rating System that builds accountability and trust within the platform.

### 1.4 Significance of the Study
The development of LingkodHub provides substantial benefits to several key groups:
* **Homeowners (Clients):** Offers peace of mind by providing access to a pool of verified workers, a structured hiring process, protected payments, and historical reviews to inform hiring decisions.
* **Local Service Providers (Workers):** Provides a legitimate platform to find steady work, build a professional digital portfolio, and ensure fair, guaranteed compensation through the simulated escrow system.
* **The Gig Economy Sector:** Contributes to the professionalization of informal labor, promoting fair wages, structured dispute resolution, and community safety.

### 1.5 Scope and Delimitation
**Scope:**
The system covers the complete digital lifecycle of a home service contract. It supports two primary user roles: the **Client** and the **Provider**. Core features include user registration, job posting, application processing, task lifecycle tracking, and simulated financial accounting (escrow logging and earning tracking).

**Delimitations (Limitations):**
To focus on core marketplace mechanics, the current iteration of the system has the following delimitations:
* **Simulated Financials:** Real-world payment gateways (e.g., GCash API, Maya API, Stripe) are not integrated. The system simulates escrow logic by recording transactions programmatically in the database.
* **Simulated Verification:** Facial recognition and manual ID authenticity checks are not implemented. The system automatically updates a provider's status to "verified" upon the successful upload of placeholder identity and selfie documents.
* **Off-Platform Administration:** There is no dedicated administrative dashboard. User reports and platform disputes are routed via the backend mail service directly to an external administrator email address for off-platform resolution.
* **No Direct Chat UI:** To enforce on-platform transactions and prevent bypassing, open peer-to-peer chat is intentionally omitted. Communication is limited to predefined system handshakes.

---

## CHAPTER 2: SYSTEM ARCHITECTURE AND METHODOLOGY

### 2.1 Technology Stack
LingkodHub is engineered using a modern, scalable JavaScript stack designed for high performance and responsiveness:
* **Frontend Layer (Client-Side):** 
  * **React.js:** Utilized for building a dynamic, component-based user interface.
  * **Vite:** Employed as the build tool for rapid development and optimized asset bundling.
  * **Tailwind CSS:** Used for utility-first styling, ensuring a highly responsive and modern aesthetic across all devices.
* **Backend Layer (Server-Side):**
  * **Node.js with Express.js:** Serves as the robust, asynchronous RESTful API backend, handling business logic, routing, and database transactions.
* **Database Layer:**
  * **SQLite (via `better-sqlite3`):** Chosen for its lightweight, zero-configuration nature while fully supporting complex relational data structures and strict foreign key constraints.
* **Security & Utilities:**
  * **JSON Web Tokens (JWT):** For stateless, secure session authentication.
  * **Bcrypt:** For cryptographic password hashing.
  * **Nodemailer:** For dispatching transactional emails and OTP verification codes.
  * **Multer:** For managing multipart/form-data, specifically handling image and document uploads.

### 2.2 Database Schema Overview
The relational integrity of the system is maintained through a carefully designed schema containing several interlocking tables:
1. **`users` Table:** Stores all account information. A strict constraint `CHECK(role IN ('client', 'provider'))` separates the two user types. It handles OTP tracking, verification flags, and financial account details (GCash/Maya numbers).
2. **`jobs` Table:** Represents the service requests. Tracks details like budget, category, location, and real-time status (`pending`, `in_progress`, `completed`, `cancelled`).
3. **`applications` Table:** Links Providers to Jobs. It stores the provider's pitch and bid amount, holding a status of `pending`, `accepted`, or `rejected`.
4. **`payments` Table:** The simulated ledger. It records the job ID, involved parties, amount, and payment method, tracking the flow of the simulated escrow.
5. **`job_events` Table:** Acts as the system event log for the programmatic handshake workflow (detailed in Chapter 3).
6. **`reviews` Table:** Stores the final rating (1-5 stars) and feedback provided by the client upon job completion.

---

## CHAPTER 3: DETAILED SYSTEM FEATURES AND MODULES

### 3.1 Authentication and Profile Management
Security begins at the registration phase. Users must verify their email addresses via a 6-digit OTP sent through Nodemailer before accessing sensitive dashboard features. 
* **Client Profiles:** Clients can manage up to three saved service addresses, configure default addresses, and update their GCash/Maya billing details.
* **Provider Profiles:** Providers must upload an ID and a Selfie. The Multer middleware processes these files, and upon successful upload, the system grants them a "Verified" badge, allowing them to apply for jobs.

### 3.2 Job Posting and the Bidding Engine
Clients utilize a streamlined interface to post tasks, specifying the service category, detailed descriptions, negotiability, and urgency. Once posted, the job enters the public marketplace. Providers browse localized opportunities and submit applications containing custom pitches. The Client reviews these applications, inspecting the provider's historical ratings and profile before making a hiring decision.

### 3.3 The Programmatic Handshake (Task Lifecycle Engine)
The most innovative technical implementation in LingkodHub is the task lifecycle tracking mechanism. To prevent off-platform transactions, free-form chat is disabled. Instead, the backend `job_events` table acts as a programmatic handshake channel:
1. **Arrival Confirmation:** When a Provider reaches the job site, they click "I'm Here." The frontend programmatically sends a hidden API payload containing `[SYSTEM:PROVIDER_ARRIVED]`. 
2. **Client Verification:** The Client dashboard displays a "Confirm Worker is Here" button. Clicking this dispatches `[SYSTEM:CLIENT_CONFIRMED_ARRIVAL]`.
3. **Auto-Resolution:** The frontend continuously queries the message logs. Once both handshake tags are detected, the system executes an automated API call to update the job status from `pending` to `in_progress`.
4. **Work Submission:** Upon task completion, the Provider clicks "Submit for Review," which dispatches a specific text string to the message log. The Client's dashboard parses this string, triggering the UI banner to "Review & Release Funds."

### 3.4 Escrow Payment Simulation and Earning Tracking
When a Client accepts a Provider's application, the system immediately writes a transaction to the `payments` table with a status of `completed`. Conceptually, this represents the funds being deducted from the Client and locked in escrow. 
Upon the Client finalizing the review and releasing the funds, the Provider's dashboard recalculates their "Lifetime Earnings" by querying the budgets of all jobs marked as `completed`. Withdrawals are simulated locally to calculate the remaining "Available Balance."

---

## CHAPTER 4: SECURITY AND ANTI-BYPASSING MECHANISMS

Platform integrity is maintained through deliberate architectural choices designed to keep transactions on-platform:
* **Suppression of Open Communication:** By replacing chat rooms with rigid system status updates (handshakes), users are unable to easily share personal contact information prior to hiring.
* **Mandatory Digital Trails:** Every step of the hiring and fulfillment process is logged in the database, providing an immutable audit trail.
* **Incentivized Escrow Protection:** Providers are incentivized to keep transactions on-platform to ensure they receive their "locked" funds. Clients are incentivized to use the platform to maintain the leverage of withholding funds until the task is satisfactorily completed.
* **Off-Platform Dispute Routing:** If safety concerns or disputes arise, users utilize the "Report Issue" module. This bypasses the database entirely, utilizing SMTP (Nodemailer) to email the system administrators directly, ensuring that sensitive disputes are handled privately and securely.

---

## CHAPTER 5: CONCLUSION AND RECOMMENDATIONS

### 5.1 Conclusion
LingkodHub successfully models a comprehensive digital marketplace for the informal home service sector. By structuring the hiring pipeline, simulating secure escrow payments, and integrating an innovative programmatic handshake workflow in place of free-form chat, the platform delivers a controlled, trusted, and professional environment. It achieves its primary objective of formalizing local trade labor while protecting both clients and service providers from the vulnerabilities of the traditional informal market.

### 5.2 Recommendations for Future Development
While the current system proves the viability of the concept, future iterations should focus on transitioning from simulated features to real-world integrations:
1. **Payment Gateway Integration:** Integrate third-party APIs such as Stripe, PayMongo, or direct GCash/Maya developer APIs to facilitate actual financial escrow and automated payouts.
2. **Advanced Identity Verification:** Implement third-party KYC (Know Your Customer) services utilizing AI-driven facial recognition and OCR (Optical Character Recognition) to validate government-issued IDs automatically.
3. **Dedicated Administrator Portal:** Develop an on-platform, role-based Administrator Dashboard. This portal would allow platform owners to manage users, manually mediate disputes, process refunds, and monitor platform analytics without relying on direct email routing.
4. **Real-Time WebSockets:** Upgrade the programmatic handshake polling system (currently relying on frontend interval polling and BroadcastChannels) to a WebSocket implementation (e.g., Socket.io) for instantaneous, server-pushed status updates.
