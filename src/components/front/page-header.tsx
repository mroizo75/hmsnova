import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  bgColor?: string;
}

export function PageHeader({ 
  title, 
  description, 
  bgColor = "bg-gradient-to-r from-[#17304F] to-[#2C435F]" 
}: PageHeaderProps) {
  return (
    <div className={`${bgColor} text-white pt-32 pb-20 px-4 relative overflow-hidden`}>
      {/* Dekorative elementer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-40 -top-40 w-[400px] h-[400px] bg-white/5 rounded-full"></div>
        <div className="absolute -left-20 bottom-0 w-[300px] h-[300px] bg-white/5 rounded-full"></div>
      </div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        {description && (
          <p className="text-xl text-white/80 max-w-3xl">{description}</p>
        )}
      </div>
    </div>
  );
} 