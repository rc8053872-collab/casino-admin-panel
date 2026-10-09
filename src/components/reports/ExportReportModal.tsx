import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet, FileText, Download, CheckCircle2 } from 'lucide-react';
import { playerReportService } from '../../services/playerReportService';
import type { PlayerReportFilters } from '../../types/playerReport';
import { useToast } from '../../hooks/useToast';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PlayerReportFilters;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  filters,
}) => {
  const toast = useToast();
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await playerReportService.exportPlayerReport(selectedFormat, filters);
      toast.success(
        'Report Exported',
        `Successfully generated and prepared ${selectedFormat.toUpperCase()} report.`
      );
      onClose();
    } catch {
      toast.error('Export Failed', 'Unable to compile report document. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 p-6 space-y-5"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Export Player Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download player cohorts, retention metrics, and activity logs.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Format Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-700 block">Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('csv')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedFormat === 'csv'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <FileSpreadsheet
                      className={`w-5 h-5 ${
                        selectedFormat === 'csv' ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    {selectedFormat === 'csv' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="font-bold text-xs text-slate-900">CSV Spreadsheet</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Full player ledger dataset
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFormat('pdf')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedFormat === 'pdf'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <FileText
                      className={`w-5 h-5 ${
                        selectedFormat === 'pdf' ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    {selectedFormat === 'pdf' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="font-bold text-xs text-slate-900">PDF Summary</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Executive visual printout
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Scope Summary */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="font-semibold text-slate-700">Report Scope Details</div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Time Period:</span>
                <span className="font-medium text-slate-800 uppercase font-mono">
                  {filters.period}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Segments Included:</span>
                <span className="font-medium text-slate-800 capitalize">
                  {filters.segment || 'All Segments'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Generating...' : `Export ${selectedFormat.toUpperCase()}`}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExportReportModal;
