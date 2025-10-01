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
  FileText,
  Calendar,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


// Validation utility functions
const validationUtils = {
  // Check if username is available
  checkUsername: async (username) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/check-username?username=${username}`
      );
      return response.data.available;
    } catch (error) {
      console.error("Username check failed:", error);
      return false;
    }
  },

  // Check if email is available and valid
  checkEmail: async (email) => {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        available: false,
        valid: false,
        message: "Invalid email format",
      };
    }

    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/check-email?email=${email}`
      );
      return {
        available: response.data.available,
        valid: true,
        message: response.data.available
          ? "Email is available"
          : "Email already exists",
      };
    } catch (error) {
      console.error("Email check failed:", error);
      return { available: false, valid: false, message: "Email check failed" };
    }
  },

  // Check if phone number is available
  checkPhone: async (phone) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/check-phone?phone=${phone}`
      );
      return response.data.available;
    } catch (error) {
      console.error("Phone check failed:", error);
      return false;
    }
  },

  // Check if NIC is available
  checkNIC: async (nic) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/check-nic?nic=${nic}`
      );
      return response.data.available;
    } catch (error) {
      console.error("NIC check failed:", error);
      return false;
    }
  },

  // Check if NIC is valid (9 digits + V or 12 digits)
  validateNIC: (nic) => {
    const nicRegex = /^\d{9}[Vv]$|^\d{12}$/;
    return nicRegex.test(nic);
  },

  // Check if phone number is valid (must start with 0 and be exactly 10 digits)
  validatePhone: (phone) => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  },

  // Check password strength
  validatePassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
      },
    };
  },

  // Check if license number is valid (capital letter + 7 digits)
  validateLicenseNumber: (licenseNumber) => {
    const licenseRegex = /^[A-Z]\d{7}$/;
    return licenseRegex.test(licenseNumber.toUpperCase());
  },

  // --- Add to validationUtils ---
