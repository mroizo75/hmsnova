import Link from "next/link"
 
const FooterItem = ({ text, link }: { text: string; link: string }) => {
return (
    <li>
        <Link href={link}>
            { text }
        </Link>
    </li>
)
}
 
const footerItems = [
{
    id: 1,
    text: "Term of services",
    link: "#"
},
{
    id: 2,
    text: "KKS AS",
    link: "#"
},
{
    id: 3,
    text: "Kontakt oss",
    link: "#"
},
]
 
 
const FooterBlock = () => {
return (
    <footer className="pt-6">
        <div className="px-2 sm:px-0">
            <div className="mx-auto w-full max-w-6xl bg-[#17304F] dark:bg-blue-950 p-5 sm:p-10 py-10 sm:py-14 md:py-16 rounded-3xl relative overflow-hidden">
                <div className="relative flex flex-col items-center text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl text-white font-bold max-w-4xl"> Ta neste steg i dag. </h1>
                    <p className="text-base text-gray-300 max-w-2xl mt-10"> Er din bedrift klar for en smartere HMS-løsning?Med HMS Nova kan du trygt og enkelt oppfylle HMS-kravene, redusere risiko og spare tid. Ikke vent – ta steget mot en tryggere og mer effektiv fremtid.
                     </p>
                    <div className="flex justify-center mt-10">
                        <Link href="#" className="gap-x-3 font-display bg-white text-gray-900 hover:bg-gray-100/90 px-8 h-12 rounded-full flex items-center">
                            Ta kontakt
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-900 pt-60 -mt-48 px-4 sm:px-10 md:px-12 lg:px-8">
            <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between items-center gap-y-5 py-3 border-t border-t-gray-300 dark:border-t-gray-700">
                <p className="text-gray-700 dark:text-gray-300">
                    ©  2025 KKS AS. Allrights reserved
                </p>
                <nav>
                    <ul className="flex items-center gap-x-5 text-gray-800 dark:text-gray-200">
                        {
                            footerItems.map(footerItem=>(
                                <FooterItem key={footerItem.id} {...footerItem}/>
                            ))
                        }
                    </ul>
                </nav>
            </div>
        </div>
    </footer>
)
}
 
export default FooterBlock