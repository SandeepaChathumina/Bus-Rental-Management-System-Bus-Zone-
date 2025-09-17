// src/pages/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserCheck,
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

/*
  UserManagement.jsx
  - Fetches users from backend: GET `${VITE_BACKEND_URL}/api/users`
  - Deactivate user: DELETE `${VITE_BACKEND_URL}/api/users/:id` (matches your backend)
  - Create driver/staff: POST `${VITE_BACKEND_URL}/api/users/admin/register` with role
  - Total Users modal: summary + full DataTable (search/filter inside modal)
  - Form/modals state are top-level (fixes cursor focus bug).
*/

// ---------- Helper components (top-level) ----------
const StatusBadge = ({ status }) => {
  const s = (typeof status === 'boolean') ? (status ? 'Active' : 'Inactive') : status;
  const colors = {
    active: 'bg-green-900/30 text-green-400',
    inactive: 'bg-red-900/30 text-red-400',
    admin: 'bg-yellow-900/30 text-yellow-300',
    driver: 'bg-indigo-900/30 text-indigo-300',
    staff: 'bg-teal-900/30 text-teal-300',
    passenger: 'bg-gray-900/30 text-gray-300',
  };
  const cls = colors[(s || '').toLowerCase()] || 'bg-slate-700 text-slate-300';
  return <span className={`px-2 py-1 text-xs rounded ${cls}`}>{s}</span>;
};

const UserAvatar = ({ src, name, className = '' }) => {
  if (!src) {
    return <div className={`bg-blue-600 rounded-full flex items-center justify-center text-white font-medium ${className}`}>{name ? name.charAt(0).toUpperCase() : 'U'}</div>;
  }
  return <img src={src} alt={name} className={`rounded-full object-cover ${className}`} />;
};

// Simple Modal wrapper (no portal)
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto pt-12">
    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 z-60 w-full max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
      </div>
      <div>{children}</div>
    </div>
  </div>
);

