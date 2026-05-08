'use client';
import React from 'react';

interface AnnouncementBarProps {
  announcements?: string[];
  backgroundColor?: string;
  textColor?: string;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  announcements = [
    "📢 Welcome to the Employee Evaluation System - Your performance review portal",
    "⚡ New features: Enhanced reporting and analytics now available",
    "🎯 Reminder: Complete your peer reviews by the end of this week",
    "🏆 Congratulations to our top performers this quarter!",
    "📊 System maintenance scheduled for this weekend - minimal downtime expected"
  ],
  backgroundColor = "bg-emerald-700",
  textColor = "text-white"
}) => {
  // Join all announcements with separator
  const announcementText = announcements.join(" • ");
  
  return (
    <div className={`${backgroundColor} ${textColor} py-3 px-4 rounded-lg shadow-sm overflow-hidden relative`}>
      <div className="flex items-center">
        <span className="flex-shrink-0 mr-4 font-semibold">
          📢 Announcements:
        </span>
        <div className="overflow-hidden flex-1 relative">
          <div 
            className="whitespace-nowrap animate-marquee"
            style={{
              animation: 'marquee 60s linear infinite',
            }}
          >
            {announcementText}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes marquee {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(-100%);
          }
        }
        
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
