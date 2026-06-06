import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Rocket, Languages, CheckCheck, 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link as LinkIcon, Image as ImageIcon2, Video
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  withAI?: boolean;
}

export function RichTextEditor({ value, onChange, label, withAI = false }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  
  const [showFormatPopup, setShowFormatPopup] = useState(false);
  const [currentFormat, setCurrentFormat] = useState('Normal');

  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');

  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // AI Assistant State
  const [showIADropdown, setShowIADropdown] = useState(false);
  const [showIAImproveModal, setShowIAImproveModal] = useState(false);

  // Sync internal editable div only when needed
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Don't overwrite if the user is typing
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleFormat = (e: React.MouseEvent, command: string) => {
    e.preventDefault();
    document.execCommand(command, false);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-[14px] font-medium text-slate-900">{label}</label>
          
          {withAI && (
            <div className="relative">
              <button 
                onClick={(e) => { e.preventDefault(); setShowIADropdown(!showIADropdown); }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-[8px] border border-[#E9D8FD] bg-gradient-to-r from-[#F0F5FF] to-[#FAF5FF] text-slate-800 text-[13px] font-bold hover:shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#6B46C1]" />
                Assistant IA
              </button>

              {showIADropdown && (
                <div className="absolute top-[120%] right-0 bg-white border border-[#E5E7EB] shadow-xl rounded-xl py-2 min-w-[240px] z-[60] animate-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={(e) => { e.preventDefault(); setShowIADropdown(false); setShowIAImproveModal(true); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-[14px] transition-colors"
                  >
                    <Rocket className="w-4 h-4 text-slate-600" />
                    Améliorer la description
                  </button>
                  <button 
                    onClick={(e) => e.preventDefault()}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-[14px] transition-colors"
                  >
                    <Languages className="w-4 h-4 text-slate-600" />
                    Traduire la description
                  </button>
                  <button 
                    onClick={(e) => e.preventDefault()}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-[14px] transition-colors"
                  >
                    <CheckCheck className="w-4 h-4 text-slate-600" />
                    Vérifier la grammaire
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="border border-[#D1D5DB] rounded-lg bg-white shadow-sm flex flex-col min-h-[320px]">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E5E7EB] bg-[#F9FAFB] overflow-x-visible shrink-0 relative rounded-t-lg flex-wrap">
          
          <div className="relative flex items-center">
            <button 
              onMouseDown={(e) => {
                e.preventDefault();
                setShowFormatPopup(!showFormatPopup);
                setShowLinkPopup(false);
                setShowImagePopup(false);
                setShowVideoPopup(false);
              }} 
              className={`text-[13px] flex items-center gap-1.5 bg-transparent text-slate-700 font-medium py-1.5 px-2 rounded-md hover:bg-slate-200 transition-colors ${showFormatPopup ? 'bg-slate-200' : ''}`}
            >
              {currentFormat}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>

            {showFormatPopup && (
              <div className="absolute top-[120%] left-0 bg-white border border-[#D1D5DB] shadow-lg flex flex-col z-[50] min-w-[150px] py-1.5 rounded-[4px]">
                <button 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    document.execCommand('formatBlock', false, 'H1');
                    setCurrentFormat('Titre 1');
                    setShowFormatPopup(false);
                    if (editorRef.current) onChange(editorRef.current.innerHTML);
                  }}
                  className="text-left px-4 py-2 hover:bg-slate-50 text-slate-800 text-[22px] font-bold transition-colors"
                >
                  Titre 1
                </button>
                <button 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    document.execCommand('formatBlock', false, 'H2');
                    setCurrentFormat('Titre 2');
                    setShowFormatPopup(false);
                    if (editorRef.current) onChange(editorRef.current.innerHTML);
                  }}
                  className="text-left px-4 py-2 hover:bg-slate-50 text-slate-800 text-[18px] font-bold transition-colors"
                >
                  Titre 2
                </button>
                <button 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    document.execCommand('formatBlock', false, 'H3');
                    setCurrentFormat('Titre 3');
                    setShowFormatPopup(false);
                    if (editorRef.current) onChange(editorRef.current.innerHTML);
                  }}
                  className="text-left px-4 py-2 hover:bg-slate-50 text-slate-800 text-[15px] font-bold transition-colors"
                >
                  Titre 3
                </button>
                <button 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    document.execCommand('formatBlock', false, 'P');
                    setCurrentFormat('Normal');
                    setShowFormatPopup(false);
                    if (editorRef.current) onChange(editorRef.current.innerHTML);
                  }}
                  className="text-left px-4 py-2 hover:bg-slate-50 text-slate-800 text-[13px] font-medium transition-colors"
                >
                  Normal
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          <button onMouseDown={(e) => handleFormat(e, 'bold')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><Bold className="w-4 h-4" strokeWidth={2.5} /></button>
          <button onMouseDown={(e) => handleFormat(e, 'italic')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><Italic className="w-4 h-4" strokeWidth={2.5} /></button>
          <button onMouseDown={(e) => handleFormat(e, 'underline')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><Underline className="w-4 h-4" strokeWidth={2.5} /></button>
          <button onMouseDown={(e) => handleFormat(e, 'strikeThrough')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><Strikethrough className="w-4 h-4" strokeWidth={2.5} /></button>
          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          <button onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><List className="w-4 h-4" strokeWidth={2.5} /></button>
          <button onMouseDown={(e) => handleFormat(e, 'insertOrderedList')} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><ListOrdered className="w-4 h-4" strokeWidth={2.5} /></button>
          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          
          <div className="relative flex items-center">
            <button 
              onMouseDown={(e) => {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  setSavedRange(selection.getRangeAt(0));
                }
                setShowLinkPopup(!showLinkPopup);
                setShowImagePopup(false);
                setShowVideoPopup(false);
                setShowFormatPopup(false);
              }} 
              className={`p-1.5 rounded-md transition-colors ${showLinkPopup ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <LinkIcon className="w-4 h-4" strokeWidth={2.5} />
            </button>

            {showLinkPopup && (
              <div className="absolute top-[120%] left-0 bg-white border border-[#D1D5DB] shadow-lg rounded-md p-1.5 flex items-center gap-2 z-[50] w-[320px]">
                <span className="text-[13px] text-slate-700 font-medium pl-1 whitespace-nowrap">Enter link:</span>
                <input 
                  type="text" 
                  placeholder="URL" 
                  value={linkUrlInput}
                  onChange={e => setLinkUrlInput(e.target.value)}
                  className="flex-1 border border-[#D1D5DB] rounded-[4px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
                <button 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!linkUrlInput) return;
                    
                    if (savedRange) {
                      const selection = window.getSelection();
                      selection?.removeAllRanges();
                      selection?.addRange(savedRange);
                    }

                    document.execCommand('createLink', false, linkUrlInput);
                    if (editorRef.current) onChange(editorRef.current.innerHTML);
                    
                    setShowLinkPopup(false);
                    setLinkUrlInput('');
                  }}
                  className="text-blue-600 text-[13px] font-medium px-2 hover:text-blue-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="relative flex items-center">
            <button 
              onMouseDown={(e) => {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  setSavedRange(selection.getRangeAt(0));
                }
                setShowImagePopup(!showImagePopup);
                setShowLinkPopup(false);
                setShowVideoPopup(false);
                setShowFormatPopup(false);
              }} 
              className={`p-1.5 rounded-md transition-colors ${showImagePopup ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <ImageIcon2 className="w-4 h-4" strokeWidth={2.5} />
            </button>

            {showImagePopup && (
              <div className="absolute top-[120%] left-0 bg-white border border-[#D1D5DB] shadow-lg rounded-md p-1.5 flex items-center gap-2 z-[50] w-[320px]">
                <span className="text-[13px] text-slate-700 font-medium pl-1 whitespace-nowrap">Enter image:</span>
                <input 
                  type="text" 
                  placeholder="Image URL" 
                  value={imageUrlInput}
                  onChange={e => setImageUrlInput(e.target.value)}
                  className="flex-1 border border-[#D1D5DB] rounded-[4px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
                <button 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!imageUrlInput) return;
                    
                    if (savedRange) {
                      const selection = window.getSelection();
                      selection?.removeAllRanges();
                      selection?.addRange(savedRange);
                    }

                    const html = `<div style="margin: 16px 0; text-align: center;"><img src="${imageUrlInput}" style="max-width: 100%; height: auto; border-radius: 8px;" /></div><p><br></p>`;
                    document.execCommand('insertHTML', false, html);
                    if (editorRef.current) onChange(editorRef.current.innerHTML);
                    
                    setShowImagePopup(false);
                    setImageUrlInput('');
                  }}
                  className="text-blue-600 text-[13px] font-medium px-2 hover:text-blue-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}
          </div>
          
          <div className="relative flex items-center">
            <button 
              onMouseDown={(e) => {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  setSavedRange(selection.getRangeAt(0));
                }
                setShowVideoPopup(!showVideoPopup);
                setShowLinkPopup(false);
                setShowImagePopup(false);
                setShowFormatPopup(false);
              }} 
              className={`p-1.5 rounded-md transition-colors ${showVideoPopup ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <Video className="w-4 h-4" strokeWidth={2.5} />
            </button>

            {showVideoPopup && (
              <div className="absolute top-[120%] left-0 bg-white border border-[#D1D5DB] shadow-lg rounded-md p-1.5 flex items-center gap-2 z-[50] w-[320px]">
                <span className="text-[13px] text-slate-700 font-medium pl-1 whitespace-nowrap">Enter video:</span>
                <input 
                  type="text" 
                  placeholder="Embed URL" 
                  value={videoUrlInput}
                  onChange={e => setVideoUrlInput(e.target.value)}
                  className="flex-1 border border-[#D1D5DB] rounded-[4px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
                <button 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!videoUrlInput) return;
                    
                    if (savedRange) {
                      const selection = window.getSelection();
                      selection?.removeAllRanges();
                      selection?.addRange(savedRange);
                    }

                    let embedUrl = videoUrlInput;
                    const iframeMatch = videoUrlInput.match(/src="([^"]+)"/);
                    if (iframeMatch) {
                      embedUrl = iframeMatch[1];
                    } else if (videoUrlInput.includes('youtube.com/watch?v=')) {
                      embedUrl = `https://www.youtube.com/embed/${videoUrlInput.split('v=')[1].split('&')[0]}`;
                    } else if (videoUrlInput.includes('youtu.be/')) {
                      embedUrl = `https://www.youtube.com/embed/${videoUrlInput.split('youtu.be/')[1].split('?')[0]}`;
                    } else if (videoUrlInput.includes('vimeo.com/')) {
                      embedUrl = `https://player.vimeo.com/video/${videoUrlInput.split('vimeo.com/')[1].split('?')[0]}`;
                    }

                    const html = `<div contenteditable="false" style="margin: 16px 0; text-align: center;"><iframe src="${embedUrl}" width="100%" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 8px; max-width: 100%;"></iframe></div><p><br></p>`;
                    
                    document.execCommand('insertHTML', false, html);
                    if (editorRef.current) onChange(editorRef.current.innerHTML);
                    
                    setShowVideoPopup(false);
                    setVideoUrlInput('');
                  }}
                  className="text-blue-600 text-[13px] font-medium px-2 hover:text-blue-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
        
        <style>{`
          .custom-editor h1 {
            font-size: 36px !important;
            font-weight: 800 !important;
            letter-spacing: -0.025em !important;
            line-height: 1.2 !important;
            margin-top: 0.5em !important;
            margin-bottom: 0.25em !important;
          }
          .custom-editor h2 {
            font-size: 26px !important;
            font-weight: 700 !important;
            margin-top: 0.5em !important;
            margin-bottom: 0.25em !important;
          }
          .custom-editor h3 {
            font-size: 20px !important;
            font-weight: 700 !important;
            margin-top: 0.5em !important;
            margin-bottom: 0.25em !important;
          }
          .custom-editor a {
            color: #2563eb !important;
            text-decoration: underline !important;
          }
          .custom-editor ul {
            list-style-type: disc !important;
            padding-left: 2rem !important;
            margin: 1rem 0 !important;
          }
          .custom-editor ol {
            list-style-type: decimal !important;
            padding-left: 2rem !important;
            margin: 1rem 0 !important;
          }
        `}</style>
        
        <div 
          ref={editorRef}
          contentEditable
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          onBlur={(e) => onChange(e.currentTarget.innerHTML)}
          className="flex-1 p-5 outline-none custom-editor text-[15px] leading-relaxed text-slate-700 overflow-y-auto"
          style={{ minHeight: '200px' }}
        />
      </div>

      {showIAImproveModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#6B46C1] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Améliorer avec l'IA</h3>
              </div>
              <button onClick={() => setShowIAImproveModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[14px] text-slate-600">L'IA va réécrire votre description pour la rendre plus attractive et professionnelle.</p>
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Mots-clés (optionnel)</label>
                  <input type="text" placeholder="Ex: SEO, débutants, formation complète..." className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[13px] outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Ton souhaité</label>
                  <select className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[13px] outline-none focus:border-blue-500">
                    <option>Persuasif & Vendeur</option>
                    <option>Professionnel & Sérieux</option>
                    <option>Énergique & Enthousiaste</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowIAImproveModal(false)} className="px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-200 rounded-lg">Annuler</button>
              <button className="bg-[#6B46C1] hover:bg-[#553C9A] text-white font-bold px-6 py-2 rounded-lg text-[13px] transition-colors shadow-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Générer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
