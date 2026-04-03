// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';

export default function Waiting() {

    return (
        <div className="bg-white dark:bg-[#050505] min-h-screen text-slate-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden selection:bg-indigo-500/30 flex flex-col">
            {/* <Navbar /> */}
            
            <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden pt-20">
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] md:w-[700px] h-[350px] sm:h-[500px] md:h-[700px] bg-indigo-500/15 dark:bg-purple-600/20 mix-blend-multiply dark:mix-blend-screen blur-[80px] md:blur-[120px] rounded-full z-0 animate-pulse"></div>

                <div className="relative z-10 text-center px-6">
                    <h1 className="text-[8rem] md:text-[12rem] font-bold leading-none tracking-tighter mb-4 select-none opacity-20 dark:opacity-10">
                        404
                    </h1>
                    
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                        Lost in the <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Void?</span>
                    </h2>
                    
                    <p className="text-xl text-slate-600 dark:text-slate-400 font-light max-w-lg mx-auto mb-10 leading-relaxed">
                        {/* The page you are looking for has been moved, deleted, or never existed in this dimension. */}
Horus is off right now until we get some funding. Sorry, but we can't afford the service costs.                    </p>
                    
                    {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/20 active:scale-95"
                        >
                            Return to Landing
                        </button>
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-semibold rounded-2xl border border-slate-200 dark:border-white/10 transition-all duration-300 active:scale-95"
                        >
                            Go Back
                        </button>
                    </div> */}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-[20%] left-[15%] w-12 h-12 border border-indigo-500/20 rounded-full animate-blob"></div>
                <div className="absolute bottom-[20%] right-[15%] w-16 h-16 border border-purple-500/20 rotate-45 animate-float shadow-lg"></div>
            </main>

            {/* <Footer /> */}
        </div>
    );
}
