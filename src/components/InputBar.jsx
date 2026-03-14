import { useState, useRef, useEffect } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const InputBar = ({ onSend, loading, onGenerate }) => {
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const toolsMenuRef = useRef(null);
    
    const [isRecording, setIsRecording] = useState(false);
    const [audioData, setAudioData] = useState(new Array(24).fill(0.1));
    const recognitionRef = useRef(null);
    const baseTextRef = useRef('');
    
    // Audio context refs
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const animationFrameRef = useRef(null);

    const stopAudioVisualizer = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
        setAudioData(new Array(24).fill(0.1));
    };

    const startAudioVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            mediaStreamRef.current = stream;

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 64; // Small size for fewer bins (we only need 24)
            analyserRef.current = analyser;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateWaveform = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);

                // Map the frequency data to 24 bars
                const newAudioData = [];
                const step = Math.floor(dataArray.length / 24);
                
                for (let i = 0; i < 24; i++) {
                    let sum = 0;
                    for (let j = 0; j < step; j++) {
                        sum += dataArray[i * step + j];
                    }
                    const average = sum / step;
                    // Normalize to 0-1 range and ensure a minimum height
                    const val = Math.max(0.1, average / 255);
                    newAudioData.push(val);
                }

                setAudioData(newAudioData);
                animationFrameRef.current = requestAnimationFrame(updateWaveform);
            };

            updateWaveform();
        } catch (err) {
            console.error("Could not start audio visualizer:", err);
            // Non-fatal, just won't have the animation
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) {
                setIsToolsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
            }
            stopAudioVisualizer();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleRecording = () => {
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (isRecording) {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
            }
            setIsRecording(false);
            stopAudioVisualizer();
        } else {
            if (!recognitionRef.current) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                
                recognitionRef.current.onresult = (event) => {
                    let finalAddition = '';
                    let interimAddition = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalAddition += event.results[i][0].transcript;
                        } else {
                            interimAddition += event.results[i][0].transcript;
                        }
                    }

                    if (finalAddition) {
                        baseTextRef.current = baseTextRef.current + (baseTextRef.current && !baseTextRef.current.endsWith(' ') ? ' ' : '') + finalAddition;
                    }
                    
                    const newText = baseTextRef.current + (interimAddition ? ' ' + interimAddition : '');
                    setText(newText.trimStart());
                    
                    if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + 'px';
                    }
                };

                recognitionRef.current.onerror = (e) => {
                    console.error("Speech recognition error:", e.error);
                    setIsRecording(false);
                };

                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                };
            }
            
            baseTextRef.current = text;
            try {
                recognitionRef.current.start();
                setIsRecording(true);
                startAudioVisualizer();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const newAttachments = await Promise.all(
            files.map(async (file) => {
                const base64 = await fileToBase64(file);
                return {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64,
                    url: URL.createObjectURL(file), // for preview
                    isImage: file.type.startsWith('image/')
                };
            })
        );

        setAttachments(prev => [...prev, ...newAttachments]);
        e.target.value = ''; // Reset input
    };

    const removeAttachment = (index) => {
        setAttachments(prev => {
            const updated = [...prev];
            const removed = updated.splice(index, 1)[0];
            if (removed.url) URL.revokeObjectURL(removed.url);
            return updated;
        });
    };

    const handleSend = () => {
        const trimmed = text.trim();
        if ((!trimmed && attachments.length === 0) || loading) return;
        
        let finalMessage = trimmed;
        
        // Append hidden system instructions based on tool selection
        if (selectedTool === 'canvas') {
            finalMessage += '\n\nPlease put your final response in a ```canvas block.';
        } else if (selectedTool === 'math') {
            finalMessage += '\n\nPlease visualize this using a ```math block containing Mafs/TeX.';
        } else if (selectedTool === 'mermaid') {
            finalMessage += '\n\nPlease create a visualization using a ```mermaid block.';
        } else if (selectedTool === 'image') {
           // For images we will use the existing generate method to route to the image service
           onGenerate(trimmed);
           setText('');
           baseTextRef.current = '';
           if (textareaRef.current) {
               textareaRef.current.style.height = 'auto';
           }
           setSelectedTool(null);
           return;
        }

        // Pass attachments to parent
        onSend(finalMessage, attachments.map(a => ({
            data: a.data,
            mimeType: a.type
        })));

        if (isRecording) {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch(e){}
            }
            setIsRecording(false);
            stopAudioVisualizer();
        }

        setText('');
        baseTextRef.current = '';
        setAttachments([]);
        setSelectedTool(null);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleGenerate = () => {
        const trimmed = text.trim();
        if (!trimmed || loading || !onGenerate) return;
        onGenerate(trimmed);
        setText('');
        setSelectedTool(null);
        setIsToolsOpen(false);
    };

    const handleToolSelect = (toolType) => {
        setSelectedTool(toolType);
        setIsToolsOpen(false);
        textareaRef.current?.focus();
    };

    const clearTool = (e) => {
        e.stopPropagation();
        setSelectedTool(null);
    };

    const getToolConfig = (type) => {
        switch(type) {
            case 'image': return { name: 'Image', icon: <svg className="text-amber-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> };
            case 'canvas': return { name: 'Canvas', icon: <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg> };
            case 'math': return { name: 'Math Graph', icon: <svg className="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> };
            case 'mermaid': return { name: 'Diagram', icon: <svg className="text-violet-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="8" x="8" y="8" rx="2"/><path d="M12 2v6"/><path d="M12 16v6"/><path d="M2 12h6"/><path d="M16 12h6"/></svg> };
            default: return null;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e) => {
        setText(e.target.value);
        if (isRecording) {
            baseTextRef.current = e.target.value;
        }
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 96) + 'px';
    };

    return (
        <div className="px-2 md:px-6 py-3 md:py-8 bg-transparent relative">
            <div className="max-w-3xl mx-auto relative">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {attachments.map((file, i) => (
                            <div key={i} className="relative group/att">
                                {file.isImage ? (
                                    <img src={file.url} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-[var(--border)]" />
                                ) : (
                                    <div className="w-16 h-16 flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full text-center mt-1 px-1">{file.name}</span>
                                    </div>
                                )}
                                <button 
                                    onClick={() => removeAttachment(i)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/att:opacity-100 transition-opacity shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {isRecording ? (
                    <div className="flex items-center justify-between w-full h-[52px] md:h-[60px] bg-[#2F2F2F] rounded-[2rem] px-4 md:px-6 shadow-sm overflow-hidden z-20">
                        {/* Cancel Button */}
                        <button 
                            onClick={() => {
                                setText('');
                                baseTextRef.current = '';
                                if (textareaRef.current) textareaRef.current.style.height = 'auto';
                                toggleRecording();
                            }}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        {/* Audio Wave Visualizer */}
                        <div className="flex-1 flex items-center justify-center gap-[2px] md:gap-[3px] px-4 h-full overflow-hidden">
                            <span className="text-white text-xs font-medium mr-2 hidden sm:block shrink-0">Listening...</span>
                            {audioData.map((val, i) => (
                                <div 
                                    key={i} 
                                    className="w-1 md:w-1.5 bg-indigo-400 rounded-full transition-all duration-75"
                                    style={{
                                        height: `${val * 100}%`,
                                        minHeight: '4px'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Pause & Review Button (Arrow Up) */}
                        <button 
                            onClick={toggleRecording}
                            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center transition-colors shadow-sm"
                            title="Review Text"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                    </div>
                ) : (
                <div className="flex items-center gap-2 md:gap-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] px-2 md:px-4 py-1.5 md:py-2 shadow-sm transition-all focus-within:border-slate-400 dark:focus-within:border-white/20 group">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        multiple 
                        accept="image/*,application/pdf,text/*"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" 
                        title="Attach files (Images, PDFs, Text)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>

                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={text}
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={loading}
                        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-[15px] resize-none focus:outline-none py-2.5 max-h-48 disabled:opacity-50 font-sans"
                    />

                    <div className="flex items-center gap-1 self-center">
                        
                        {/* Selected Tool Overlay */}
                        {selectedTool && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-full animate-fade-in mr-1">
                                {getToolConfig(selectedTool)?.icon}
                                <span className="text-[12px] font-bold text-indigo-700 dark:text-indigo-400">
                                    {getToolConfig(selectedTool)?.name}
                                </span>
                                <button 
                                    onClick={clearTool}
                                    className="w-4 h-4 ml-1 flex items-center justify-center rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-500/30 text-indigo-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        )}

                        <div className="relative" ref={toolsMenuRef}>
                            <button 
                                onClick={() => setIsToolsOpen(!isToolsOpen)}
                                className={`flex items-center gap-2 px-3 h-8 rounded-full transition-all text-[12px] font-bold ${isToolsOpen ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            </button>

                            {isToolsOpen && (
                                <div className="absolute bottom-full right-0 mb-3 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden animate-fade-in z-50">
                                    <div className="p-1 px-1.5">
                                        <button 
                                            onClick={() => handleToolSelect('image')}
                                            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors text-left"
                                        >
                                            <span className="text-[13px] font-medium">Image Gen</span>
                                            <svg className="text-amber-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                        </button>
                                        <button 
                                            onClick={() => handleToolSelect('canvas')}
                                            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors text-left"
                                        >
                                            <span className="text-[13px] font-medium">Canvas</span>
                                            <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                                        </button>
                                        <button 
                                            onClick={() => handleToolSelect('math')}
                                            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors text-left"
                                        >
                                            <span className="text-[13px] font-medium">Math Graph</span>
                                            <svg className="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                        </button>
                                        <button 
                                            onClick={() => handleToolSelect('mermaid')}
                                            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors text-left"
                                        >
                                            <span className="text-[13px] font-medium">Diagram</span>
                                            <svg className="text-violet-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="8" x="8" y="8" rx="2"/><path d="M12 2v6"/><path d="M12 16v6"/><path d="M2 12h6"/><path d="M16 12h6"/></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={toggleRecording}
                            className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center ${
                                isRecording 
                                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 animate-pulse' 
                                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                            title={isRecording ? "Stop Recording" : "Start Voice Typing"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        </button>
                        
                        <button
                            onClick={handleSend}
                            disabled={(!text.trim() && attachments.length === 0) || loading}
                            className={`w-8 h-8 rounded-full transition-all flex items-center justify-center shrink-0 ${
                                text.trim() || attachments.length > 0
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                                : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            {loading ? (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
                            )}
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default InputBar;
