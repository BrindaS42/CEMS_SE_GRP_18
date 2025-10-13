import React from 'react';
import { featureCards, quickLinks } from '../constants/homeData.js';
import { FaTicketAlt, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// === Component 1: Feature Card for Grid (Pastel Theme) ===
const FeatureCard = ({ title, description, icon: Icon, color }) => (
    <div className={`p-6 rounded-xl shadow-lg transition duration-500 ease-in-out 
                    hover:shadow-xl hover:shadow-gray-300 transform hover:-translate-y-2 bg-white border border-gray-100`}>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color} transition duration-300 group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

// === Component 2: Quick Links Footer (Soft Pastel Theme) ===
const QuickLinksFooter = () => (
    <footer className="bg-gray-100 text-gray-700 py-10 mt-16 shadow-inner border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h4 className="text-2xl font-extrabold mb-6 text-gray-800">Explore CEMS</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                {quickLinks.map((link, index) => (
                    <Link 
                        key={index} 
                        to={link.url} 
                        className="text-base font-semibold text-indigo-600 hover:text-indigo-800 transition duration-300 
                                   flex items-center gap-2 group p-3 rounded-xl bg-white shadow-md hover:shadow-lg hover:bg-indigo-50 border border-gray-200"
                    >
                        <link.icon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
                        {link.title} 
                        <FaChevronRight className="w-4 h-4 ml-auto text-indigo-400 group-hover:translate-x-1 transition" />
                    </Link>
                ))}
            </div>
            
            {/* Footnote / Copyright */}
            <div className="border-t border-gray-300 pt-6 mt-6 text-center text-xs text-gray-500">
                &copy; {new Date().getFullYear()} Campus Event Management System (CEMS). Centralizing Campus Life.
            </div>
        </div>
    </footer>
);


// === Main Page Component ===
const HomePage = () => {
    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            
            {/* 1. Introduction Hero Section - Soft Lavender */}
            <header className="bg-indigo-100/50 text-gray-800 pt-24 pb-32 shadow-lg shadow-indigo-100/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-700 leading-tight mb-4 transition-colors duration-500">
                        Campus Event Management System
                    </h1>
                    <p className="text-xl md:text-2xl font-light mb-10 max-w-4xl mx-auto text-gray-600 transition-colors duration-500">
                        The simple, centralized platform for Discovery, Registration, Management, and Sponsorship of all college activities.
                    </p>
                    <Link 
                        to="/events" 
                        className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-full 
                                   shadow-xl bg-pink-500 text-white hover:bg-pink-600 transition duration-300 transform hover:scale-105 active:scale-95"
                    >
                        <FaTicketAlt className="mr-3 h-5 w-5" />
                        Explore Events Now
                    </Link>
                </div>
            </header>

            {/* 2. Problem/Solution Section - Clean White */}
            <section className="py-20 bg-white -mt-16 relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-4">
                        Seamless Campus Experience
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-16 max-w-5xl mx-auto">
                        We consolidate scattered event channels into one reliable source, optimizing communication for every stakeholder.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-8 bg-sky-50 rounded-2xl shadow-lg border-b-4 border-sky-200 transition duration-300 hover:shadow-2xl hover:scale-[1.02]">
                            <h3 className="text-2xl font-bold text-sky-700 mb-2">Students</h3>
                            <p className="text-gray-700">Simple discovery, quick registration, timely reminders, and clash alerts.</p>
                        </div>
                        <div className="p-8 bg-green-50 rounded-2xl shadow-lg border-b-4 border-green-200 transition duration-300 hover:shadow-2xl hover:scale-[1.02]">
                            <h3 className="text-2xl font-bold text-green-700 mb-2">Organizers</h3>
                            <p className="text-gray-700">Efficient management, team assignment, targeted notifications, and analytics.</p>
                        </div>
                        <div className="p-8 bg-pink-50 rounded-2xl shadow-lg border-b-4 border-pink-200 transition duration-300 hover:shadow-2xl hover:scale-[1.02]">
                            <h3 className="text-2xl font-bold text-pink-700 mb-2">Sponsors</h3>
                            <p className="text-gray-700">Measurable digital visibility, placement options, and comprehensive campaign analytics.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Feature Description (Carousel/Grid) Section - Soft Gray Background */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-4">
                        Platform Capabilities
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-16 max-w-4xl mx-auto">
                        Reliable core functionality ensures a smooth experience for every user role.
                    </p>
                    
                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featureCards.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>

                </div>
            </section>
            
            {/* 4. Footer with Quick Links */}
            <QuickLinksFooter />
            
        </div>
    );
};

export default HomePage;