// DataTable component (re-usable)
const DataTable = ({ data = [], columns = [], onEdit, onDelete, onView, loading = false, expandable = true }) => {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              {expandable && <th className="w-10 px-4 py-3"></th>}
              {columns.map((c, i) => <th key={i} className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{c.label}</th>)}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              Array(5).fill(0).map((_, idx) => (
                <tr key={idx}><td colSpan={columns.length + 2} className="p-6"><div className="bg-gray-700 h-4 w-1/2 rounded animate-pulse" /></td></tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length + 2} className="p-6 text-center text-slate-400">No records found</td></tr>
            ) : data.map((row, idx) => (
              <React.Fragment key={row._id || row.id || idx}>
                <tr className="hover:bg-slate-700/30 transition-colors duration-200">
                  {expandable && (
                    <td className="px-4 py-4">
                      <button onClick={() => toggle(row._id || row.id)} className="text-slate-400 hover:text-white">
                        {expanded[row._id || row.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                  )}
                  {columns.map((c, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                      {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '')}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {onView && <button onClick={() => onView(row)} className="text-blue-400 hover:text-blue-300"><Eye className="w-4 h-4" /></button>}
                      {onEdit && <button onClick={() => onEdit(row)} className="text-indigo-400 hover:text-indigo-300"><Edit className="w-4 h-4" /></button>}
                      {onDelete && <button onClick={() => onDelete(row)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
                {expandable && expanded[row._id || row.id] && (
                  <tr className="bg-slate-750/50">
                    <td colSpan={columns.length + 2} className="px-4 py-4 text-sm text-slate-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div><span className="font-medium">Email:</span> {row.email}</div>
                        <div><span className="font-medium">Phone:</span> {row.phone || '—'}</div>
                        <div><span className="font-medium">NIC:</span> {row.nic || '—'}</div>
                        <div><span className="font-medium">Joined:</span> {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</div>
                        {row.driverProfile && <div><span className="font-medium">License:</span> {row.driverProfile.licenseNumber}</div>}
                        {row.staffProfile && <div><span className="font-medium">Employee ID:</span> {row.staffProfile.employeeId}</div>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------- Main Page Component ----------
const UserManagement = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals & form state (top-level — fixes focus/cursor bug)
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const initialForm = {
    username: '', email: '', password: '',
    firstName: '', lastName: '', phone: '', nic: '', address: '',
    licenseNumber: '', licenseExpiry: '', emergencyContact: '',
    staffRole: '', employeeId: ''
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`);
      setUsers(res.data || []);
    } catch (err) {
      console.error('fetchUsers error', err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // filter + search
  const filteredUsers = users.filter(u => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || (
      (u.firstName && u.firstName.toLowerCase().includes(q)) ||
      (u.lastName && u.lastName.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const deactivateUser = async (u) => {
    if (!window.confirm(`Deactivate ${u.firstName || u.username}?`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/${u._id || u.id}`);
      setUsers(prev => prev.map(p => (p._id === (u._id || u.id) ? { ...p, isActive: false } : p)));
    } catch (err) {
      console.error('deactivate error', err);
      alert(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const createUser = async (role) => {
    setCreateError(null);
    if (!form.username || !form.email || !form.password || !form.firstName || !form.lastName || !form.nic) {
      setCreateError('Please fill required fields.');
      return;
    }
    if (role === 'driver' && (!form.licenseNumber || !form.licenseExpiry)) {
      setCreateError('Driver requires license details.');
      return;
    }
    if (role === 'staff' && (!form.staffRole || !form.employeeId)) {
      setCreateError('Staff requires staff role & employee id.');
      return;
    }

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      nic: form.nic,
      address: form.address,
      role
    };
    if (role === 'driver') {
      payload.licenseNumber = form.licenseNumber;
      payload.licenseExpiry = form.licenseExpiry;
      payload.emergencyContact = form.emergencyContact;
    } else {
      payload.staffRole = form.staffRole;
      payload.employeeId = form.employeeId;
    }

    setCreating(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/admin/register`, payload);
      const created = res.data.user || res.data;
      setUsers(prev => [created, ...prev]);
      setForm(initialForm);
      setShowDriverModal(false);
      setShowStaffModal(false);
    } catch (err) {
      console.error('createUser error', err);
      setCreateError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  // counts for summary
  const counts = users.reduce((acc, u) => {
    acc.total += 1;
    const r = (u.role || 'passenger').toLowerCase();
    acc.roles[r] = (acc.roles[r] || 0) + 1;
    return acc;
  }, { total: 0, roles: {} });

  // columns for table
  const userColumns = [
    { key: 'name', label: 'Name', render: (_, row) => (
      <div className="flex items-center">
        <UserAvatar src={row.avatar} name={`${row.firstName || ''} ${row.lastName || ''}`} className="w-8 h-8 mr-3" />
        <div>
          <div className="font-medium text-white">{`${row.firstName || ''} ${row.lastName || ''}`.trim() || row.username}</div>
          <div className="text-xs text-slate-400">ID: {row._id || row.id}</div>
        </div>
      </div>
    )},
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (val) => <StatusBadge status={val} /> },
    { key: 'isActive', label: 'Status', render: (val) => <StatusBadge status={val ? 'active' : 'inactive'} /> },
    { key: 'createdAt', label: 'Join Date', render: (val) => val ? new Date(val).toLocaleDateString() : '—' }
  ];

  // export CSV of provided list
  const exportCSV = (list) => {
    if (!list || list.length === 0) { alert('No data to export'); return; }
    const rows = list.map(u => ({
      id: u._id || u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      isActive: u.isActive
    }));
    const csv = [
      Object.keys(rows[0]).join(','),
      ...rows.map(r => Object.values(r).map(v => `"${String(v || '')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top stat + Total Users card — removed click here (user requested non-clickable in this page) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Total Users</p>
              <h3 className="text-2xl text-white">{users.length}</h3>
              {/* removed "Click to view details" and onClick per request */}
            </div>
            <Users className="w-8 h-8 text-slate-300" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Drivers</p>
              <h3 className="text-2xl text-white">{users.filter(u => u.role === 'driver').length}</h3>
            </div>
            <UserCheck className="w-8 h-8 text-slate-300" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Staff</p>
              <h3 className="text-2xl text-white">{users.filter(u => u.role === 'staff').length}</h3>
            </div>
            <Settings className="w-8 h-8 text-slate-300" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Passengers</p>
              <h3 className="text-2xl text-white">{users.filter(u => u.role === 'passenger').length}</h3>
            </div>
            <Users className="w-8 h-8 text-slate-300" />
          </div>
        </div>
      </div>

      {/* Controls + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg" />
            </div>

            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-slate-700 text-white px-3 py-2 rounded-lg">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="driver">Driver</option>
              <option value="staff">Staff</option>
              <option value="passenger">Passenger</option>
            </select>

            <button onClick={() => exportCSV(filteredUsers)} className="ml-auto flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          <DataTable
            data={filteredUsers}
            columns={userColumns}
            onEdit={(u) => console.log('Edit', u)}
            onDelete={deactivateUser}
            onView={(u) => console.log('View', u)}
            loading={loadingUsers}
            expandable={true}
          />
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => setShowDriverModal(true)} className="flex items-center justify-between px-4 py-3 bg-teal-900/10 rounded">
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-teal-300" />
                <span className="text-sm text-teal-300">Add Driver</span>
              </div>
            </button>

            <button onClick={() => setShowStaffModal(true)} className="flex items-center justify-between px-4 py-3 bg-pink-900/10 rounded">
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-pink-300" />
                <span className="text-sm text-pink-300">Add Staff</span>
              </div>
            </button>

            <button onClick={() => exportCSV(users)} className="flex items-center justify-between px-4 py-3 bg-blue-900/10 rounded">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-slate-300" />
                <span className="text-sm text-slate-300">Export All</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Modals ---------- */}

      {/* Total Users Modal: summary + table (can still be opened by setShowTotalModal(true) if needed elsewhere) */}
      {showTotalModal && (
        <Modal title="All Users" onClose={() => setShowTotalModal(false)}>
          <div className="mb-4 text-slate-300">
            <div className="mb-2">Total users: <strong className="text-white">{counts.total}</strong></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-800 p-3 rounded"><div className="text-slate-400 text-sm">Passengers</div><div className="text-white font-medium">{counts.roles['passenger'] || 0}</div></div>
              <div className="bg-slate-800 p-3 rounded"><div className="text-slate-400 text-sm">Drivers</div><div className="text-white font-medium">{counts.roles['driver'] || 0}</div></div>
              <div className="bg-slate-800 p-3 rounded"><div className="text-slate-400 text-sm">Staff</div><div className="text-white font-medium">{counts.roles['staff'] || 0}</div></div>
              <div className="bg-slate-800 p-3 rounded"><div className="text-slate-400 text-sm">Admins</div><div className="text-white font-medium">{counts.roles['admin'] || 0}</div></div>
            </div>
          </div>

          <div className="mb-4">
            {/* search inside modal */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input placeholder="Search inside users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 bg-slate-700 rounded w-full" />
              </div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-slate-700 text-white px-3 py-2 rounded">
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="driver">Driver</option>
                <option value="staff">Staff</option>
                <option value="passenger">Passenger</option>
              </select>
              <button onClick={() => exportCSV(filteredUsers)} className="px-3 py-2 bg-green-600 rounded text-white flex items-center space-x-2"><Download className="w-4 h-4" /><span>Export</span></button>
            </div>

            <DataTable data={filteredUsers} columns={userColumns} onDelete={deactivateUser} loading={loadingUsers} expandable />
          </div>
        </Modal>
      )}

      {/* Add Driver Modal */}
      {showDriverModal && (
        <Modal title="Add Driver" onClose={() => { setShowDriverModal(false); setForm(initialForm); setCreateError(null); }}>
          {createError && <div className="text-red-400 mb-2">{createError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="NIC" value={form.nic} onChange={e => setForm({ ...form, nic: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="License Number" value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input type="date" placeholder="License Expiry" value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Emergency Contact" value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} className="p-2 bg-slate-800 rounded" />
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={() => { setShowDriverModal(false); setForm(initialForm); setCreateError(null); }} className="px-4 py-2 bg-slate-700 rounded">Cancel</button>
            <button onClick={() => createUser('driver')} className="px-4 py-2 bg-teal-600 rounded text-white" disabled={creating}>{creating ? 'Creating...' : 'Create Driver'}</button>
          </div>
        </Modal>
      )}

      {/* Add Staff Modal */}
      {showStaffModal && (
        <Modal title="Add Staff" onClose={() => { setShowStaffModal(false); setForm(initialForm); setCreateError(null); }}>
          {createError && <div className="text-red-400 mb-2">{createError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="NIC" value={form.nic} onChange={e => setForm({ ...form, nic: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Staff Role" value={form.staffRole} onChange={e => setForm({ ...form, staffRole: e.target.value })} className="p-2 bg-slate-800 rounded" />
            <input placeholder="Employee ID" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="p-2 bg-slate-800 rounded" />
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={() => { setShowStaffModal(false); setForm(initialForm); setCreateError(null); }} className="px-4 py-2 bg-slate-700 rounded">Cancel</button>
            <button onClick={() => createUser('staff')} className="px-4 py-2 bg-pink-600 rounded text-white" disabled={creating}>{creating ? 'Creating...' : 'Create Staff'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
