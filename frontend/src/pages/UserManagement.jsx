// src/pages/UserManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  CheckCircle,
  UserCheck,
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// Validation utility functions
const validationUtils = {
  // Check if username is available
  checkUsername: async (username) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/check-username?username=${username}`
      );
      return response.data.available;
    } catch (error) {
      console.error('Username check failed:', error);
      return false;
    }
  },

  // Check if email is available and valid
  checkEmail: async (email) => {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { available: false, valid: false, message: 'Invalid email format' };
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/check-email?email=${email}`
      );
      return { 
        available: response.data.available, 
        valid: true, 
        message: response.data.available ? 'Email is available' : 'Email already exists'
      };
    } catch (error) {
      console.error('Email check failed:', error);
      return { available: false, valid: false, message: 'Email check failed' };
    }
  },

  // Check if NIC is valid (12 digits for new NIC)
  validateNIC: (nic) => {
    const nicRegex = /^[0-9]{12}$/;
    return nicRegex.test(nic);
  },

  // Check if phone number is valid (Sri Lankan format)
  validatePhone: (phone) => {
    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  },

  // Check password strength
  validatePassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  },

  // Check if license number is valid (alphanumeric, 6-15 characters)
  validateLicenseNumber: (licenseNumber) => {
    const licenseRegex = /^[A-Z0-9]{6,15}$/;
    return licenseRegex.test(licenseNumber);
  },

  // Check if employee ID is unique (placeholder - implement backend endpoint)
  checkEmployeeId: async (employeeId) => {
    try {
      // This would require a backend endpoint to check employee ID uniqueness
      // For now, we'll check locally against existing staff profiles
      return true;
    } catch (error) {
      console.error('Employee ID check failed:', error);
      return false;
    }
  }
};

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const s = typeof status === "boolean" ? (status ? "Active" : "Inactive") : status;
  const colors = {
    active: "bg-green-900/30 text-green-400",
    inactive: "bg-red-900/30 text-red-400",
    admin: "bg-yellow-900/30 text-yellow-300",
    driver: "bg-indigo-900/30 text-indigo-300",
    staff: "bg-teal-900/30 text-teal-300",
    passenger: "bg-gray-900/30 text-gray-300",
  };
  const cls = colors[(s || "").toLowerCase()] || "bg-slate-700 text-slate-300";
  return <span className={`px-2 py-1 text-xs rounded ${cls}`}>{s}</span>;
};

// UserAvatar Component
const UserAvatar = ({ src, name, className = "" }) => {
  if (!src) {
    return (
      <div
        className={`bg-blue-600 rounded-full flex items-center justify-center text-white font-medium ${className}`}
      >
        {name ? name.charAt(0).toUpperCase() : "U"}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className={`rounded-full object-cover ${className}`}
    />
  );
};

// Modal Component
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto pt-12">
    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    <div className="relative bg-slate-800 border border-slate-600 rounded-xl p-6 z-60 w-full max-w-4xl shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div>{children}</div>
    </div>
  </div>
);