checkLicenseNumber: async (licenseNumber, users) => {
  try {
    const exists = users.some(
      (u) => u.driverProfile?.licenseNumber === licenseNumber
    );
    return !exists; // true if unique
  } catch (err) {
    console.error("License number check failed", err);
    return false;
  }
},


  // Check if employee ID format is valid (EMP + 3 digits)
  validateEmployeeId: (employeeId) => {
    const employeeIdRegex = /^EMP\d{3}$/;
    return employeeIdRegex.test(employeeId.toUpperCase());
  },

  // Check if employee ID is available
  checkEmployeeId: async (employeeId) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/check-employee-id?employeeId=${employeeId}`
      );
      return response.data.available;
    } catch (error) {
      console.error("Employee ID check failed:", error);
      return false;
    }
  },
};

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const s =
    typeof status === "boolean" ? (status ? "Active" : "Inactive") : status;
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
  onActivate, // Add this prop
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
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-indigo-400 hover:text-indigo-300"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && row.isActive !== false && (
                          <button
                            onClick={() => onDelete(row)}
                            className="text-red-400 hover:text-red-300"
                            title="Deactivate User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {onActivate && row.isActive === false && (
                          <button
                            onClick={() => onActivate(row)}
                            className="text-green-400 hover:text-green-300"
                            title="Activate User"
                          >
                            <CheckCircle className="w-4 h-4" />
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
      case "username":
        return validation.username.available ? (
          <p className="text-green-400">✓ Username available</p>
        ) : (
          <p className="text-red-400">✗ Username already taken</p>
        );

      case "email":
        if (!validation.email.valid) {
          return <p className="text-red-400">✗ {validation.email.message}</p>;
        }
        return validation.email.available ? (
          <p className="text-green-400">✓ Email available</p>
        ) : (
          <p className="text-red-400">✗ Email already registered</p>
        );

      case "password":
        return (
          <div className="text-xs">
            <p
              className={
                validation.password.isValid ? "text-green-400" : "text-red-400"
              }
            >
              {validation.password.isValid
                ? "✓ Strong password"
                : "✗ Weak password"}
            </p>
            {!validation.password.isValid && (
              <div className="grid grid-cols-2 gap-1 mt-1">
                <span
                  className={
                    validation.password.requirements.minLength
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  • 8+ chars
                </span>
                <span
                  className={
                    validation.password.requirements.hasUpperCase
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  • A-Z
                </span>
                <span
                  className={
                    validation.password.requirements.hasLowerCase
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  • a-z
                </span>
                <span
                  className={
                    validation.password.requirements.hasNumbers
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  • 0-9
                </span>
                <span
                  className={
                    validation.password.requirements.hasSpecialChar
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  • !@#$
                </span>
              </div>
            )}
          </div>
        );

      case "nic":
        if (!validation.nic.checked) {
          return <p className="text-slate-400 text-xs">Enter a valid NIC number</p>;
        }
        if (validation.nic.isValid && validation.nic.available) {
          return <p className="text-green-400">✓ NIC number available</p>;
        } else if (validation.nic.isValid && !validation.nic.available) {
          return <p className="text-red-400">✗ NIC number already exists</p>;
        } else {
          return <p className="text-red-400">✗ NIC must be 9 digits + V or 12 digits</p>;
        }

      case "phone":
        if (!validation.phone.checked) {
          return <p className="text-slate-400 text-xs">Enter a valid phone number</p>;
        }
        if (validation.phone.isValid && validation.phone.available) {
          return <p className="text-green-400">✓ Phone number available</p>;
        } else if (validation.phone.isValid && !validation.phone.available) {
          return <p className="text-red-400">✗ Phone number already exists</p>;
        } else {
          return <p className="text-red-400">✗ Must start with 0 and be exactly 10 digits</p>;
        }

      case "licenseNumber":
        return validation.licenseNumber.isValid ? (
          <p className="text-green-400">✓ Valid license format</p>
        ) : (
          <p className="text-red-400">
            ✗ Must be capital letter followed by 7 digits (e.g., B1234567)
          </p>
        );

      case "employeeId":
        if (!validation.employeeId.checked) {
          return <p className="text-slate-400 text-xs">Enter employee ID (EMP + 3 digits, e.g., EMP001)</p>;
        }
        if (validation.employeeId.isValid && validation.employeeId.available) {
          return <p className="text-green-400">✓ Employee ID available</p>;
        } else if (validation.employeeId.isValid && !validation.employeeId.available) {
          return <p className="text-red-400">✗ Employee ID already exists</p>;
        } else {
          return <p className="text-red-400">✗ Must be EMP followed by 3 digits (e.g., EMP001)</p>;
        }

      case "licenseExpiry":
        if (!validation.licenseExpiry.checked) {
          return <p className="text-slate-400 text-xs">Please select a future date</p>;
        }
        return validation.licenseExpiry.isValid ? (
          <p className="text-green-400">✓ Valid expiry date</p>
        ) : (
          <p className="text-red-400">✗ Please select a future date</p>
        );

      default:
        return null;
    }
  };

  return <div className="mt-1 text-xs">{getMessage()}</div>;
};

// FormField Component
const FormField = ({
  field,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  validation,
  ...props
}) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors w-full ${
        validation[field]?.checked
          ? (() => {
              // For fields with both isValid and available (phone, nic)
              if (validation[field]?.isValid !== undefined && validation[field]?.available !== undefined) {
                return validation[field]?.isValid && validation[field]?.available
                  ? "border-green-500 focus:ring-green-500"
                  : "border-red-500 focus:ring-red-500";
              }
              // For fields with only isValid (password, license, etc.)
              else if (validation[field]?.isValid !== undefined) {
                return validation[field]?.isValid
                  ? "border-green-500 focus:ring-green-500"
                  : "border-red-500 focus:ring-red-500";
              }
              // For fields with only available (username, email)
              else if (validation[field]?.available !== undefined) {
                return validation[field]?.available
                  ? "border-green-500 focus:ring-green-500"
                  : "border-red-500 focus:ring-red-500";
              }
              // Default to red if checked but no clear validation state
              return "border-red-500 focus:ring-red-500";
            })()
          : "border-slate-600 focus:ring-blue-500"
      }`}
      {...props}
    />
    <ValidationMessages validation={validation} field={field} />
  </div>
);

