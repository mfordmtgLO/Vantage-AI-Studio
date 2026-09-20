import React, { useState, useEffect } from 'react';
import { useMemory } from '../context/MemoryContext';
import { MemoryType } from '../types';
import { Brain, X, Check, Cloud, Shield, Sparkles, Tag, FileText } from 'lucide-react';

export const RememberThisModal: React.FC = () => {
  const { isRememberModalOpen, closeRememberModal, rememberModalData, saveMemory, cloudSyncStatus } = useMemory();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<MemoryType>('instruction');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (rememberModalData) {
      setTitle(rememberModalData.title || '');
      setContent(rememberModalData.content || '');
      setType(rememberModalData.type || 'instruction');
      setTagsInput(rememberModalData.tags?.join(', ') || '');
    } else {
      setTitle('');
      setContent('');
      setType('instruction');
      setTagsInput('persona, instruction');
    }
    setSavedSuccess(false);
  }, [rememberModalData, isRememberModalOpen]);

  if (!isRememberModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      await saveMemory({
        title: title.trim(),
        content: content.trim(),
        type,
        tags: parsedTags.length > 0 ? parsedTags : [type],
        source: 'chat_remember_this'
      });

      setSavedSuccess(true);
      setTimeout(() => {
        closeRememberModal();
      }, 900);
    } catch (err) {
      console.error('Failed to save memory:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Remember This Context
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center gap-1 border border-blue-200 dark:border-blue-800/60">
                  <Cloud className="w-3 h-3" />
                  {cloudSyncStatus === 'synced' ? 'Firestore Cloud + Local' : 'Local Session Ready'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Teach Vantage 2nd Brain instructions, persona rules, or facts to remember across all threads.
              </p>
            </div>
          </div>
          <button
            onClick={closeRememberModal}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Memory Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Memory Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'instruction', label: 'Instruction', icon: Shield, desc: 'Behavior & safety' },
                { id: 'persona', label: 'Persona', icon: Sparkles, desc: 'Tone & style' },
                { id: 'knowledge', label: 'Knowledge', icon: FileText, desc: 'Context & facts' },
                { id: 'agent_workflow', label: 'Workflow', icon: Brain, desc: 'Cron & automation' }
              ].map((item) => {
                const Icon = item.icon;
                const active = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as MemoryType)}
                    className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition ${
                      active
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Memory Title / Guideline Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Executive Tone & Bullet Formatting, or Client VIP Protocol"
              className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Remembered Text / Prompt Payload
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the specific instructions, persona tone rules, or prompt-engineered context to maintain..."
              className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="persona, tone, executive, workspace"
              className="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Auto-injected into Gemini & DeepSeek reasoning
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeRememberModal}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !title.trim() || !content.trim()}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    Remembered!
                  </>
                ) : isSaving ? (
                  'Saving Memory...'
                ) : (
                  <>
                    <Brain className="w-3.5 h-3.5" />
                    Save Memory
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