// DataTable Component
const DataTable = ({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
  expandable = true,
}) => {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              {expandable && <th className="w-10 px-4 py-3"></th>}
              {columns.map((c, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  {c.label}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={columns.length + 2} className="p-6">
                      <div className="bg-gray-700 h-4 w-1/2 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="p-6 text-center text-slate-400"
                >
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <React.Fragment key={row._id || row.id || idx}>
                  <tr className="hover:bg-slate-700/30 transition-colors duration-200">
                    {expandable && (
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggle(row._id || row.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {expanded[row._id || row.id] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((c, i) => (
                      <td
                        key={i}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-200"
                      >
                        {c.render
                          ? c.render(row[c.key], row)
                          : row[c.key] ?? ""}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandable && expanded[row._id || row.id] && (
                    <tr className="bg-slate-750/50">
                      <td
                        colSpan={columns.length + 2}
                        className="px-4 py-4 text-sm text-slate-300"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">Email:</span>{" "}
                            {row.email}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span>{" "}
                            {row.phone || "—"}
                          </div>
                          <div>
                            <span className="font-medium">NIC:</span>{" "}
                            {row.nic || "—"}
                          </div>
                          <div>
                            <span className="font-medium">Joined:</span>{" "}
                            {row.createdAt
                              ? new Date(row.createdAt).toLocaleString()
                              : "—"}
                          </div>
                          {row.driverProfile && (
                            <div>
                              <span className="font-medium">License:</span>{" "}
                              {row.driverProfile.licenseNumber}
                            </div>
                          )}
                          {row.staffProfile && (
                            <div>
                              <span className="font-medium">Employee ID:</span>{" "}
                              {row.staffProfile.employeeId}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ValidationMessages Component
const ValidationMessages = ({ validation, field }) => {
  if (!validation[field]?.checked) return null;

  const getMessage = () => {
    switch (field) {
      case 'username':
        return validation.username.available ? 
          <p className="text-green-400">✓ Username available</p> : 
          <p className="text-red-400">✗ Username already taken</p>;
      
      case 'email':
        if (!validation.email.valid) {
          return <p className="text-red-400">✗ {validation.email.message}</p>;
        }
        return validation.email.available ? 
          <p className="text-green-400">✓ Email available</p> : 
          <p className="text-red-400">✗ Email already registered</p>;
      
      case 'password':
        return (
          <div className="text-xs">
            <p className={validation.password.isValid ? "text-green-400" : "text-red-400"}>
              {validation.password.isValid ? "✓ Strong password" : "✗ Weak password"}
            </p>
            {!validation.password.isValid && (
              <div className="grid grid-cols-2 gap-1 mt-1">
                <span className={validation.password.requirements.minLength ? "text-green-400" : "text-red-400"}>
                  • 8+ chars
                </span>
                <span className={validation.password.requirements.hasUpperCase ? "text-green-400" : "text-red-400"}>
                  • A-Z
                </span>
                <span className={validation.password.requirements.hasLowerCase ? "text-green-400" : "text-red-400"}>
                  • a-z
                </span>
                <span className={validation.password.requirements.hasNumbers ? "text-green-400" : "text-red-400"}>
                  • 0-9
                </span>
                <span className={validation.password.requirements.hasSpecialChar ? "text-green-400" : "text-red-400"}>
                  • !@#$
                </span>
              </div>
            )}
          </div>
        );
      
      case 'nic':
        return validation.nic.isValid ? 
          <p className="text-green-400">✓ Valid NIC</p> : 
          <p className="text-red-400">✗ NIC must be 12 digits</p>;
      
      case 'phone':
        return validation.phone.isValid ? 
          <p className="text-green-400">✓ Valid phone number</p> : 
          <p className="text-red-400">✗ Invalid Sri Lankan number</p>;
      
      case 'licenseNumber':
        return validation.licenseNumber.isValid ? 
          <p className="text-green-400">✓ Valid license number</p> : 
          <p className="text-red-400">✗ 6-15 alphanumeric characters required</p>;
      
      case 'employeeId':
        return validation.employeeId.isValid ? 
          <p className="text-green-400">✓ Employee ID available</p> : 
          <p className="text-red-400">✗ Employee ID already taken</p>;
      
      default:
        return null;
    }
  };

  return <div className="mt-1 text-xs">{getMessage()}</div>;
};

// FormField Component
const FormField = ({ field, placeholder, type = "text", value, onChange, validation, ...props }) => (
  <div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors w-full ${
        validation[field]?.checked 
          ? (validation[field]?.isValid ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500')
          : 'border-slate-600 focus:ring-blue-500'
      }`}
      {...props}
    />
    <ValidationMessages validation={validation} field={field} />
  </div>
);

// Main Component
const UserManagement = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals & form state
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const initialForm = {
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    nic: "",
    address: "",
    licenseNumber: "",
    licenseExpiry: "",
    emergencyContact: "",
    staffRole: "",
    employeeId: "",
  };

  const initialValidation = {
    username: { available: false, checked: false },
    email: { available: false, valid: false, checked: false, message: '' },
    password: { isValid: false, checked: false, requirements: {} },
    nic: { isValid: false, checked: false },
    phone: { isValid: false, checked: false },
    licenseNumber: { isValid: false, checked: false },
    employeeId: { isValid: false, checked: false },
  };

  const [form, setForm] = useState(initialForm);
  const [validation, setValidation] = useState(initialValidation);

  // Debounced validation functions
  useEffect(() => {
    const validateUsername = async () => {
      if (form.username.length >= 3) {
        const isAvailable = await validationUtils.checkUsername(form.username);
        setValidation(prev => ({
          ...prev,
          username: { available: isAvailable, checked: true }
        }));
      } else {
        setValidation(prev => ({
          ...prev,
          username: { available: false, checked: false }
        }));
      }
    };

    const timeoutId = setTimeout(validateUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [form.username]);

  useEffect(() => {
    const validateEmail = async () => {
      if (form.email.length >= 5) {
        const result = await validationUtils.checkEmail(form.email);
        setValidation(prev => ({
          ...prev,
          email: { ...result, checked: true }
        }));
      } else {
        setValidation(prev => ({
          ...prev,
          email: { available: false, valid: false, checked: false, message: '' }
        }));
      }
    };

    const timeoutId = setTimeout(validateEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [form.email]);

  useEffect(() => {
    if (form.password) {
      const passwordValidation = validationUtils.validatePassword(form.password);
      setValidation(prev => ({
        ...prev,
        password: { ...passwordValidation, checked: true }
      }));
    } else {
      setValidation(prev => ({
        ...prev,
        password: { isValid: false, checked: false, requirements: {} }
      }));
    }
  }, [form.password]);

  useEffect(() => {
    setValidation(prev => ({
      ...prev,
      nic: { 
        isValid: validationUtils.validateNIC(form.nic), 
        checked: form.nic.length > 0 
      }
    }));
  }, [form.nic]);

  useEffect(() => {
    setValidation(prev => ({
      ...prev,
      phone: { 
        isValid: validationUtils.validatePhone(form.phone), 
        checked: form.phone.length > 0 
      }
    }));
  }, [form.phone]);

  useEffect(() => {
    setValidation(prev => ({
      ...prev,
      licenseNumber: { 
        isValid: validationUtils.validateLicenseNumber(form.licenseNumber), 
        checked: form.licenseNumber.length > 0 
      }
    }));
  }, [form.licenseNumber]);

  useEffect(() => {
    const validateEmployeeId = async () => {
      if (form.employeeId.length >= 2) {
        const isAvailable = await validationUtils.checkEmployeeId(form.employeeId);
        setValidation(prev => ({
          ...prev,
          employeeId: { isValid: isAvailable, checked: true }
        }));
      } else {
        setValidation(prev => ({
          ...prev,
          employeeId: { isValid: false, checked: false }
        }));
      }
    };

    const timeoutId = setTimeout(validateEmployeeId, 500);
    return () => clearTimeout(timeoutId);
  }, [form.employeeId]);

  const resetValidation = () => {
    setValidation(initialValidation);
  };

  const isFormValid = (role) => {
    const baseValid = 
      validation.username.available &&
      validation.email.available &&
      validation.email.valid &&
      validation.password.isValid &&
      validation.nic.isValid &&
      validation.phone.isValid;

    if (role === 'driver') {
      return baseValid && validation.licenseNumber.isValid && form.licenseExpiry;
    } else if (role === 'staff') {
      return baseValid && validation.employeeId.isValid && form.staffRole;
    }
    return baseValid;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users`
      );
      setUsers(res.data || []);
    } catch (err) {
      console.error("fetchUsers error", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.firstName && u.firstName.toLowerCase().includes(q)) ||
      (u.lastName && u.lastName.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const deactivateUser = async (u) => {
    if (!window.confirm(`Deactivate ${u.firstName || u.username}?`)) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${u._id || u.id}`
      );
      setUsers((prev) =>
        prev.map((p) =>
          p._id === (u._id || u.id) ? { ...p, isActive: false } : p
        )
      );
      toast.success("User deactivated successfully");
    } catch (err) {
      console.error("deactivate error", err);
      toast.error(err.response?.data?.message || "Failed to deactivate user");
    }
  };

  const createUser = async (role) => {
    setCreateError(null);
    
    if (!isFormValid(role)) {
      setCreateError("Please fix all validation errors before submitting.");
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
      role,
    };

    if (role === "driver") {
      payload.licenseNumber = form.licenseNumber;
      payload.licenseExpiry = form.licenseExpiry;
      payload.emergencyContact = form.emergencyContact;
    } else {
      payload.staffRole = form.staffRole;
      payload.employeeId = form.employeeId;
    }

    setCreating(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/admin/register`,
        payload
      );
      const created = res.data.user || res.data;
      setUsers((prev) => [created, ...prev]);
      setForm(initialForm);
      resetValidation();
      setShowDriverModal(false);
      setShowStaffModal(false);

      toast.success(
        `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`
      );
    } catch (err) {
      console.error("createUser error", err);
      setCreateError(err.response?.data?.message || "Failed to create user");
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const counts = users.reduce(
    (acc, u) => {
      acc.total += 1;
      const r = (u.role || "passenger").toLowerCase();
      acc.roles[r] = (acc.roles[r] || 0) + 1;
      return acc;
    },
    { total: 0, roles: {} }
  );

  const userColumns = [
    {
      key: "name",
      label: "Name",
      render: (_, row) => (
        <div className="flex items-center">
          <UserAvatar
            src={row.avatar}
            name={`${row.firstName || ""} ${row.lastName || ""}`}
            className="w-8 h-8 mr-3"
          />
          <div>
            <div className="font-medium text-white">
              {`${row.firstName || ""} ${row.lastName || ""}`.trim() ||
                row.username}
            </div>
            <div className="text-xs text-slate-400">
              ID: {row._id || row.id}
            </div>
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "isActive",
      label: "Status",
      render: (val) => <StatusBadge status={val ? "active" : "inactive"} />,
    },
    {
      key: "createdAt",
      label: "Join Date",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "—"),
    },
  ];

  const exportCSV = (list) => {
    if (!list || list.length === 0) {
      alert("No data to export");
      return;
    }
    const rows = list.map((u) => ({
      id: u._id || u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
    }));
    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v || "")}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Total Users</p>
              <h3 className="text-2xl text-white">{users.length}</h3>
            </div>
            <Users className="w-8 h-8 text-slate-300" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Drivers</p>
              <h3 className="text-2xl text-white">
                {users.filter((u) => u.role === "driver").length}
              </h3>
            </div>
            <UserCheck className="w-8 h-8 text-slate-300" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Staff</p>
              <h3 className="text-2xl text-white">
                {users.filter((u) => u.role === "staff").length}
              </h3>
            </div>
            <Settings className="w-8 h-8 text-slate-300" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Passengers</p>
              <h3 className="text-2xl text-white">
                {users.filter((u) => u.role === "passenger").length}
              </h3>
            </div>
            <Users className="w-8 h-8 text-slate-300" />
          </div>
        </div>
      </div>

      {/* Controls + Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg w-full"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-700 text-white px-3 py-2 rounded-lg"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="driver">Driver</option>
              <option value="staff">Staff</option>
              <option value="passenger">Passenger</option>
            </select>

            <button
              onClick={() => exportCSV(filteredUsers)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          <DataTable
            data={filteredUsers}
            columns={userColumns}
            onDelete={deactivateUser}
            loading={loadingUsers}
            expandable={true}
          />
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => setShowDriverModal(true)}
              className="flex items-center justify-between px-4 py-3 bg-teal-900/10 rounded hover:bg-teal-900/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-teal-300" />
                <span className="text-sm text-teal-300">Add Driver</span>
              </div>
            </button>

            <button
              onClick={() => setShowStaffModal(true)}
              className="flex items-center justify-between px-4 py-3 bg-pink-900/10 rounded hover:bg-pink-900/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-pink-300" />
                <span className="text-sm text-pink-300">Add Staff</span>
              </div>
            </button>

            <button
              onClick={() => exportCSV(users)}
              className="flex items-center justify-between px-4 py-3 bg-blue-900/10 rounded hover:bg-blue-900/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-slate-300" />
                <span className="text-sm text-slate-300">Export All</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Add Driver Modal */}
      {showDriverModal && (
        <Modal
          title="Add Driver"
          onClose={() => {
            setShowDriverModal(false);
            setForm(initialForm);
            resetValidation();
            setCreateError(null);
          }}
        >
          {createError && (
            <div className="text-red-400 mb-4 p-3 bg-red-900/20 rounded-lg">{createError}</div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              field="username"
              placeholder="Username *"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="email"
              placeholder="Email *"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="password"
              placeholder="Password *"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="firstName"
              placeholder="First Name *"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="lastName"
              placeholder="Last Name *"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="nic"
              placeholder="NIC * (12 digits)"
              value={form.nic}
              onChange={(e) => setForm({ ...form, nic: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="phone"
              placeholder="Phone * (07XXXXXXXX)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="address"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="licenseNumber"
              placeholder="License Number *"
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              validation={validation}
            />
            
            <div>
              <input
                type="date"
                placeholder="License Expiry *"
                value={form.licenseExpiry}
                onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full"
              />
              {!form.licenseExpiry && (
                <p className="text-red-400 text-xs mt-1">✗ License expiry is required</p>
              )}
            </div>
            
            <FormField
              field="emergencyContact"
              placeholder="Emergency Contact"
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              validation={validation}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowDriverModal(false);
                setForm(initialForm);
                resetValidation();
                setCreateError(null);
              }}
              className="px-4 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => createUser("driver")}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center ${
                isFormValid("driver") && !creating
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
              disabled={!isFormValid("driver") || creating}
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Driver"
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Staff Modal */}
      {showStaffModal && (
        <Modal
          title="Add Staff"
          onClose={() => {
            setShowStaffModal(false);
            setForm(initialForm);
            resetValidation();
            setCreateError(null);
          }}
        >
          {createError && (
            <div className="text-red-400 mb-4 p-3 bg-red-900/20 rounded-lg">{createError}</div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              field="username"
              placeholder="Username *"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="email"
              placeholder="Email *"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="password"
              placeholder="Password *"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="firstName"
              placeholder="First Name *"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="lastName"
              placeholder="Last Name *"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="nic"
              placeholder="NIC * (12 digits)"
              value={form.nic}
              onChange={(e) => setForm({ ...form, nic: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="phone"
              placeholder="Phone * (07XXXXXXXX)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              validation={validation}
            />
            
            <FormField
              field="address"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              validation={validation}
            />
            
            <div>
              <input
                placeholder="Staff Role *"
                value={form.staffRole}
                onChange={(e) => setForm({ ...form, staffRole: e.target.value })}
                className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full"
              />
              {!form.staffRole && (
                <p className="text-red-400 text-xs mt-1">✗ Staff role is required</p>
              )}
            </div>
            
            <FormField
              field="employeeId"
              placeholder="Employee ID *"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              validation={validation}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowStaffModal(false);
                setForm(initialForm);
                resetValidation();
                setCreateError(null);
              }}
              className="px-4 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => createUser("staff")}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center ${
                isFormValid("staff") && !creating
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
              disabled={!isFormValid("staff") || creating}
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Staff"
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;