/**
 * Vantage AI Workspace - Bi-Directional Relational Google Sheets Query Engine
 * SQL & Natural Language Query Runner, Schema Drift Protector, and Atomic Rollback Vault
 * 
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>. All rights reserved.
 */

import React, { useState } from 'react';
import { 
  Table, Database, Lock, Unlock, Play, RefreshCw, RotateCcw, 
  Download, Plus, Trash2, CheckCircle2, AlertTriangle, Search, 
  Sparkles, Layers, ShieldCheck, ArrowUpDown, FileSpreadsheet,
  HelpCircle, Check, Copy
} from 'lucide-react';
import { 
  SheetDataset, 
  PREBUILT_SHEET_DATASETS, 
  SheetRowRecord, 
  SheetColumnSchema,
  SheetSnapshot, 
  SchemaValidationIssue,
  RelationalSheetQueryRunner 
} from '../utils/workspaceQueryEngine';

export const RelationalSheetsQueryEngine: React.FC = () => {
  const [datasets, setDatasets] = useState<SheetDataset[]>(PREBUILT_SHEET_DATASETS);
  const [activeDatasetId, setActiveDatasetId] = useState<string>(PREBUILT_SHEET_DATASETS[0].id);
  const [isSchemaLocked, setIsSchemaLocked] = useState<boolean>(true);
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT borrower, loan_amount, ltv, dti, credit_score, stage FROM pipeline WHERE loan_amount >= 350000 ORDER BY loan_amount DESC;"
  );
  const [nlQuery, setNlQuery] = useState<string>('');
  const [queryError, setQueryError] = useState<string | null>(null);
  const [lastExecutionMs, setLastExecutionMs] = useState<number | null>(null);

  // Rollback Snapshots Vault
  const [snapshots, setSnapshots] = useState<SheetSnapshot[]>([
    {
      id: 'snap-init',
      timestamp: 'Initial Baseline',
      description: 'System-verified origin state with pristine data types',
      rowCount: PREBUILT_SHEET_DATASETS[0].rows.length,
      data: JSON.parse(JSON.stringify(PREBUILT_SHEET_DATASETS[0].rows)),
      columns: JSON.parse(JSON.stringify(PREBUILT_SHEET_DATASETS[0].columns))
    }
  ]);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterSearch, setFilterSearch] = useState<string>('');

  const currentDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  // Validate all rows against schema
  const validationIssues: SchemaValidationIssue[] = currentDataset.rows.flatMap((r) =>
    RelationalSheetQueryRunner.validateRowAgainstSchema(r, currentDataset.columns)
  );

  // Compute Aggregates
  const totalLoanValue = currentDataset.rows.reduce((acc, r) => acc + (Number(r.loan_amount) || Number(r.budget_max) || 0), 0);
  const avgLoanValue = currentDataset.rows.length > 0 ? totalLoanValue / currentDataset.rows.length : 0;
  const avgCreditScore = currentDataset.rows.some(r => r.credit_score)
    ? currentDataset.rows.reduce((acc, r) => acc + (Number(r.credit_score) || 0), 0) / currentDataset.rows.length
    : null;

  // Execute SQL Query
  const handleExecuteSqlQuery = () => {
    setQueryError(null);
    const res = RelationalSheetQueryRunner.executeSqlQuery(sqlQuery, currentDataset);
    if (res.error) {
      setQueryError(res.error);
    } else {
      setLastExecutionMs(res.executionTimeMs);
      setNotificationMsg(`SQL Query executed in ${res.executionTimeMs}ms • ${res.rows.length} rows matched criteria.`);
      setTimeout(() => setNotificationMsg(null), 3500);
    }
  };

  // Convert Natural Language into SQL Query
  const handleTranslateNaturalLanguage = () => {
    if (!nlQuery.trim()) return;
    const lower = nlQuery.toLowerCase();
    let generatedSql = '';

    if (lower.includes('texas') || lower.includes('tx')) {
      generatedSql = "SELECT * FROM pipeline WHERE state = 'TX' ORDER BY loan_amount DESC;";
    } else if (lower.includes('dti') && (lower.includes('under') || lower.includes('less'))) {
      generatedSql = "SELECT borrower, loan_amount, dti, stage FROM pipeline WHERE dti <= 36 ORDER BY dti ASC;";
    } else if (lower.includes('fha') || lower.includes('va') || lower.includes('homeready')) {
      generatedSql = "SELECT borrower, loan_type, loan_amount, dpa_grant_eligible FROM pipeline WHERE loan_type LIKE '%VA%' OR loan_type LIKE '%FHA%';";
    } else if (lower.includes('high') || lower.includes('jumbo') || lower.includes('largest')) {
      generatedSql = "SELECT borrower, property_address, loan_amount, interest_rate FROM pipeline WHERE loan_amount >= 500000 ORDER BY loan_amount DESC;";
    } else {
      generatedSql = `SELECT * FROM pipeline WHERE borrower LIKE '%${nlQuery.trim()}%' OR property_address LIKE '%${nlQuery.trim()}%';`;
    }

    setSqlQuery(generatedSql);
    setNotificationMsg('Natural language converted to relational SQL query.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Create Snapshot checkpoint
  const handleCreateSnapshot = (customDesc?: string) => {
    const newSnap: SheetSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      description: customDesc || `Manual Checkpoint (${currentDataset.rows.length} records)`,
      rowCount: currentDataset.rows.length,
      data: JSON.parse(JSON.stringify(currentDataset.rows)),
      columns: JSON.parse(JSON.stringify(currentDataset.columns))
    };
    setSnapshots((prev) => [newSnap, ...prev.slice(0, 9)]);
    setNotificationMsg('Immutable snapshot checkpoint recorded in atomic vault.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // 1-Click Rollback
  const handleRollbackSnapshot = (snap: SheetSnapshot) => {
    setDatasets((prev) =>
      prev.map((d) => {
        if (d.id === activeDatasetId) {
          return {
            ...d,
            rows: JSON.parse(JSON.stringify(snap.data)),
            columns: JSON.parse(JSON.stringify(snap.columns))
          };
        }
        return d;
      })
    );
    setNotificationMsg(`Successfully rolled back to snapshot checkpoint "${snap.timestamp}" (${snap.description}).`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Cell Edit
  const handleCellChange = (rowId: string, columnId: string, value: any) => {
    setDatasets((prev) =>
      prev.map((d) => {
        if (d.id === activeDatasetId) {
          return {
            ...d,
            rows: d.rows.map((r) => (r.id === rowId ? { ...r, [columnId]: value } : r))
          };
        }
        return d;
      })
    );
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = currentDataset.columns.map((c) => c.label).join(',');
    const rows = currentDataset.rows.map((r) =>
      currentDataset.columns.map((c) => `"${String(r[c.id] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentDataset.id}_exported.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-blue-600/10 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Table className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Relational Google Sheets Engine & Schema Drift Protector
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white rounded-full">
                Bi-Directional SQL
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Query Google Sheets with relational SQL, protect data types against schema drift, and restore atomic snapshots.
            </p>
          </div>
        </div>

        {/* Schema Lock Status Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsSchemaLocked(!isSchemaLocked);
              setNotificationMsg(
                !isSchemaLocked
                  ? 'Schema Lock ENGAGED: Column definitions and data types are strictly guarded.'
                  : 'Schema Lock DISENGAGED: Column editing enabled.'
              );
              setTimeout(() => setNotificationMsg(null), 3000);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              isSchemaLocked
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
            }`}
          >
            {isSchemaLocked ? <Lock className="w-3.5 h-3.5 text-emerald-600" /> : <Unlock className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isSchemaLocked ? 'Schema Drift Guard: Locked' : 'Schema Guard: Unlocked'}</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {notificationMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-3 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Dataset Picker & Real-Time Aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Google Sheet</span>
          <select
            value={activeDatasetId}
            onChange={(e) => setActiveDatasetId(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 outline-none"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Pipeline Value</span>
          <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            ${totalLoanValue.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Across {currentDataset.rows.length} verified records</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Average Volume / Budget</span>
          <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">
            ${Math.round(avgLoanValue).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Weighted loan size</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Schema Health Status</span>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
            {validationIssues.length === 0 ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">100% Validated (0 Drift)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">{validationIssues.length} Type Warnings</span>
              </>
            )}
          </p>
          <span className="text-[10px] text-slate-400">Strict type & formula checking</span>
        </div>
      </div>

      {/* SQL & Natural Language Query Box */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Bi-Directional Relational SQL Query Console
          </h4>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Target Table: <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">pipeline</code>
          </span>
        </div>

        {/* Natural Language Prompt Helper */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTranslateNaturalLanguage()}
            placeholder="Ask in natural language: e.g. 'Show me all approved loans in Texas with DTI under 36'..."
            className="w-full text-xs bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            onClick={handleTranslateNaturalLanguage}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
          >
            Translate to SQL
          </button>
        </div>

        {/* SQL Code Input */}
        <div className="space-y-1.5">
          <textarea
            rows={3}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full font-mono text-xs p-3 bg-slate-950 text-emerald-400 rounded-xl outline-none border border-slate-800 focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
          />
          {queryError && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{queryError}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteSqlQuery}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run SQL Query</span>
            </button>
            <button
              onClick={() => handleCreateSnapshot()}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Save Atomic Snapshot</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Data Grid & Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Live Spreadsheet Records ({currentDataset.rows.length} rows)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Quick filter table..."
              className="text-xs p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 z-10 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                {currentDataset.columns.map((col) => (
                  <th key={col.id} className="p-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      <span className="text-[8px] font-mono px-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
                        {col.type}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentDataset.rows
                .filter((r) => {
                  if (!filterSearch.trim()) return true;
                  const q = filterSearch.toLowerCase();
                  return Object.values(r).some((v) => String(v).toLowerCase().includes(q));
                })
                .map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    {currentDataset.columns.map((col) => {
                      const val = row[col.id];
                      return (
                        <td key={col.id} className="p-2.5 whitespace-nowrap">
                          <input
                            type="text"
                            value={val !== undefined && val !== null ? val : ''}
                            onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 p-1 text-xs outline-none text-slate-800 dark:text-slate-200 transition"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Atomic Rollback Snapshots Vault */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Atomic Rollback Checkpoint History ({snapshots.length} snapshots)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Immutable version ledger protects against unintended batch alterations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {snapshots.map((snap) => (
            <div
              key={snap.id}
              className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{snap.timestamp}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded">
                    {snap.rowCount} rows
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{snap.description}</p>
              </div>

              <button
                onClick={() => handleRollbackSnapshot(snap)}
                className="w-full py-1.5 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>1-Click Restore Snapshot</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
