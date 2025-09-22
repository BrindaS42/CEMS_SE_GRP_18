# Campus Event Management System (CEMS)

College events are announced across many scattered channels — WhatsApp groups, Instagram stories, posters, email threads — which makes it hard for students to discover and reliably attend activities. Organizers waste time consolidating registrations and managing logistics, while sponsors lack measurable digital visibility.

**Campus Event Management System (CEMS)** is a centralized full-stack web application that brings discovery, registration, management and sponsorship together in one place. The goal is to make event discovery simple for students, event organization efficient for committees, and sponsorship measurable for partners — all with role-based dashboards and practical features such as reminders, galleries and analytics.

---

## Platform-wide Features
These features are available across the platform and form the backbone of the system.

- **Secure authentication & role-based access** (student, organizer, sponsor, admin).  
- **Central event feed** — unified listing of all campus events.  
- **Search & filters** — search by keyword, category, club, date, location, tags.  
- **Event detail page** — full event info: description, timeline, venue, capacity, sponsors, FAQs.  
- **One-click registration** and user event history.  
- **Automated reminders & notifications** — email / in-app / optional SMS, plus calendar export.  
- **Clash detection** — warn users about overlapping registrations.  
- **Event gallery & timeline** — photos, highlights, and post-event summaries.  
- **Feedback & rating** — attendees can rate events and leave comments.  
- **Responsive, mobile-first UI** — accessible on phones and desktops.  

---

## Stakeholder only Features
Features broken down by who benefits most — this maps directly to our role-based dashboards.

### Students (Participants)
- Personalized home feed (saved interests, recommended events).  
- Quick register & see registration status.  
- Calendar sync & timely reminders.  
- Clash alerts for conflicting events.  
- Assitant chat bot for FAQs related to the events.  
- View event galleries, winners and post-event highlights.  
- Rate events and submit short feedback.  
- Peer visibility (who else is attending).

### Event Management Team (Organizers)
- Create / edit / publish events with templates.  
- Invite team members and assign roles (co-organizer, volunteer).  
- Manage registrations and capacity (waitlists).  
- Upload gallery images/video and publish highlights.  
- Send announcements or targeted notifications to registrants.  
- View basic analytics: registrations over time, attendance rates, feedback summary.  
- Export attendee lists and receipts.  
- Approve or moderate sponsor placements and deal with admin workflows.

### Sponsors / Partners
- Create sponsor profile page with logo, description, and campaign links.  
- Sponsor placement options on event pages (banner, featured slot, push notification).  
- Run promotions, contests or coupon codes via the platform.  
- Sponsor analytics: impressions, clicks, registrations from sponsor links, basic demographic breakdown.  
- Streamlined online sponsorship workflow (agreements, receipts, and contact info).
  
---

## Tech Stack

### Frontend
- **React** (Vite) — fast dev server and modern React setup.  
- **Tailwind CSS** — responsive, consistent styling.  
- **React Router** — client-side routing.  
- **Redux Toolkit** — app state management.  
- **Axios** — HTTP client for API calls.  
- **react-hook-form** — forms & validation.  
- **recharts** — sponsor/organizer charts (analytics).

### Backend
- **Node.js + Express** (ES Modules) — REST API and business logic.  
- **MongoDB + Mongoose** — flexible schema for events, users, sponsors, registrations.  
- **jsonwebtoken (JWT)** + **bcrypt** — auth and password security.  
- **OAuth (Google / GitHub)** — optional social login.  
- **Cloudinary** — file uploads for galleries and sponsor banners.  
- **Morgan** — request logging in dev.

### Dev & Deployment
- **Nodemon** for local dev.  
- **GitHub** for version control; GitHub Actions for CI/CD (recommended).  
- **Frontend hosting:** Vercel.  
- **Backend hosting:** Render.  
- **DB hosting:** MongoDB Atlas.  

### Testing / Tools
- **Jest + Supertest** (backend API tests)  
- **React Testing Library** (frontend tests)  
- ESLint / Prettier for code style

---

## Conclusion
CEMS aims to replace scattered, unreliable event communication with a simple, centralized platform that serves students, organizers, sponsors and admins. The project focuses first on reliable core functionality — authentication, unified event listing, registration, reminders and check-in — and then extends into higher-value features such as recommendations, sponsor analytics and campus maps.

