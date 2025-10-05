import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const ManualCheckModal = ({ isOpen, onClose, onConfirm, passengerName, seatNumber }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error confirming manual check:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Manual Check-in</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <CheckCircle className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Passenger: {passengerName}</p>
              <p className="text-sm text-gray-600">Seat: {seatNumber}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Manual Check-in Required</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This passenger needs manual verification. Please confirm their identity and boarding.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Confirm Check-in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualCheckModal;
