
import React, { useState, useEffect, useCallback } from 'react';
import { ModelType, GeneratedWallpaper, AspectRatio, ImageSize } from './types';
import { WALLPAPER_STYLES, ASPECT_RATIOS } from './constants';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(WALLPAPER_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [modelType, setModelType] = useState<ModelType>(ModelType.STANDARD);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GeneratedWallpaper[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load gallery from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lumina_gallery');
    if (saved) {
      try {
        setGallery(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse gallery");
      }
    }
  }, []);

  // Save gallery to localStorage
  useEffect(() => {
    localStorage.setItem('lumina_gallery', JSON.stringify(gallery));
  }, [gallery]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for your wallpaper.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Handle Pro model API key requirement
      if (modelType === ModelType.PRO) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // After returning from dialog, we assume they selected a key as per instructions
        }
      }

      const fullPrompt = `${prompt}, ${selectedStyle.promptSuffix}`;
      const imageUrl = await GeminiService.generateWallpaper({
        prompt: fullPrompt,
        aspectRatio,
        model: modelType,
        ...(modelType === ModelType.PRO && { imageSize }),
      });

      setCurrentImage(imageUrl);
      
      const newEntry: GeneratedWallpaper = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt,
        style: selectedStyle.name,
        aspectRatio: aspectRatio,
        createdAt: Date.now(),
      };
      
      setGallery(prev => [newEntry, ...prev]);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key Error. Please re-select your API key.");
        if (modelType === ModelType.PRO) await window.aistudio.openSelectKey();
      } else {
        setError(err.message || "An unexpected error occurred during generation.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteWallpaper = (id: string) => {
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fas fa-wand-magic-sparkles text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">LUMINA <span className="gradient-text">AI</span></span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Generator</a>
          <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-white transition-colors">Billing Info</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Design Your Perfect <span className="gradient-text">Workspace</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Transform your creative ideas into high-resolution wallpapers. 
            Powered by Gemini, Lumina creates stunning aesthetics tailored to your vision.
          </p>
        </section>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Controls Panel */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="glass p-8 rounded-3xl flex flex-col gap-6">
              {/* Prompt Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Describe your wallpaper</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A serene floating island with waterfalls under a lavender sky..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-200 resize-none h-32"
                />
              </div>

              {/* Style Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Visual Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {WALLPAPER_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        selectedStyle.id === style.id
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'bg-slate-900/30 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <i className={`fas ${style.icon} text-lg`}></i>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300 ml-1">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-300"
                  >
                    {ASPECT_RATIOS.map((ratio) => (
                      <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300 ml-1">Model Engine</label>
                  <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value as ModelType)}
                    className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-300"
                  >
                    <option value={ModelType.STANDARD}>Flash 2.5 (Fast)</option>
                    <option value={ModelType.PRO}>Pro 3.0 (High Quality)</option>
                  </select>
                </div>
              </div>

              {/* Pro Quality Options */}
              {modelType === ModelType.PRO && (
                <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                  <label className="text-sm font-semibold text-slate-300 ml-1">Target Resolution</label>
                  <div className="flex gap-3">
                    {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size)}
                        className={`flex-1 p-2 rounded-xl border text-sm font-bold transition-all ${
                          imageSize === size
                            ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                            : 'bg-slate-900/30 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
                  <i className="fas fa-circle-exclamation"></i>
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`glow-button w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  isGenerating 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Crafting Magic...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sparkles"></i>
                    Generate Wallpaper
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-7">
            <div className="glass h-full min-h-[500px] rounded-3xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-200">Result Preview</h3>
                {currentImage && (
                  <button 
                    onClick={() => downloadImage(currentImage, `lumina-wallpaper-${Date.now()}.png`)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    <i className="fas fa-download"></i>
                    Download Full Res
                  </button>
                )}
              </div>
              
              <div className="flex-grow flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden relative group">
                {isGenerating ? (
                  <div className="text-center animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-wand-sparkles text-3xl text-blue-400"></i>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Synthesizing Pixels</p>
                      <p className="text-slate-500 text-sm">Our AI is painting your vision...</p>
                    </div>
                  </div>
                ) : currentImage ? (
                  <img 
                    src={currentImage} 
                    alt="Generated wallpaper" 
                    className="max-w-full max-h-[600px] object-contain shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="text-center text-slate-500 px-10">
                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <i className="fas fa-image text-4xl opacity-20"></i>
                    </div>
                    <p className="text-lg font-medium mb-1">No Wallpaper Generated Yet</p>
                    <p className="text-sm opacity-60">Enter a prompt and click generate to see the magic happen.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <section id="gallery" className="mt-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Recent <span className="gradient-text">Creations</span></h2>
              <p className="text-slate-500">Your locally saved collection of generated masterpieces.</p>
            </div>
            {gallery.length > 0 && (
              <button 
                onClick={() => {
                  if(confirm("Are you sure you want to clear your gallery?")) setGallery([]);
                }}
                className="text-slate-500 hover:text-red-400 text-sm transition-colors flex items-center gap-2"
              >
                <i className="fas fa-trash-can"></i>
                Clear All
              </button>
            )}
          </div>

          {gallery.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center border-dashed border-2 border-slate-800">
              <p className="text-slate-500 italic">No items in your gallery yet. Start generating!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gallery.map((item) => (
                <div key={item.id} className="group relative glass rounded-3xl overflow-hidden flex flex-col">
                  <div className="aspect-video overflow-hidden bg-slate-900 relative">
                    <img 
                      src={item.url} 
                      alt={item.prompt} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 gap-3">
                       <button 
                        onClick={() => downloadImage(item.url, `lumina-${item.id}.png`)}
                        className="flex-1 bg-white text-black py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                       >
                         <i className="fas fa-download"></i>
                         Download
                       </button>
                       <button 
                        onClick={() => deleteWallpaper(item.id)}
                        className="w-10 h-10 bg-red-500/20 backdrop-blur-md text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                       >
                         <i className="fas fa-trash"></i>
                       </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{item.style}</span>
                      <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{item.aspectRatio}</span>
                    </div>
                    <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">{item.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-32 pt-12 pb-8 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <i className="fas fa-wand-magic-sparkles text-blue-500"></i>
              <span className="font-bold tracking-tight">LUMINA AI</span>
            </div>
            <p className="text-slate-500 text-sm max-w-md">
              The ultimate destination for AI-generated aesthetic wallpapers. 
              Always high resolution, always unique.
            </p>
            <div className="flex gap-6 text-slate-400">
              <a href="#" className="hover:text-blue-400 transition-colors"><i className="fab fa-twitter"></i></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><i className="fab fa-instagram"></i></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><i className="fab fa-discord"></i></a>
            </div>
            <p className="text-slate-600 text-[10px] uppercase tracking-widest mt-8">
              &copy; 2024 Lumina AI Generator • Built with Gemini 3
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
