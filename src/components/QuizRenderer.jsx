import React, { useState, useMemo } from 'react';

export default function QuizRenderer({ config }) {
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    // If stringified JSON arrives, parse it securely
    const quizData = useMemo(() => {
        if (!config) return null;
        try {
            if (typeof config === 'string') {
                // Remove surrounding markdown blocks if the LLM included them
                let cleanStr = config.replace(/^```(json)?\n?/mi, '').replace(/\n?```$/mi, '').trim();
                return JSON.parse(cleanStr);
            }
            return config;
        } catch (e) {
            console.error("Quiz Parsing Failed:", e, config);
            return null;
        }
    }, [config]);

    if (!quizData || !quizData.questions || !Array.isArray(quizData.questions)) {
        return (
            <div className="p-6 bg-rose-500/5 border-t border-rose-500/10 rounded-xl">
                <div className="text-rose-500 font-bold text-[10px] uppercase tracking-widest mb-3">Quiz Parsing Error</div>
                <pre className="text-[11px] text-slate-500 overflow-x-auto">{typeof config === 'string' ? config : JSON.stringify(config)}</pre>
            </div>
        );
    }

    const { title, description, questions } = quizData;
    const isComplete = showResults;

    const handleSelectOption = (idx, option) => {
        if (isComplete) return;
        setSelectedAnswers(prev => ({ ...prev, [idx]: option }));
    };

    const handleNext = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        } else {
            setShowResults(true);
        }
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q, i) => {
            if (selectedAnswers[i] === q.answer) score++;
        });
        return score;
    };

    if (isComplete) {
        const score = calculateScore();
        return (
            <div className="p-8 text-center bg-white dark:bg-[#111] rounded-2xl">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 flex items-center justify-center rounded-full mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15l-2 5l9-9l-9-1l2-5l-9 9l9 1z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Quiz Completed!</h3>
                <p className="text-slate-500 mb-6">You scored {score} out of {questions.length}</p>
                <div className="space-y-4 text-left">
                    {questions.map((q, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${selectedAnswers[i] === q.answer ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                            <p className="font-semibold text-sm mb-2 opacity-80">{q.question}</p>
                            <p className="text-[12px]"><span className="opacity-50">Your Answer:</span> <strong className={selectedAnswers[i] === q.answer ? 'text-emerald-500' : 'text-rose-500'}>{selectedAnswers[i] || 'Skipped'}</strong></p>
                            {selectedAnswers[i] !== q.answer && <p className="text-[12px] mt-1"><span className="opacity-50">Correct Answer:</span> <strong className="text-emerald-500">{q.answer}</strong></p>}
                            {q.explanation && <p className="text-[11px] mt-2 text-slate-500 dark:text-slate-400 italic bg-black/5 dark:bg-white/5 p-2 rounded-lg">{q.explanation}</p>}
                        </div>
                    ))}
                </div>
                <button onClick={() => { setShowResults(false); setSelectedAnswers({}); setCurrentQuestionIdx(0); }} className="mt-8 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all font-bold text-sm">
                    Retake Quiz
                </button>
            </div>
        );
    }

    const q = questions[currentQuestionIdx];
    const hasSelected = selectedAnswers[currentQuestionIdx] !== undefined;

    return (
        <div className="p-4 bg-white dark:bg-[#111]">
            <div className="mb-6 text-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title || 'Interactive Quiz'}</h2>
                {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
                <div className="flex items-center justify-center gap-1 mt-4">
                    {questions.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentQuestionIdx ? 'w-6 bg-indigo-500' : i < currentQuestionIdx ? 'w-2 bg-indigo-500/50' : 'w-2 bg-slate-200 dark:bg-white/10'}`} />
                    ))}
                </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-lg mb-6 leading-relaxed">
                    <span className="text-indigo-500 mr-2 opacity-50">{currentQuestionIdx + 1}.</span> {q.question}
                </h3>
                <div className="space-y-3">
                    {q.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelectOption(currentQuestionIdx, opt)}
                            className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm
                                ${selectedAnswers[currentQuestionIdx] === opt 
                                    ? 'bg-indigo-500/10 border-indigo-500 shadow-sm text-indigo-700 dark:text-indigo-400 font-medium' 
                                    : 'bg-white dark:bg-black/50 border-slate-200 dark:border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!hasSelected}
                    className={`px-8 py-3 rounded-xl font-bold text-sm transition-all focus:scale-95 ${hasSelected ? 'bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 shadow-indigo-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
                >
                    {currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
            </div>
        </div>
    );
}
