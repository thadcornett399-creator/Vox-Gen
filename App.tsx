import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { VOICES, EMOTIONS, ACCENTS, COMMUNITY_PRESETS } from './constants';
import { VoiceName, GeneratedAudio, VoiceSettings, VoicePreset } from './types';
import { base64ToUint8Array, createWavBlob, blobToBase64 } from './utils/audioUtils';

// --- Icons ---
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>;
const LibraryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14"></path><path d="M12 6v14"></path><path d="M8 8v12"></path><path d="M4 4v16"></path></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const HeartIcon = ({ filled }: { filled?: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? "text-red-500" : ""}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const WandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"></path><path d="M15 16v-2"></path><path d="M8 9h2"></path><path d="M20 9h2"></path><path d="M17.8 11.8 19 13"></path><path d="M15 9h0"></path><path d="M17.8 6.2 19 5"></path><path d="m3 21 9-9"></path><path d="M12.2 6.2 11 5"></path></svg>;

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'community' | 'clone'>('create');
  
  // Generation State
  const [text, setText] = useState('Welcome to VoxGen. Create unlimited voice assets for your games.');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Puck);
  const [settings, setSettings] = useState<VoiceSettings>({
    emotion: 'natural',
    pitch: 0,
    speed: 1,
    accent: 'none'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio[]>([]);
  
  // Library State
  const [savedPresets, setSavedPresets] = useState<VoicePreset[]>([]);
  const [presetName, setPresetName] = useState('');

  // Clone State
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Logic ---

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('voxgen_presets');
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load presets", e);
      }
    }
  }, []);

  const savePreset = () => {
    if (!presetName.trim()) return;
    const newPreset: VoicePreset = {
      id: Date.now().toString(),
      name: presetName,
      voice: selectedVoice,
      settings: { ...settings },
      author: 'You',
      likes: 0,
      tags: ['Custom']
    };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    localStorage.setItem('voxgen_presets', JSON.stringify(updated));
    setPresetName('');
    alert('Voice preset saved to library!');
  };

  const loadPreset = (preset: VoicePreset) => {
    setSelectedVoice(preset.voice);
    setSettings(preset.settings);
    setActiveTab('create');
  };

  const deletePreset = (id: string) => {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem('voxgen_presets', JSON.stringify(updated));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCloneFile(e.target.files[0]);
    }
  };

  const handleCloneVoice = async () => {
    if (!cloneFile) return;
    setIsAnalyzing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = await blobToBase64(cloneFile);
      
      const prompt = `Listen to the attached voice sample and analyze its characteristics to map it to a TTS engine configuration.
      
      Available Voices: Puck (Male, Mischievous), Charon (Male, Deep), Kore (Female, Warm), Fenrir (Male, Intense), Zephyr (Female, Soft).
      Available Emotions: ${EMOTIONS.map(e => e.id).join(', ')}.
      Available Accents: ${ACCENTS.map(a => a.id).join(', ')}.

      Return a JSON object with:
      - "closest_voice": The name of the closest matching Available Voice (e.g. "Charon").
      - "pitch": A number between -2.0 (Deep) and 2.0 (High) representing the pitch relative to the base voice.
      - "speed": A number between 0.5 (Slow) and 2.0 (Fast).
      - "emotion": The ID of the closest matching emotion.
      - "accent": The ID of the closest matching accent.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              { inlineData: { mimeType: cloneFile.type, data: base64Data } },
              { text: prompt }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              closest_voice: { type: Type.STRING },
              pitch: { type: Type.NUMBER },
              speed: { type: Type.NUMBER },
              emotion: { type: Type.STRING },
              accent: { type: Type.STRING },
            },
          }
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        
        // Map result to app state
        if (Object.values(VoiceName).includes(result.closest_voice)) {
          setSelectedVoice(result.closest_voice as VoiceName);
        }
        
        setSettings({
          emotion: result.emotion || 'natural',
          pitch: Math.max(-2, Math.min(2, result.pitch || 0)),
          speed: Math.max(0.5, Math.min(2.0, result.speed || 1.0)),
          accent: result.accent || 'none',
        });

        alert(`Voice Cloned! \nMatched Base: ${result.closest_voice}\nStyle: ${result.emotion}, ${result.accent}`);
        setActiveTab('create');
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Could not analyze voice. Please try a different file.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const constructPrompt = (inputText: string, currentSettings: VoiceSettings): string => {
    let instructions = [];
    
    // Emotion
    if (currentSettings.emotion !== 'natural') {
      instructions.push(currentSettings.emotion); // "happily", "angrily"
    }

    // Pitch
    if (currentSettings.pitch > 0.5) instructions.push("in a high-pitched voice");
    else if (currentSettings.pitch < -0.5) instructions.push("in a deep, resonant voice");

    // Speed
    if (currentSettings.speed > 1.2) instructions.push("speaking quickly");
    else if (currentSettings.speed < 0.8) instructions.push("speaking slowly");

    // Accent
    if (currentSettings.accent !== 'none') {
      const creatureAccents = [
        'robot', 'monster', 'goblin', 'ghost', 'demonic', 'witch', 
        'orc', 'ogre', 'devil', 'vampire', 'zombie', 'ghoul', 'wraith', 'banshee'
      ];
      
      if (creatureAccents.includes(currentSettings.accent)) {
        const article = ['orc', 'ogre'].includes(currentSettings.accent) ? 'an' : 'a';
        instructions.push(`sounding like ${article} ${currentSettings.accent}`);
      } else {
        instructions.push(`with a ${currentSettings.accent} accent`);
      }
    }

    if (instructions.length === 0) return inputText;

    // Construct: "Say [adverbs/adjectives]: [Text]"
    const instructionString = instructions.join(", ");
    return `Say ${instructionString}: ${inputText}`;
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const finalPrompt = constructPrompt(text, settings);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: finalPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        const pcmData = base64ToUint8Array(base64Audio);
        const wavBlob = createWavBlob(pcmData, 24000);
        const blobUrl = URL.createObjectURL(wavBlob);

        const newAudio: GeneratedAudio = {
          id: Date.now().toString(),
          text: text,
          voice: selectedVoice,
          settings: { ...settings },
          blobUrl,
          timestamp: Date.now(),
        };

        setGeneratedAudio(prev => [newAudio, ...prev]);
      } else {
        console.error("No audio data received");
      }

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Generation failed. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans selection:bg-primary selection:text-white pb-20">
      {/* Header */}
      <header className="border-b border-surfaceHighlight bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </div>
            <h1 className="font-bold text-xl tracking-tight">VoxGen <span className="text-primary">AI</span></h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-surfaceHighlight p-1 rounded-lg">
            <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')} icon={<SparklesIcon />} label="Create" />
            <TabButton active={activeTab === 'clone'} onClick={() => setActiveTab('clone')} icon={<WandIcon />} label="Clone" />
            <TabButton active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon={<LibraryIcon />} label="Library" />
            <TabButton active={activeTab === 'community'} onClick={() => setActiveTab('community')} icon={<GlobeIcon />} label="Community" />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Panel: Controls */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Prompt Text</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-32 bg-surface border border-surfaceHighlight rounded-xl p-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="What should the voice say?"
                />
              </div>

              {/* Voice Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Base Voice</label>
                <div className="grid grid-cols-5 gap-2">
                  {VOICES.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                        selectedVoice === voice.id
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-surface border-surfaceHighlight hover:border-zinc-600 text-zinc-400'
                      }`}
                      title={`${voice.gender} - ${voice.description}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-1 text-lg font-bold">
                        {voice.name[0]}
                      </div>
                      <span className="text-xs font-medium">{voice.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 text-right h-4">{VOICES.find(v => v.id === selectedVoice)?.description}</p>
              </div>

              {/* Controls */}
              <div className="space-y-4 bg-surface rounded-xl p-5 border border-surfaceHighlight">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-zinc-200">Voice Modulation</h3>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">AI Enhanced</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Emotion */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Emotion & Tone</label>
                    <select 
                      value={settings.emotion}
                      onChange={(e) => {
                        const newEmotion = e.target.value;
                        let newPitch = settings.pitch;
                        
                        // Auto-adjust pitch for atmospheric emotions
                        if (newEmotion === 'whispering') {
                          newPitch = -1.0;
                        }
                        
                        setSettings({...settings, emotion: newEmotion, pitch: newPitch});
                      }}
                      className="w-full bg-background border border-surfaceHighlight rounded-lg px-3 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      {EMOTIONS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                    </select>
                  </div>

                  {/* Accent */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Accent / Character</label>
                    <select 
                      value={settings.accent}
                      onChange={(e) => setSettings({...settings, accent: e.target.value})}
                      className="w-full bg-background border border-surfaceHighlight rounded-lg px-3 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      {ACCENTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs text-zinc-500">
                        <span>Pitch</span>
                        <span>{settings.pitch > 0 ? 'High' : settings.pitch < 0 ? 'Deep' : 'Normal'}</span>
                     </div>
                     <input 
                        type="range" min="-2" max="2" step="0.5"
                        value={settings.pitch}
                        onChange={(e) => setSettings({...settings, pitch: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                     />
                  </div>
                  
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs text-zinc-500">
                        <span>Speed</span>
                        <span>{settings.speed}x</span>
                     </div>
                     <input 
                        type="range" min="0.5" max="2.0" step="0.1"
                        value={settings.speed}
                        onChange={(e) => setSettings({...settings, speed: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent"
                     />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                 <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`flex-1 h-12 rounded-xl font-semibold text-white shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all ${
                      isGenerating ? 'bg-zinc-700 cursor-not-allowed' : 'bg-primary hover:bg-primaryHover hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon /> Generate Voice
                      </>
                    )}
                  </button>
                  
                  {/* Save Preset Dialog */}
                  <div className="flex bg-surface rounded-xl border border-surfaceHighlight">
                    <input 
                      type="text" 
                      placeholder="Preset Name"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="bg-transparent px-3 text-sm focus:outline-none w-32 placeholder:text-zinc-600"
                    />
                    <button 
                      onClick={savePreset}
                      disabled={!presetName}
                      className="px-3 hover:bg-zinc-700 rounded-r-xl border-l border-surfaceHighlight disabled:opacity-50"
                      title="Save as Preset"
                    >
                      <SaveIcon />
                    </button>
                  </div>
              </div>
            </div>

            {/* Right Panel: Output */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-semibold">Generated Assets</h2>
                 <span className="text-xs text-zinc-500">{generatedAudio.length} items</span>
              </div>
              
              <div className="space-y-3">
                {generatedAudio.length === 0 ? (
                  <div className="h-64 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-600 gap-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                      <SparklesIcon />
                    </div>
                    <p>Ready to generate unlimited voices.</p>
                  </div>
                ) : (
                  generatedAudio.map((audio) => (
                    <AudioCard key={audio.id} audio={audio} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* CLONE TAB */}
        {activeTab === 'clone' && (
          <div className="max-w-2xl mx-auto space-y-8 py-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Voice Style Cloning</h2>
              <p className="text-zinc-400">Upload a short audio sample. AI will analyze its tonal characteristics (pitch, speed, emotion) and replicate the style using our engine.</p>
            </div>

            <div className="bg-surface border border-surfaceHighlight rounded-2xl p-8 text-center space-y-6">
              <div 
                className="border-2 border-dashed border-zinc-700 rounded-xl p-10 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer relative"
              >
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <UploadIcon />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200">Click to upload or drag & drop</p>
                    <p className="text-xs text-zinc-500 mt-1">MP3, WAV, or M4A (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {cloneFile && (
                <div className="bg-surfaceHighlight rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-zinc-200">{cloneFile.name}</p>
                    <p className="text-xs text-zinc-500">{(cloneFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <audio controls src={URL.createObjectURL(cloneFile)} className="h-8 w-32 opacity-70" />
                </div>
              )}

              <button 
                onClick={handleCloneVoice}
                disabled={!cloneFile || isAnalyzing}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${
                  !cloneFile 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : isAnalyzing 
                      ? 'bg-zinc-700 text-zinc-300'
                      : 'bg-gradient-to-r from-primary to-accent hover:scale-[1.02] text-white shadow-primary/25'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Analyzing Voice Profile...
                  </>
                ) : (
                  <>
                    <WandIcon /> Clone Voice Style
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs text-zinc-500">
               <div className="p-4 bg-surface rounded-xl border border-surfaceHighlight">
                  <strong className="block text-zinc-300 mb-1 text-sm">Analyze</strong>
                  Extracts pitch, speed, and emotion
               </div>
               <div className="p-4 bg-surface rounded-xl border border-surfaceHighlight">
                  <strong className="block text-zinc-300 mb-1 text-sm">Map</strong>
                  Finds closest TTS engine parameters
               </div>
               <div className="p-4 bg-surface rounded-xl border border-surfaceHighlight">
                  <strong className="block text-zinc-300 mb-1 text-sm">Generate</strong>
                  Creates new assets with cloned style
               </div>
            </div>
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
           <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Voice Presets</h2>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Create New
                </button>
             </div>

             {savedPresets.length === 0 ? (
               <div className="text-center py-20 text-zinc-500 bg-surface/30 rounded-2xl border border-zinc-800">
                 <h3 className="text-lg font-medium text-zinc-300 mb-2">No Saved Presets</h3>
                 <p>Save your favorite voice configurations to access them quickly.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {savedPresets.map(preset => (
                   <div key={preset.id} className="bg-surface border border-surfaceHighlight p-5 rounded-xl hover:border-primary/50 transition-colors group relative">
                      <button onClick={() => deletePreset(preset.id)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrashIcon />
                      </button>
                      
                      <h3 className="font-bold text-lg text-zinc-200 mb-1">{preset.name}</h3>
                      <div className="text-xs text-primary mb-4 font-mono uppercase">{preset.voice}</div>
                      
                      <div className="grid grid-cols-2 gap-y-2 text-sm text-zinc-400 mb-6">
                        <div>Emotion: <span className="text-zinc-300">{preset.settings.emotion}</span></div>
                        <div>Accent: <span className="text-zinc-300">{preset.settings.accent}</span></div>
                        <div>Pitch: <span className="text-zinc-300">{preset.settings.pitch}</span></div>
                        <div>Speed: <span className="text-zinc-300">{preset.settings.speed}x</span></div>
                      </div>

                      <button 
                        onClick={() => loadPreset(preset)}
                        className="w-full py-2 bg-zinc-800 hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <SparklesIcon /> Use Preset
                      </button>
                   </div>
                 ))}
               </div>
             )}
           </div>
        )}

        {/* COMMUNITY TAB */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold mb-2">Community Voices</h2>
              <p className="text-zinc-400 max-w-lg mx-auto">Explore high-quality voice presets created by the VoxGen community. Click to try them out.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMMUNITY_PRESETS.map(preset => (
                <div key={preset.id} className="bg-surface border border-surfaceHighlight rounded-xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-lg text-zinc-100">{preset.name}</h3>
                       <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <HeartIcon filled /> {preset.likes}
                       </div>
                    </div>
                    <div className="text-xs text-zinc-500 mb-4">by <span className="text-zinc-300">@{preset.author}</span></div>
                    
                    <div className="flex gap-2 flex-wrap mb-4">
                      {preset.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-zinc-800 rounded-md text-[10px] uppercase font-bold text-zinc-400">{tag}</span>
                      ))}
                    </div>

                    <div className="space-y-1 text-sm text-zinc-400 mb-5 bg-zinc-900/50 p-3 rounded-lg">
                       <div className="flex justify-between"><span>Voice</span> <span className="text-zinc-200">{preset.voice}</span></div>
                       <div className="flex justify-between"><span>Style</span> <span className="text-zinc-200">{preset.settings.emotion} / {preset.settings.accent}</span></div>
                    </div>

                    <button 
                      onClick={() => loadPreset(preset)}
                      className="w-full py-2.5 bg-zinc-100 text-zinc-900 font-bold hover:bg-primary hover:text-white rounded-lg text-sm transition-colors"
                    >
                      Try this Voice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Subcomponents

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
      active ? 'bg-surface text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface/50'
    }`}
  >
    {icon} {label}
  </button>
);

const AudioCard: React.FC<{ audio: GeneratedAudio }> = ({ audio }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onEnded = () => setIsPlaying(false);

  return (
    <div className="bg-surface border border-surfaceHighlight rounded-xl p-4 flex gap-4 transition-colors hover:border-zinc-700">
      <audio ref={audioRef} src={audio.blobUrl} onEnded={onEnded} className="hidden" />
      
      <button 
        onClick={togglePlay}
        className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-primary hover:text-white text-zinc-300 flex-shrink-0 flex items-center justify-center transition-colors"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-zinc-200">{audio.voice}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            {audio.settings.emotion}
          </span>
          {audio.settings.accent !== 'none' && (
             <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              {audio.settings.accent}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400 truncate font-mono">{audio.text}</p>
        <div className="text-xs text-zinc-600 mt-1">Generated {new Date(audio.timestamp).toLocaleTimeString()}</div>
      </div>

      <a 
        href={audio.blobUrl} 
        download={`voxgen-${audio.id}.wav`}
        className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
        title="Download WAV"
      >
        <DownloadIcon />
      </a>
    </div>
  );
}