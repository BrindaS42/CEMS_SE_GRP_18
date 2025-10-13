// Frontend/src/constants/homeData.js

import { FaCalendarAlt, FaUsers, FaSearch, FaEnvelopeOpenText, FaChartLine, FaHandshake, FaBullhorn, FaRobot } from 'react-icons/fa';


// Data for the Features section
export const featureCards = [
    {
        title: "Centralized Event Discovery",
        description: "A unified, central event feed for all campus activities, replacing scattered announcements across multiple platforms.",
        icon: FaCalendarAlt,
        color: "bg-sky-100 text-sky-700",
    },
    {
        title: "Secure & Role-Based Access",
        description: "Tailored dashboards for Students, Organizers, Sponsors, and Admins, ensuring secure, restricted access to relevant tools.",
        icon: FaUsers,
        color: "bg-green-100 text-green-700",
    },
    {
        title: "Advanced Search & Filtering",
        description: "Easily find events by keywords, category, club, date, location, or specific tags for reliable event discovery.",
        icon: FaSearch,
        color: "bg-purple-100 text-purple-700",
    },
    {
        title: "Automated Reminders & Sync",
        description: "Get automated reminders (email/in-app/SMS) and export events directly to your personal calendar.",
        icon: FaEnvelopeOpenText, 
        color: "bg-yellow-100 text-yellow-700",
    },
    {
        title: "Sponsor Analytics & Visibility",
        description: "Provides sponsors with measurable data: impressions, clicks, registrations, and basic demographics for effective campaigns.",
        icon: FaChartLine,
        color: "bg-pink-100 text-pink-700",
    },
    {
        title: "Streamlined Organization Tools",
        description: "Organizers can create events, manage registrations, assign team roles, and send targeted announcements.",
        icon: FaBullhorn,
        color: "bg-indigo-100 text-indigo-700",
    },
    {
        title: "Participant Assistance",
        description: "Includes features like clash detection (for overlapping events) and an assistant chat bot for event FAQs.",
        icon: FaRobot,
        color: "bg-cyan-100 text-cyan-700",
    },
    {
        title: "Quick Registration & History",
        description: "One-click registration, instant status viewing, and a personal history of all events attended.",
        icon: FaHandshake,
        color: "bg-red-100 text-red-700",
    },
];

// Data for the Quick Links / Footer (example structure)
export const quickLinks = [
    { title: "Student Dashboard", url: "/dashboard", icon: FaUsers },
    { title: "Organizer Portal", url: "/organizer/login", icon: FaBullhorn },
    { title: "Sponsor Opportunities", url: "/sponsor/signup", icon: FaChartLine },
    { title: "Event Listing", url: "/events", icon: FaCalendarAlt },
];
