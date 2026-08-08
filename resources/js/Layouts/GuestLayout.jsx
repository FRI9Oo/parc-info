import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center bg-slate-50 dark:bg-[#0b0f19] bg-[url('/images/bg-pattern.jpg')] bg-cover bg-center pt-8 sm:justify-center sm:pt-0 font-sans selection:bg-[#11508f] selection:text-white overflow-hidden">
            
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-slate-50/85 dark:bg-[#0b0f19]/85 backdrop-blur-[2px]"></div>

            <div className="relative z-10 flex flex-col items-center gap-3 mb-4">
                <Link href="/" className="flex flex-col items-center gap-2 group">
                    <ApplicationLogo className="h-16 w-auto transition-transform group-hover:scale-105" />
                    <div className="flex flex-col items-center">
                        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-heading">
                            PARC INFORMATIQUE
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="h-2 w-2 rounded-full bg-[#11508f] shadow-sm"></span>
                            <span className="h-2 w-2 rounded-full bg-[#57b24a] shadow-sm"></span>
                            <span className="h-2 w-2 rounded-full bg-[#fab61e] shadow-sm"></span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest ms-1">
                                SYSTÈME DE GESTION EXECUTIVE
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="relative z-10 w-full sm:max-w-md lux-card p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                {children}
            </div>
        </div>
    );
}
