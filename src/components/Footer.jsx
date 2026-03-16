export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#050505] transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="font-serif text-lg tracking-widest font-bold text-slate-900 dark:text-white">HORUS</span>
                    <span className="text-[10px] text-indigo-500 font-black">AI MENTOR</span>
                </div>
                
                <div className="text-slate-500 dark:text-slate-400 text-sm font-light">
                    © {new Date().getFullYear()} Horus AI. All rights reserved.
                </div>

                <div className="flex gap-6">
                    <a href="#" className="text-slate-400 hover:text-indigo-500 transition-colors">Privacy</a>
                    <a href="#" className="text-slate-400 hover:text-indigo-500 transition-colors">Terms</a>
                    <a href="#" className="text-slate-400 hover:text-indigo-500 transition-colors">Contact</a>
                </div>
            </div>
        </footer>
    );
}
