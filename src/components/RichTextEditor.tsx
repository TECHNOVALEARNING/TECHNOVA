import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon, Quote, Heading1, Heading2, Heading3,
  Undo, Redo, Type, Video, Upload, Loader2,
  Sparkles, Rocket, Languages, CheckCheck
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
  withAI?: boolean;
}

const MenuButton = ({
  onClick,
  isActive = false,
  children,
  title,
  disabled = false,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${
      disabled ? 'opacity-50 cursor-not-allowed' :
      isActive
        ? 'bg-blue-50 text-blue-600'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="h-4 w-px bg-slate-200 mx-1" />;

/**
 * Detects HTML that was stored as escaped text (e.g. "&lt;h1&gt;Hello&lt;/h1&gt;"
 * or even raw "<h1>Hello</h1>" pasted as plain text into a text node) and
 * returns proper HTML so it can be rendered or re-loaded into TipTap.
 */
export function decodeHtmlIfEscaped(input: string): string {
  if (!input) return input;
  let html = input;

  if (/&lt;\/?[a-z][a-z0-9]*[^&]*&gt;/i.test(html)) {
    html = html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  if (/<p>\s*<(h[1-6]|div|section|article|ul|ol|table|hr|img)/i.test(html)) {
    html = html.replace(/<p>(\s*<(h[1-6]|div|section|article|ul|ol|table|hr|img)[\s\S]*?)<\/p>/gi, '$1');
  }

  return html;
}

function isVideoUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)/i.test(url);
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : null;
}

function getVideoEmbedUrl(url: string): string | null {
  const ytId = extractYoutubeId(url);
  if (ytId) return `https://www.youtube-nocookie.com/embed/${ytId}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export function RichTextEditor({ value, onChange, placeholder, label, withAI = false }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // AI Assistant State
  const [showIADropdown, setShowIADropdown] = useState(false);
  const [showIAImproveModal, setShowIAImproveModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [iaKeywords, setIaKeywords] = useState('');
  const [iaTone, setIaTone] = useState('Professionnel & Sérieux');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg my-2' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Commencez à écrire...',
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'rounded-lg my-4 w-full aspect-video',
        },
        width: 640,
        height: 360,
        nocookie: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none text-[15px] leading-relaxed text-slate-700',
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        const htmlClip = event.clipboardData?.getData('text/html');

        if (text && !htmlClip && /<\/?[a-z][a-z0-9]*[\s>]/i.test(text)) {
          event.preventDefault();
          const decoded = decodeHtmlIfEscaped(text);
          queueMicrotask(() => {
            editor?.chain().focus().insertContent(decoded).run();
          });
          return true;
        }

        if (text && isVideoUrl(text)) {
          event.preventDefault();
          const ytMatch = extractYoutubeId(text);
          if (ytMatch) {
            view.dispatch(view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.youtube.create({ src: text, width: 640, height: 360 })
            ));
            return true;
          }
          const embedUrl = getVideoEmbedUrl(text);
          if (embedUrl) {
            const { tr } = view.state;
            const node = view.state.schema.nodes.paragraph.create(
              {},
              view.state.schema.text(text, [view.state.schema.marks.link.create({ href: text })])
            );
            view.dispatch(tr.replaceSelectionWith(node));
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor) {
      const normalized = decodeHtmlIfEscaped(value || '');
      if (normalized !== editor.getHTML()) {
        editor.commands.setContent(normalized, false as any);
        if (normalized !== value) {
          onChange(editor.getHTML());
        }
      }
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL du lien:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL de l'image:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `description-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-assets')
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-assets')
        .getPublicUrl(fileName);

      editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
      toast.success("Image ajoutée !");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Erreur lors de l'upload: " + (err.message || "Réessayez"));
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = '';
  }, [handleImageUpload]);

  const addVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL de la vidéo (YouTube, Vimeo, etc.):");
    if (!url) return;
    
    if (/(?:youtube\.com\/(?:watch|embed|shorts)|youtu\.be)/i.test(url)) {
      editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
    } else {
      editor.chain().focus().insertContent(
        `<p><a href="${url}" target="_blank">${url}</a></p>`
      ).run();
    }
  }, [editor]);

  const generateIADescription = async () => {
    if (!editor) return;
    setIsGenerating(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        toast.error("La clé API Gemini n'est pas configurée ! Ajoutez VITE_GEMINI_API_KEY dans votre fichier .env");
        setIsGenerating(false);
        return;
      }

      const promptText = `
Tu es un copywriter expert et vendeur d'élite.
Génère ou améliore une description de produit hautement persuasive à partir de ce texte/contexte :
"${editor.getText() || 'Un produit numérique'}"

Détails de la demande :
- Mots-clés à inclure absolument : ${iaKeywords || 'Aucun mot-clé imposé'}
- Tonalité : ${iaTone}

Contraintes de format (Très important) :
Renvoie UNIQUEMENT le code HTML, sans balise \`\`\`html, sans <html> ni <body>.
Utilise exclusivement ces balises HTML pour la mise en forme :
- <h2> pour les sous-titres
- <h3> pour mettre en avant un bénéfice
- <p> pour les paragraphes
- <ul> et <li> pour les listes à puces
- <strong> pour mettre en gras les mots importants
Ne fais aucune introduction. Génère directement le contenu HTML final prêt à être affiché dans l'éditeur de texte.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!response.ok) {
        let errorMsg = 'Erreur de communication avec Google AI';
        try {
          const errData = await response.json();
          errorMsg = errData.error?.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      let generatedHTML = data.candidates[0].content.parts[0].text;
      
      generatedHTML = generatedHTML.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();

      editor.commands.setContent(generatedHTML);
      onChange(generatedHTML);
      setShowIAImproveModal(false);
      toast.success("Description améliorée avec succès !");
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur lors de la génération IA : " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!editor) return null;

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

      <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col min-h-[320px]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileSelect}
        />
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 p-2 bg-slate-50 border-b border-slate-200 flex-wrap shrink-0">
          <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Annuler">
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
            <Redo className="h-4 w-4" />
          </MenuButton>

          <Divider />

          <MenuButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph') && !editor.isActive('heading')}
            title="Paragraphe"
          >
            <Type className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Titre 1"
          >
            <Heading1 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Titre 2"
          >
            <Heading2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Titre 3"
          >
            <Heading3 className="h-4 w-4" />
          </MenuButton>

          <Divider />

          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Gras">
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italique">
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Souligné">
            <UnderlineIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Barré">
            <Strikethrough className="h-4 w-4" />
          </MenuButton>

          <Divider />

          <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Aligner à gauche">
            <AlignLeft className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Centrer">
            <AlignCenter className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Aligner à droite">
            <AlignRight className="h-4 w-4" />
          </MenuButton>

          <Divider />

          <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Liste à puces">
            <List className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Liste numérotée">
            <ListOrdered className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Citation">
            <Quote className="h-4 w-4" />
          </MenuButton>

          <Divider />

          <MenuButton onClick={addLink} isActive={editor.isActive('link')} title="Ajouter un lien">
            <LinkIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => fileInputRef.current?.click()} title="Uploader une image" disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </MenuButton>
          <MenuButton onClick={addImageByUrl} title="Image par URL">
            <ImageIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={addVideo} title="Insérer une vidéo">
            <Video className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>

      {/* AI Improve Modal */}
      {showIAImproveModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
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
                  <input type="text" value={iaKeywords} onChange={(e) => setIaKeywords(e.target.value)} placeholder="Ex: SEO, débutants, formation complète..." className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[13px] outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Ton souhaité</label>
                  <select value={iaTone} onChange={(e) => setIaTone(e.target.value)} className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[13px] outline-none focus:border-blue-500">
                    <option>Persuasif & Vendeur</option>
                    <option>Professionnel & Sérieux</option>
                    <option>Énergique & Enthousiaste</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowIAImproveModal(false)} className="px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Annuler</button>
              <button disabled={isGenerating} onClick={generateIADescription} className="bg-[#6B46C1] hover:bg-[#553C9A] disabled:opacity-50 text-white font-bold px-6 py-2 rounded-lg text-[13px] transition-colors shadow-sm flex items-center gap-2">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Génération...' : 'Générer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;
