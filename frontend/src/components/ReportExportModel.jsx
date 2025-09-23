// src/components/ReportExportModal.jsx
import React from "react";
import { X, FileText, Calendar, Download } from "lucide-react";

const ReportExportModal = ({
  show,
  onClose,
  format,
  setFormat,
  itemCount,
  onExport,
  loading,
  title = "Export Report"
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-screen px-4 z-50 relative">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat("csv")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    format === "csv"
                      ? "border-green-500 bg-green-900/20 text-green-400"
                      : "border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <span className="font-medium">CSV (.csv)</span>
                  <p className="text-xs mt-1">For spreadsheets</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("pdf")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    format === "pdf"
                      ? "border-red-500 bg-red-900/20 text-red-400"
                      : "border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <span className="font-medium">PDF (.pdf)</span>
                  <p className="text-xs mt-1">For printing</p>
                </button>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center text-sm text-slate-300">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Report will include {itemCount} records</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Generated on {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={onExport}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportExportModal;
