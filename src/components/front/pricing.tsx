"use client"

import Link from "next/link"
import { useState } from "react"
import { ContactModal } from "@/components/contact-modal"
import { Check, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

type PlanType = "standard" | "premium"

const PricingSection = () => {
    const router = useRouter();
    const [isMonthly, setIsMonthly] = useState(true);
    
    // Basepriser (originale priser)
    const originalPrices = {
        standard: { monthly: 899, yearly: 899 * 12 - 899 }, // 1 måned gratis ved årsavtale
        premium: { monthly: 1299, yearly: 1299 * 12 - 1299 } // 1 måned gratis ved årsavtale
    };
    
    // Kampanjepriser
    const campaignPrices = {
        standard: { monthly: 699, yearly: 699 * 12 - 699 }, // 1 måned gratis ved årsavtale
        premium: { monthly: 1099, yearly: 1099 * 12 - 1099 } // 1 måned gratis ved årsavtale
    };
    
    // Beregner totalpris basert på valg
    const calculatePrice = (plan: PlanType) => {
        return isMonthly ? campaignPrices[plan].monthly : campaignPrices[plan].yearly;
    };
    
    // Henter original pris for gjennomstreking
    const getOriginalPrice = (plan: PlanType) => {
        return isMonthly ? originalPrices[plan].monthly : originalPrices[plan].yearly;
    };
    
    // Formaterer pris for visning
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(price);
    };
    
    // Navigerer til registrering med valgt pakke
    const navigateToRegister = (plan: PlanType) => {
        // Konverter plan til uppercase for å matche API-formatet
        const subscriptionPlan = plan.toUpperCase();
        
        // Naviger til registreringssiden med pakkevalg
        router.push(`/register?plan=${subscriptionPlan}`);
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.2
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section id="pricing" className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
            {/* Bakgrunnselementer */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 top-20 w-[400px] h-[400px] bg-[#2C435F]/5 rounded-full blur-3xl"></div>
                <div className="absolute -right-20 bottom-20 w-[500px] h-[500px] bg-[#17304F]/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#17304F] mb-6">Velg riktig pakke for din bedrift</h2>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        Fleksible løsninger som vokser med din bedrift. Alle pakker inkluderer ubegrenset brukerstøtte og regelmessige oppdateringer.
                    </p>
                    
                    <div className="flex items-center justify-center mt-10 gap-4">
                        <Label htmlFor="pricing-toggle" className={`text-lg ${isMonthly ? 'text-[#17304F] font-medium' : 'text-gray-500'}`}>Månedlig</Label>
                        <Switch
                            id="pricing-toggle"
                            checked={!isMonthly}
                            onCheckedChange={() => setIsMonthly(!isMonthly)}
                            className="data-[state=checked]:bg-[#2C435F]"
                        />
                        <Label htmlFor="pricing-toggle" className={`text-lg ${!isMonthly ? 'text-[#17304F] font-medium' : 'text-gray-500'}`}>
                            Årlig
                            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full ml-2">
                                Kampanjetilbud
                            </span>
                        </Label>
                    </div>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
                >
                    {/* Standard pakke */}
                    <motion.div
                        variants={itemVariants}
                        className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl group"
                    >
                        <div className="absolute top-0 right-0">
                            <div className="bg-green-600 text-white py-1 px-4 rounded-bl-lg text-sm font-medium">
                                Kampanjepris
                            </div>
                        </div>
                        
                        <div className="p-8 pt-12">
                            <h3 className="text-2xl font-bold text-[#2C435F] mb-4">Standard</h3>
                            <p className="text-gray-600 mb-6">Perfekt for små og mellomstore bedrifter</p>
                            
                            <div className="flex items-end mb-6">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 line-through text-lg">{formatPrice(getOriginalPrice('standard'))}</span>
                                    <span className="text-4xl font-bold text-[#17304F]">{formatPrice(calculatePrice('standard'))}</span>
                                </div>
                                <span className="text-gray-500 ml-2 mb-1">{isMonthly ? '/måned' : '/år'}</span>
                            </div>
                            
                            <Button 
                                className="w-full bg-[#2C435F] hover:bg-[#17304F] text-white py-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group-hover:bg-[#17304F]"
                                onClick={() => navigateToRegister('standard')}
                            >
                                Kom i gang
                            </Button>
                        </div>
                        
                        <div className="border-t border-gray-100 p-8">
                            <h4 className="font-medium text-[#17304F] mb-4">Inkluderer:</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-2 items-start">
                                    <Check className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Levende HMS-håndbok</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <Check className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Avvikshåndtering med varsling</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <Check className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Risikovurdering</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <Check className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Dokumenthåndtering</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <Check className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Stoffkartotek</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <X className="text-gray-300 h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-400">Vernerunder med funn og avvik</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                    
                    {/* Premium pakke */}
                    <motion.div
                        variants={itemVariants}
                        className="relative bg-white rounded-2xl shadow-xl border border-[#2C435F] overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl group"
                    >
                        <div className="absolute top-0 right-0">
                            <div className="bg-[#17304F] text-white py-1 px-4 rounded-bl-lg text-sm font-medium">
                                Anbefalt
                            </div>
                        </div>
                        
                        <div className="p-8 pt-12">
                            <h3 className="text-2xl font-bold text-[#17304F] mb-4">Premium</h3>
                            <p className="text-gray-600 mb-6">For bedrifter med høye krav til HMS</p>
                            
                            <div className="flex items-end mb-6">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 line-through text-lg">{formatPrice(getOriginalPrice('premium'))}</span>
                                    <span className="text-4xl font-bold text-[#17304F]">{formatPrice(calculatePrice('premium'))}</span>
                                </div>
                                <span className="text-gray-500 ml-2 mb-1">{isMonthly ? '/måned' : '/år'}</span>
                            </div>
                            
                            <Button 
                                className="w-full bg-[#17304F] hover:bg-[#2C435F] text-white py-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                                onClick={() => navigateToRegister('premium')}
                            >
                                Kom i gang
                            </Button>
                        </div>
                        
                        <div className="border-t border-gray-100 p-8">
                            <h4 className="font-medium text-[#17304F] mb-4">Inkluderer alt i Standard, pluss:</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-2 items-start">
                                    <Check className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Vernerunder med digital funn</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <Check className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Kompetansehåndtering</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 text-center"
                >
                    <h3 className="text-xl font-medium text-[#17304F] mb-4">Trenger du en tilpasset løsning?</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Vi tilbyr også skreddersydde løsninger for større bedrifter eller spesielle behov. 
                        Kontakt oss for en uforpliktende samtale.
                    </p>
                    <ContactModal defaultMessage="Jeg ønsker en tilpasset HMS-løsning for min bedrift">
                        <Button variant="outline" className="border-[#2C435F] text-[#2C435F] hover:bg-[#2C435F] hover:text-white">
                            Kontakt for tilbud
                        </Button>
                    </ContactModal>
                </motion.div>
            </div>
        </section>
    );
};

export default PricingSection;