// ---------------------- Export Modal ----------------------
const ExportModal = ({ show, onClose, format, setFormat, itemCount, onExport, loading }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-slate-800 border border-slate-600 rounded-xl p-6 z-60 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Export Report</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setFormat("csv")}
            className={`p-3 border-2 rounded-lg ${
              format === "csv"
                ? "border-green-500 bg-green-900/20 text-green-400"
                : "border-slate-600 text-slate-400"
            }`}
          >
            <FileText className="w-6 h-6 mx-auto mb-1" /> CSV
          </button>
          <button
            onClick={() => setFormat("pdf")}
            className={`p-3 border-2 rounded-lg ${
              format === "pdf"
                ? "border-red-500 bg-red-900/20 text-red-400"
                : "border-slate-600 text-slate-400"
            }`}
          >
            <FileText className="w-6 h-6 mx-auto mb-1" /> PDF
          </button>
        </div>
        <div className="bg-slate-700/50 rounded p-2 text-sm text-slate-300 mb-4">
          <Calendar className="inline w-4 h-4 mr-1" /> Report will include {itemCount} users
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 text-slate-300 hover:text-white">
            Cancel
          </button>
          <button
            onClick={onExport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {loading ? "Generating..." : "Export Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const UserManagement = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportLoading, setExportLoading] = useState(false);
 
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
    emergencyContact: "0112323555",
    staffRole: "",
    employeeId: "",
  };

  const initialValidation = {
    username: { available: false, checked: false },
    email: { available: false, valid: false, checked: false, message: "" },
    password: { isValid: false, checked: false, requirements: {} },
    nic: { isValid: false, available: false, checked: false },
    phone: { isValid: false, available: false, checked: false },
    licenseNumber: { isValid: false, checked: false },
    licenseExpiry: { isValid: false, checked: false },
    employeeId: { isValid: false, available: false, checked: false },
  };

  const [form, setForm] = useState(initialForm);
  const [validation, setValidation] = useState(initialValidation);

  // Debounced validation functions
  useEffect(() => {
    const validateUsername = async () => {
      if (form.username.length >= 3) {
        const isAvailable = await validationUtils.checkUsername(form.username);
        setValidation((prev) => ({
          ...prev,
          username: { available: isAvailable, checked: true },
        }));
      } else {
        setValidation((prev) => ({
          ...prev,
          username: { available: false, checked: false },
        }));
      }
    };

    const timeoutId = setTimeout(validateUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [form.username]);

  useEffect(() => {
  const validateLicense = async () => {
    if (form.licenseNumber.length >= 3) {
      // First check format
      const isFormatValid = validationUtils.validateLicenseNumber(form.licenseNumber);
      if (isFormatValid) {
        // Then check availability
        const isAvailable = await validationUtils.checkLicenseNumber(
          form.licenseNumber,
          users
        );
        setValidation((prev) => ({
          ...prev,
          licenseNumber: { isValid: isAvailable, checked: true },
        }));
      } else {
        setValidation((prev) => ({
          ...prev,
          licenseNumber: { isValid: false, checked: true },
        }));
      }
    } else {
      setValidation((prev) => ({
        ...prev,
        licenseNumber: { isValid: false, checked: false },
      }));
    }
  };

  const timeoutId = setTimeout(validateLicense, 500);
  return () => clearTimeout(timeoutId);
}, [form.licenseNumber, users]);


  useEffect(() => {
    const validateEmail = async () => {
      if (form.email.length >= 5) {
        const result = await validationUtils.checkEmail(form.email);
        setValidation((prev) => ({
          ...prev,
          email: { ...result, checked: true },
        }));
      } else {
        setValidation((prev) => ({
          ...prev,
          email: {
            available: false,
            valid: false,
            checked: false,
            message: "",
          },
        }));
      }
    };

    const timeoutId = setTimeout(validateEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [form.email]);

  useEffect(() => {
    if (form.password) {
      const passwordValidation = validationUtils.validatePassword(
        form.password
      );
      setValidation((prev) => ({
        ...prev,
        password: { ...passwordValidation, checked: true },
      }));
    } else {
      setValidation((prev) => ({
        ...prev,
        password: { isValid: false, checked: false, requirements: {} },
      }));
    }
  }, [form.password]);

  useEffect(() => {
    const validateNIC = async () => {
      if (form.nic.length >= 9) {
        // First check format
        const isFormatValid = validationUtils.validateNIC(form.nic);
        if (isFormatValid) {
          // Then check availability
          const isAvailable = await validationUtils.checkNIC(form.nic);
          setValidation((prev) => ({
            ...prev,
            nic: {
              isValid: isAvailable,
              available: isAvailable,
              checked: true,
            },
          }));
        } else {
          setValidation((prev) => ({
            ...prev,
            nic: {
              isValid: false,
              available: false,
              checked: true,
            },
          }));
        }
      } else {
        setValidation((prev) => ({
          ...prev,
          nic: {
            isValid: false,
            available: false,
            checked: false,
          },
        }));
      }
    };

    const timeoutId = setTimeout(validateNIC, 500);
    return () => clearTimeout(timeoutId);
  }, [form.nic]);

  useEffect(() => {
    const validatePhone = async () => {
      if (form.phone.length >= 10) {
        // First check format
        const isFormatValid = validationUtils.validatePhone(form.phone);
        if (isFormatValid) {
          // Then check availability
          const isAvailable = await validationUtils.checkPhone(form.phone);
          setValidation((prev) => ({
            ...prev,
            phone: {
              isValid: isAvailable,
              available: isAvailable,
              checked: true,
            },
          }));
        } else {
          setValidation((prev) => ({
            ...prev,
            phone: {
              isValid: false,
              available: false,
              checked: true,
            },
          }));
        }
      } else {
        setValidation((prev) => ({
          ...prev,
          phone: {
            isValid: false,
            available: false,
            checked: false,
          },
        }));
      }
    };

    const timeoutId = setTimeout(validatePhone, 500);
    return () => clearTimeout(timeoutId);
  }, [form.phone]);

  useEffect(() => {
    if (form.licenseExpiry) {
      const today = new Date();
      const expiryDate = new Date(form.licenseExpiry);
      const isValid = expiryDate >= today;
      
      setValidation((prev) => ({
        ...prev,
        licenseExpiry: {
          isValid: isValid,
          checked: true,
        },
      }));
    } else {
      setValidation((prev) => ({
        ...prev,
        licenseExpiry: {
          isValid: false,
          checked: false,
        },
      }));
    }
  }, [form.licenseExpiry]);


  useEffect(() => {
    const validateEmployeeId = async () => {
      if (form.employeeId.length >= 6) {
        // First check format
        const isFormatValid = validationUtils.validateEmployeeId(form.employeeId);
        if (isFormatValid) {
          // Then check availability
          const isAvailable = await validationUtils.checkEmployeeId(form.employeeId);
          setValidation((prev) => ({
            ...prev,
            employeeId: { 
              isValid: isAvailable, 
              available: isAvailable, 
              checked: true 
            },
          }));
        } else {
          setValidation((prev) => ({
            ...prev,
            employeeId: { 
              isValid: false, 
              available: false, 
              checked: true 
            },
          }));
        }
      } else {
        setValidation((prev) => ({
          ...prev,
          employeeId: { 
            isValid: false, 
            available: false, 
            checked: false 
          },
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
    validation.nic.available &&
    validation.phone.isValid &&
    validation.phone.available;

  if (role === "driver") {
    return (
      baseValid &&
      validation.licenseNumber.isValid &&
      form.licenseNumber &&
      validation.licenseExpiry.isValid
    );
  } else if (role === "staff") {
    return (
      baseValid &&
      validation.employeeId.isValid &&
      validation.employeeId.available &&
      form.staffRole?.trim().length > 0
    );
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

  const [activatingId, setActivatingId] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  const activateUser = async (u) => {
    if (!window.confirm(`Activate ${u.firstName || u.username}?`)) return;
    setActivatingId(u._id);
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${
          u._id || u.id
        }/activate`
      );
      setUsers((prev) =>
        prev.map((p) =>
          p._id === (u._id || u.id) ? { ...p, isActive: true } : p
        )
      );
      toast.success("User activated successfully");
    } catch (err) {
      console.error("activate error", err);
      toast.error(err.response?.data?.message || "Failed to activate user");
    } finally {
      setActivatingId(null);
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
        `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully! ${
          role === "driver" ? "Login credentials have been sent to the driver's email." : ""
        }`
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
      toast.error("No data to export");
      return;
    }
    const rows = list.map((u) => ({
      id: u._id || u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      status: u.isActive ? "Active" : "Inactive",
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
    toast.success("CSV report generated!");
  };

  const exportPDF = (list) => {
    if (!list || list.length === 0) {
      toast.error("No data to export");
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table layout
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Add BusZone+ Header (without logo)
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.setFont(undefined, 'bold');
    doc.text('BusZone+', margin, margin + 10);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text('Premium Bus Rental Management System', margin, margin + 16);
    
    // Report title
    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('User Management Report', pageWidth / 2, margin + 25, { align: 'center' });
    
    // Report metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    const currentDate = new Date();
    doc.text(`Generated on: ${currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${currentDate.toLocaleTimeString()}`, pageWidth / 2, margin + 32, { align: 'center' });
    
    // Statistics section
    const statsY = margin + 40;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Report Summary', margin, statsY);
    
    // Calculate statistics
    const totalUsers = list.length;
    const activeUsers = list.filter(u => u.isActive !== false).length;
    const inactiveUsers = totalUsers - activeUsers;
    const drivers = list.filter(u => u.role === 'driver').length;
    const staff = list.filter(u => u.role === 'staff').length;
    const passengers = list.filter(u => u.role === 'passenger').length;
    const admins = list.filter(u => u.role === 'admin').length;
    
    // Statistics boxes - responsive layout
    const availableWidth = pageWidth - (margin * 2);
    const boxCount = 4;
    const boxSpacing = 8;
    const boxWidth = Math.min(35, (availableWidth - (boxSpacing * (boxCount - 1))) / boxCount);
    const boxHeight = 25;
    let currentX = margin;
    
    // Total Users box - Blue theme with white text
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(totalUsers.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Total Users', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Active Users box - Blue theme with white text
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(activeUsers.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Active Users', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Drivers box - Blue theme with white text
    doc.setFillColor(29, 78, 216);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(drivers.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Drivers', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    currentX += boxWidth + boxSpacing;
    
    // Staff box - Blue theme with white text
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(currentX, statsY + 8, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(staff.toString(), currentX + boxWidth/2, statsY + 18, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Staff', currentX + boxWidth/2, statsY + 25, { align: 'center' });
    
    // Role distribution table - moved to separate page to prevent overlap
    const roleTableY = statsY + 50;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Role Distribution', margin, roleTableY);
    
    const roleData = [
      ['Role', 'Count', 'Percentage'],
      ['Drivers', drivers.toString(), `${((drivers/totalUsers)*100).toFixed(1)}%`],
      ['Staff', staff.toString(), `${((staff/totalUsers)*100).toFixed(1)}%`],
      ['Passengers', passengers.toString(), `${((passengers/totalUsers)*100).toFixed(1)}%`],
      ['Admins', admins.toString(), `${((admins/totalUsers)*100).toFixed(1)}%`]
    ];
    
    autoTable(doc, {
      startY: roleTableY + 8,
      head: [roleData[0]],
      body: roleData.slice(1),
      styles: { 
        fontSize: 10, 
        cellPadding: 4,
        textColor: [30, 30, 30]
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        halign: 'center',
        fontStyle: 'bold'
      },
      alternateRowStyles: { 
        fillColor: [248, 250, 252] 
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' }
      },
      margin: { left: margin, right: margin }
    });

    // Add new page for user details table to prevent overlap
    doc.addPage();
    
    // Add header to second page
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.setFont(undefined, 'bold');
    doc.text('BusZone+', margin, margin + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text('Premium Bus Rental Management System', margin, margin + 16);
    
    // Main user data table - now on separate page
    const tableStartY = margin + 30;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('User Details', margin, tableStartY);
    
    // Prepare table data with responsive formatting
    const tableColumns = [
      { header: 'ID', dataKey: 'id', width: 20 },
      { header: 'Name', dataKey: 'name', width: 45 },
      { header: 'Email', dataKey: 'email', width: 55 },
      { header: 'Role', dataKey: 'role', width: 20 },
      { header: 'Status', dataKey: 'status', width: 20 },
      { header: 'Join Date', dataKey: 'joinDate', width: 25 }
    ];
    
    const tableRows = list.map((u, index) => ({
      id: (u._id || u.id).toString().substring(0, 6) + '...',
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim().substring(0, 20) || u.username?.substring(0, 15),
      email: u.email?.substring(0, 25) + (u.email?.length > 25 ? '...' : ''),
      role: u.role?.charAt(0).toUpperCase() + u.role?.slice(1) || 'N/A',
      status: u.isActive !== false ? 'Active' : 'Inactive',
      joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : 'N/A'
    }));

    autoTable(doc, {
      startY: tableStartY + 8,
      columns: tableColumns,
      body: tableRows,
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        textColor: [30, 30, 30],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        halign: 'center',
        fontStyle: 'bold',
        fontSize: 10
      },
      alternateRowStyles: { 
        fillColor: [248, 250, 252] 
      },
      columnStyles: {
        id: { halign: 'center', fontSize: 7, cellWidth: 20 },
        name: { halign: 'left', fontSize: 8, cellWidth: 45, overflow: 'linebreak' },
        email: { halign: 'left', fontSize: 7, cellWidth: 55, overflow: 'linebreak' },
        role: { halign: 'center', fontSize: 8, cellWidth: 20 },
        status: { halign: 'center', fontSize: 8, cellWidth: 20 },
        joinDate: { halign: 'center', fontSize: 7, cellWidth: 25 }
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      showHead: 'everyPage',
      didDrawPage: function (data) {
        // Add footer on each page
        const pageNumber = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${currentPage} of ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('BusZone+ User Management Report', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
    });

    // Add footer with company info
    const finalY = doc.lastAutoTable.finalY || pageHeight - 30;
    if (finalY < pageHeight - 40) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'normal');
      doc.text('This report was generated by BusZone+ Management System', pageWidth / 2, finalY + 20, { align: 'center' });
      doc.text('For support, contact: info@buszoneplus.com | +94 704 222 777', pageWidth / 2, finalY + 25, { align: 'center' });
    }

    // Save the PDF
    const fileName = `BusZone_UserReport_${currentDate.toISOString().split('T')[0]}_${Date.now()}.pdf`;
    doc.save(fileName);
    toast.success("PDF report generated successfully!");
  };


  const handleExport = () => {
    setExportLoading(true);
    try {
      if (exportFormat === "csv") exportCSV(filteredUsers);
      else exportPDF(filteredUsers);
    } finally {
      setExportLoading(false);
      setShowExportModal(false);
    }
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or username..."
                  className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Filter by Role
              </label>
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
            </div>

            <button
              onClick={() => setShowExportModal(true)}
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
            onActivate={activateUser}
            loading={loadingUsers}
            expandable={true}
          />
        </div>

         <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        format={exportFormat}
        setFormat={setExportFormat}
        itemCount={filteredUsers.length}
        onExport={handleExport}
        loading={exportLoading}
      />

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
            <div className="text-red-400 mb-4 p-3 bg-red-900/20 rounded-lg">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              field="username"
              label="Username"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              validation={validation}
            />

            <FormField
              field="email"
              label="Email Address"
              placeholder="Enter email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              validation={validation}
            />

            <FormField
              field="password"
              label="Password"
              placeholder="Enter password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              validation={validation}
            />

            <FormField
              field="firstName"
              label="First Name"
              placeholder="Enter first name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              validation={validation}
            />

            <FormField
              field="lastName"
              label="Last Name"
              placeholder="Enter last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              validation={validation}
            />

            <FormField
              field="nic"
              label="NIC Number"
              placeholder="Enter NIC number"
              value={form.nic}
              onChange={(e) => setForm({ ...form, nic: e.target.value })}
              validation={validation}
            />

            <FormField
              field="phone"
              label="Phone Number"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              validation={validation}
            />

            <FormField
              field="address"
              label="Address"
              placeholder="Enter address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              validation={validation}
            />

            <FormField
              field="licenseNumber"
              label="License Number"
              placeholder="Enter license number"
              value={form.licenseNumber}
              onChange={(e) => {
                // Auto-uppercase and limit to 8 characters
                // Allow only letters and digits, but ensure first character is a letter
                let value = e.target.value.toUpperCase();
                // Remove any non-alphanumeric characters
                value = value.replace(/[^A-Z0-9]/g, '');
                // Limit to 8 characters
                value = value.slice(0, 8);
                setForm({ ...form, licenseNumber: value });
              }}
              validation={validation}
            />

            <FormField
              field="licenseExpiry"
              label="License Expiry Date"
              placeholder="Select expiry date"
              type="date"
              value={form.licenseExpiry}
              min={new Date().toISOString().split("T")[0]} // disable past dates
              onChange={(e) =>
                setForm({ ...form, licenseExpiry: e.target.value })
              }
              validation={validation}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                placeholder="Emergency Contact"
                value={form.emergencyContact}
                readOnly
                className="p-3 bg-slate-600 border border-slate-500 rounded-lg text-slate-300 placeholder-slate-400 focus:outline-none w-full cursor-not-allowed"
              />
              <p className="text-slate-400 text-xs mt-1">
                Company emergency contact (cannot be changed)
              </p>
            </div>
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
            <div className="text-red-400 mb-4 p-3 bg-red-900/20 rounded-lg">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              field="username"
              label="Username"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              validation={validation}
            />

            <FormField
              field="email"
              label="Email Address"
              placeholder="Enter email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              validation={validation}
            />

            <FormField
              field="password"
              label="Password"
              placeholder="Enter password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              validation={validation}
            />

            <FormField
              field="firstName"
              label="First Name"
              placeholder="Enter first name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              validation={validation}
            />

            <FormField
              field="lastName"
              label="Last Name"
              placeholder="Enter last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              validation={validation}
            />

            <FormField
              field="nic"
              label="NIC Number"
              placeholder="Enter NIC number"
              value={form.nic}
              onChange={(e) => setForm({ ...form, nic: e.target.value })}
              validation={validation}
            />

            <FormField
              field="phone"
              label="Phone Number"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              validation={validation}
            />

            <FormField
              field="address"
              label="Address"
              placeholder="Enter address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              validation={validation}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Staff Role
              </label>
              <input
                placeholder="Enter staff role"
                value={form.staffRole}
                onChange={(e) =>
                  setForm({ ...form, staffRole: e.target.value })
                }
                className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full"
              />
              {!form.staffRole && (
                <p className="text-slate-400 text-xs mt-1">
                  Please enter the staff member's role (e.g., Manager, Supervisor, Clerk)
                </p>
              )}
            </div>

            <FormField
              field="employeeId"
              label="Employee ID"
              placeholder="Enter employee ID (e.g., EMP001)"
              value={form.employeeId}
              onChange={(e) => {
                // Auto-uppercase and limit to 6 characters (EMP + 3 digits)
                let value = e.target.value.toUpperCase();
                // Remove any non-alphanumeric characters except EMP prefix
                if (value.startsWith('EMP')) {
                  value = 'EMP' + value.slice(3).replace(/\D/g, '');
                } else {
                  value = value.replace(/[^A-Z0-9]/g, '');
                }
                // Limit to 6 characters
                value = value.slice(0, 6);
                setForm({ ...form, employeeId: value });
              }}
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
