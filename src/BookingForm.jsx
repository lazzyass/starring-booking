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
    setFormData((s) => ({ ...s, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic guard
    if (!formData.name || !formData.email || !formData.phone || !formData.category || !formData.date || !formData.time) {
      alert("Please fill all required fields.");
      return;
    }

    const url =
      "https://script.google.com/macros/s/AKfycbwygVVmxSFIVGexnahBQpIcviyD2OM34kuepMPD5TJRmfc1w_Pa-XgZ1Z-_yIOMTmQT/exec";

    // Create a hidden iframe target so the page doesn't navigate
    const iframe = document.createElement("iframe");
    iframe.name = "hidden_iframe";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Build a plain HTML form to avoid CORS
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    form.target = "hidden_iframe";

    const addField = (name, value) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value ?? "";
      form.appendChild(input);
    };

    Object.entries(formData).forEach(([k, v]) => addField(k, v));
    document.body.appendChild(form);
    form.submit();

    // Clean up and optimistic success UI
    setTimeout(() => {
      try {
        form.remove();
        iframe.remove();
      } catch (_) {}
      alert("Booking submitted! Please check your Google Sheet.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "",
        date: "",
        time: "",
        requirements: "",
      });
    }, 800);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: "1rem", maxWidth: 600, margin: "0 auto" }}
    >
      <input
        placeholder="Your Name *"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        required
      />
      <input
        placeholder="Email *"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
      />
      <input
        placeholder="Phone *"
        value={formData.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
        required
      />

      <select
        value={formData.category}
        onChange={(e) => handleChange("category", e.target.value)}
        required
      >
        <option value="">Select Category *</option>
        <option value="basic">Basic</option>
        <option value="pro">Pro</option>
        <option value="camera">Camera</option>
        <option value="phone">Phone</option>
      </select>

      <input
        type="date"
        value={formData.date}
        onChange={(e) => handleChange("date", e.target.value)}
        required
      />

      <select
        value={formData.time}
        onChange={(e) => handleChange("time", e.target.value)}
        required
      >
        <option value="">Select Time *</option>
        <option value="10:00 AM">10:00 AM</option>
        <option value="11:00 AM">11:00 AM</option>
        <option value="12:00 PM">12:00 PM</option>
        <option value="02:00 PM">2:00 PM</option>
        <option value="03:00 PM">3:00 PM</option>
        <option value="04:00 PM">4:00 PM</option>
      </select>

      <textarea
        placeholder="Additional Requirements"
        value={formData.requirements}
        onChange={(e) => handleChange("requirements", e.target.value)}
        rows={4}
      />

      <button type="submit">Submit Booking</button>
    </form>
  );
}
