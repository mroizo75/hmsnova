import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/front/navbar";
import Footer from "@/components/front/footer";
import Script from "next/script";
import { organizationSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "HMS Nova | Markedsledende HMS-system",
  description: "HMS Nova tilbyr en komplett og brukervennlig HMS-løsning for små og mellomstore bedrifter. Forbedre HMS-arbeidet, reduser risiko og oppfyll lovkrav."
};

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow pt-24">{children}</main>
      <Footer />
      
      {/* Strukturerte data for SEO */}
      <Script 
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      
      {/* Chatbot eller kundeservice widget */}
      <Script
        id="chat-widget"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              // Her kan du legge til kundeservice-chat eller liknende
              console.log('Chat widget lastet');
            });
          `
        }}
      />
    </div>
  );
} 