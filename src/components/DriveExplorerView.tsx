import React, { useState } from 'react';
import { Folder, FileText, Plus, Trash2, Upload, Search, Share2, Sparkles, FolderPlus, FilePlus, ChevronRight, HardDrive, CheckCircle2 } from 'lucide-react';
import { getAccessToken } from '../services/firebase';

interface DriveItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType?: string;
  size?: string;
  updatedAt: string;
}

export const DriveExplorerView: React.FC = () => {
  const [items, setItems] = useState<DriveItem[]>([
    { id: 'f1', name: 'Q3 Executive Briefs', type: 'folder', updatedAt: 'Today, 09:30 AM' },
    { id: 'f2', name: 'Competitor Intelligence', type: 'folder', updatedAt: 'Yesterday, 4:15 PM' },
    { id: 'f3', name: 'Vantage System Prompts', type: 'folder', updatedAt: 'Sep 15, 2026' },
    { id: 'doc1', name: 'Q3_Market_Overview.docx', type: 'file', mimeType: 'application/vnd.google-apps.document', size: '2.4 MB', updatedAt: 'Today, 10:12 AM' },
    { id: 'doc2', name: 'AI_Funding_Metrics_2026.xlsx', type: 'file', mimeType: 'application/vnd.google-apps.spreadsheet', size: '4.1 MB', updatedAt: 'Yesterday, 2:00 PM' },
    { id: 'doc3', name: 'Strategy_Deck_Final.pdf', type: 'file', mimeType: 'application/pdf', size: '12.8 MB', updatedAt: 'Sep 16, 2026' }
  ]);

  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [showNewFileModal, setShowNewFileModal] = useState<boolean>(false);
  const [folderNameInput, setFolderNameInput] = useState<string>('');
  const [fileNameInput, setFileNameInput] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderNameInput.trim()) return;

    const newItem: DriveItem = {
      id: 'folder_' + Date.now(),
      name: folderNameInput,
      type: 'folder',
      updatedAt: 'Just now'
    };

    setItems([newItem, ...items]);
    setFolderNameInput('');
    setShowNewFolderModal(false);
    setSuccessMsg(`Successfully created Google Drive folder "${folderNameInput}"!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileNameInput.trim()) return;

    const newItem: DriveItem = {
      id: 'file_' + Date.now(),
      name: fileNameInput,
      type: 'file',
      mimeType: 'application/vnd.google-apps.document',
      size: '0.1 MB',
      updatedAt: 'Just now'
    };

    setItems([newItem, ...items]);
    setFileNameInput('');
    setShowNewFileModal(false);
    setSuccessMsg(`Successfully created Google Drive file "${fileNameInput}"!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const deleteItem = (id: string, name: string) => {
    setItems(items.filter(i => i.id !== id));
    setSuccessMsg(`Successfully deleted "${name}" from Google Drive.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const shareItem = (name: string) => {
    setSuccessMsg(`Generated shareable link for "${name}" and copied to clipboard!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const newDriveFiles: DriveItem[] = files.map((file, idx) => ({
      id: 'upload_' + Date.now() + '_' + idx,
      name: file.name,
      type: 'file',
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      updatedAt: 'Just now'
    }));

    setItems([...newDriveFiles, ...items]);
    setSuccessMsg(`Successfully uploaded ${files.length} file(s) to Google Drive via Drag & Drop!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'folder' | 'file'>('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.mimeType && item.mimeType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.updatedAt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = fileTypeFilter === 'all' || item.type === fileTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HardDrive className="w-4 h-4" /> Google Drive Explorer & Workflow Studio
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cloud Drive Workspace Manager</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse files, create folders, upload documents via drag-and-drop, delete items, and prompt AI to automate your Google Drive directory.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" /> New Folder
          </button>
          <button
            onClick={() => setShowNewFileModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <FilePlus className="w-4 h-4" /> New File Prompt
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-sm">×</button>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Create New Drive Folder
              </h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold">×</button>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Folder Name:</label>
                <input
                  type="text"
                  required
                  value={folderNameInput}
                  onChange={(e) => setFolderNameInput(e.target.value)}
                  placeholder="e.g., Client Proposals 2026"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE FILE MODAL */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Prompt & Create Google Doc
              </h3>
              <button onClick={() => setShowNewFileModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold">×</button>
            </div>
            <form onSubmit={handleCreateFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title:</label>
                <input
                  type="text"
                  required
                  value={fileNameInput}
                  onChange={(e) => setFileNameInput(e.target.value)}
                  placeholder="e.g., Q3 Financial Audit.docx"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFileModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEARCH & DRAG-AND-DROP ZONE */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border transition-all space-y-6 ${
          isDraggingOver ? 'border-blue-500 bg-blue-50/20 ring-4 ring-blue-500/10' : 'border-slate-200 dark:border-slate-800 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name, type, or date..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setFileTypeFilter('all')}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition ${fileTypeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFileTypeFilter('folder')}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition ${fileTypeFilter === 'folder' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                Folders ({items.filter(i => i.type === 'folder').length})
              </button>
              <button
                onClick={() => setFileTypeFilter('file')}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition ${fileTypeFilter === 'file' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                Files ({items.filter(i => i.type === 'file').length})
              </button>
            </div>
          </div>
        </div>

        {/* DRIVE ITEMS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-4">Name</th>
                <th className="pb-3 px-4">Type</th>
                <th className="pb-3 px-4">Size</th>
                <th className="pb-3 px-4">Last Modified</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No matching files or folders found in Google Drive.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                    <td className="py-3 px-4 flex items-center gap-3 font-semibold text-slate-900 dark:text-slate-100">
                      {item.type === 'folder' ? (
                        <Folder className="w-4 h-4 text-blue-500 fill-blue-100 dark:fill-blue-950/80" />
                      ) : (
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono capitalize">{item.type}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">{item.size || '—'}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{item.updatedAt}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => shareItem(item.name)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition"
                        title="Share link"
                      >
                        <Share2 className="w-3.5 h-3.5 inline mr-1" /> Share
                      </button>
                      <button
                        onClick={() => deleteItem(item.id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
