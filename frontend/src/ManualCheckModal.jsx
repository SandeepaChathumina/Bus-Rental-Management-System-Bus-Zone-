import React, { useState } from 'react';
import { X, UserCheck, UserX } from 'lucide-react';

export const ManualCheckModal = ({ action, users, onSubmit, onCancel }) => {
  const [selectedUser, setSelectedUser] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }
    onSubmit(selectedUser);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            {action === 'check-in' ? (
              <>
                <UserCheck className="w-5 h-5 mr-2 text-green-400" />
                Manual Check-In
              </>
            ) : (
              <>
                <UserX className="w-5 h-5 mr-2 text-red-400" />
                Manual Check-Out
              </>
            )}
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
              required
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md ${
                action === 'check-in' 
                  ? 'bg-green-600 hover:bg-green-500' 
                  : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {action === 'check-in' ? 'Check In' : 'Check Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};