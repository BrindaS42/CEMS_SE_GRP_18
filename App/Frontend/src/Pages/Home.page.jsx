import React, { useState, useEffect } from 'react';
import { featureCards, quickLinks } from '../constants/homeData.js';
import { FaTicketAlt, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// NOTE: The URL must be the direct image link, not the Pinterest page link.
const HERO_IMAGE_URL = "https://i.pinimg.com/1200x/4e/c9/8f/4ec98f2f09f58142cf2eb2654b12d123.jpg"; 

// --- STAKEHOLDER DATA (Reorganized for Carousel) ---
// Since this data was hardcoded in the grid, we define it here to pass to the carousel component.
const stakeholderData = [
    { 
        title: "Students", 
        description: "Simple discovery, quick registration, timely reminders, and clash alerts.", 
        bgColor: "bg-sky-50", 
        borderColor: "border-sky-200", 
        textColor: "text-sky-700" 
    },
    { 
        title: "Organizers", 
        description: "Efficient management, team assignment, targeted notifications, and analytics.", 
        bgColor: "bg-green-50", 
        borderColor: "border-green-200", 
        textColor: "text-green-700" 
    },
    { 
        title: "Sponsors", 
        description: "Measurable digital visibility, placement options, and comprehensive campaign analytics.", 
        bgColor: "bg-pink-50", 
        borderColor: "border-pink-200", 
        textColor: "text-pink-700" 
    },
];

// === CAROUSEL COMPONENT (New) ===
const StakeholderCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const totalCards = stakeholderData.length;

    useEffect(() => {
        // Auto-advance the carousel every 4 seconds
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % totalCards);
        }, 4000); 

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [totalCards]);


    return (
        <div className="relative overflow-hidden w-full max-w-4xl mx-auto h-64 sm:h-72">
            <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * (100 / totalCards)}%)`, width: `${totalCards * 100}%` }}
            >
                {stakeholderData.map((card, index) => (
                    <div 
                        key={index} 
                        className="w-full flex-shrink-0 px-4" 
                        style={{ width: `${100 / totalCards}%` }} // Forces correct width division
                    >
                        {/* Card Styling */}
                        <div 
                            className={`p-8 h-full rounded-2xl shadow-xl border-b-4 ${card.bgColor} ${card.borderColor} 
                                        transition-all duration-300 transform ${index === activeIndex ? 'scale-[1.02] opacity-100' : 'scale-95 opacity-50'} 
                                        flex flex-col justify-center`}
                        >
                            <h3 className={`text-2xl font-bold ${card.textColor} mb-2`}>{card.title}</h3>
                            <p className="text-gray-700 text-lg">{card.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Optional Dots Indicator */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 p-2">
                {stakeholderData.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-indigo-500 w-6' : 'bg-gray-300'}`}
                        aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
// === END CAROUSEL COMPONENT ===


// === Other Components (Unchanged) ===
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
// === END Other Components ===


// === Main Page Component (Routing the new Carousel) ===
const HomePage = () => {
    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            
            {/* 1. Introduction Hero Section - Poster-like with Image */}
            <header 
                className="relative text-white pt-24 pb-32 shadow-lg shadow-indigo-200/50"
                style={{ 
                    backgroundImage: `url(${HERO_IMAGE_URL})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    isolation: 'isolate', 
                }}
            >
                {/* Pastel Image Overlay for Readability and Aesthetic Tone */}
                {/* This overlay applies the requested pastel hue and softens the image */}
                <div className="absolute inset-0 bg-indigo-500 opacity-60 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-pink-400 opacity-20"></div>
                
                {/* Content Container (z-10 ensures text is above the image/overlay) */}
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    
                    {/* H1 Title - Darker shadow for "Poster" effect */}
                    <h1 
                        className="text-5xl md:text-6xl font-black leading-tight mb-4 text-white" 
                        style={{ 
                            // Custom shadow for a defined, high-contrast, poster-like font
                            textShadow: '3px 3px 0px rgba(0, 0, 0, 0.4), -1px -1px 0px rgba(0, 0, 0, 0.2)' 
                        }}
                    >
                        Campus Event Management System
                    </h1>
                    
                    {/* Description */}
                    <p className="text-xl md:text-2xl font-light mb-10 max-w-4xl mx-auto text-indigo-100 drop-shadow-md">
                        The simple, centralized platform for Discovery, Registration, Management, and Sponsorship of all college activities.
                    </p>
                    
                    {/* Button */}
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

            {/* 2. Problem/Solution Section - NOW USING THE CAROUSEL */}
            <section className="py-20 bg-white -mt-16 relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-4">
                        Seamless Campus Experience
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-16 max-w-5xl mx-auto">
                        We consolidate scattered event channels into one reliable source, optimizing communication for every stakeholder.
                    </p>
                    
                    {/* RENDER THE CAROUSEL HERE */}
                    <StakeholderCarousel />
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
