import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Company.css";

export default function CompanySetup({ onCompanyCreated }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    description: "",
    industry: "",
    state: "",
    employees: 1,
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // For now, we'll save without logo upload (will add Firebase Storage in next step)
      const response = await axios.post(
        "http://localhost:3000/api/v1/company",
        {
          ...formData,
          createdBy: localStorage.getItem("uid"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        localStorage.setItem("companyId", response.data.companyId);
        onCompanyCreated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-container">
      <div className="company-form">
        <h1>Setup Your Company Profile</h1>
        <p className="subtitle">Let'"'"'s get to know your business</p>

        <form onSubmit={handleSubmit}>
          {/* Logo Upload */}
          <div className="form-group logo-upload">
            <label>Company Logo</label>
            <div className="logo-preview-area">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="logo-preview" />
              ) : (
                <div className="logo-placeholder">
                  <p>📸 Upload Logo</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="file-input"
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., KIRA Senang"
              required
            />
          </div>

          {/* Company Email */}
          <div className="form-group">
            <label>Company Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="company@example.com"
              required
            />
          </div>

          {/* Website */}
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tell us about your business..."
              rows="3"
            />
          </div>

          {/* Industry */}
          <div className="form-group">
            <label>Industry *</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              required
            >
              <option value="">Select industry</option>
              <option value="Technology">Technology</option>
              <option value="Marketing">Marketing</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Services">Services</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* State */}
          <div className="form-group">
            <label>State (Malaysia) *</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
            >
              <option value="">Select state</option>
              <option value="Selangor">Selangor</option>
              <option value="Kuala Lumpur">Kuala Lumpur</option>
              <option value="Johor">Johor</option>
              <option value="Penang">Penang</option>
              <option value="Perak">Perak</option>
              <option value="Kedah">Kedah</option>
              <option value="Kelantan">Kelantan</option>
              <option value="Terengganu">Terengganu</option>
              <option value="Pahang">Pahang</option>
              <option value="Negeri Sembilan">Negeri Sembilan</option>
              <option value="Malacca">Malacca</option>
              <option value="Sarawak">Sarawak</option>
              <option value="Sabah">Sabah</option>
            </select>
          </div>

          {/* Employees */}
          <div className="form-group">
            <label>Number of Employees</label>
            <input
              type="number"
              name="employees"
              value={formData.employees}
              onChange={handleInputChange}
              min="1"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating profile..." : "Create Company Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
