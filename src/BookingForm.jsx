
import { useState } from "react";

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    date: "",
    time: "",
    requirements: "",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    console.log("Booking Submitted:", formData);
    alert("Booking submitted successfully!");
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ display: 'grid', gap: '1rem' }}>
      <input placeholder="Your Name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
      <input placeholder="Email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
      <input placeholder="Phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
      <select value={formData.category} onChange={(e) => handleChange("category", e.target.value)} required>
        <option value="">Select Category</option>
        <option value="basic">Basic</option>
        <option value="pro">Pro</option>
        <option value="camera">Camera</option>
        <option value="phone">Phone</option>
      </select>
      <input type="date" value={formData.date} onChange={(e) => handleChange("date", e.target.value)} required />
      <select value={formData.time} onChange={(e) => handleChange("time", e.target.value)} required>
        <option value="">Select Time</option>
        <option value="10:00 AM">10:00 AM</option>
        <option value="11:00 AM">11:00 AM</option>
        <option value="12:00 PM">12:00 PM</option>
        <option value="02:00 PM">2:00 PM</option>
        <option value="03:00 PM">3:00 PM</option>
        <option value="04:00 PM">4:00 PM</option>
      </select>
      <textarea placeholder="Additional Requirements" value={formData.requirements} onChange={(e) => handleChange("requirements", e.target.value)} />
      <button type="submit">Submit Booking</button>
    </form>
  );
}
