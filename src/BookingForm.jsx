import React, { useState } from "react";
import "./BookingForm.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw2IxgZKpenhE44DAKHoLgbotfnQF0nNPBhk-fp4OxeYcS0VWwNqDC5cVVDUkLoQKYIHw/exec";

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    idea: "",
    deviceType: "",
    editType: "",
    date: "",
    timeSlot: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.phone)) {
      toast.error("Please fill in all your details.");
      return;
    }
    if (step === 2 && (!formData.deviceType || !formData.editType)) {
      toast.error("Please select device type and edit type.");
      return;
    }
    setStep(step + 1);
  };

  const handleBooking = async () => {
    if (!formData.date || !formData.timeSlot) {
      toast.error("Please select date and time slot.");
      return;
    }
    setProcessing(true);

    // Fake 3-5s processing animation
    setTimeout(async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: new URLSearchParams(formData),
        });
        if (response.ok) {
          toast.success("Booking Confirmed! ✨");
          setFormData({
            name: "",
            email: "",
            phone: "",
            idea: "",
            deviceType: "",
            editType: "",
            date: "",
            timeSlot: "",
          });
          setStep(1);
        } else {
          toast.error("Error saving booking. Please try again.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      } finally {
        setProcessing(false);
      }
    }, 3000);
  };

  return (
    <div className="booking-container">
      <ToastContainer position="top-center" />
      <div className="logo-section">
        <img src="/starring-logo.svg" alt="Starring Logo" />
        <h1>Starring</h1>
        <p>Helping you shine, one frame at a time ✨</p>
      </div>

      <div className="form-card">
        {step === 1 && (
          <>
            <h2>Step 1: Your Details</h2>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <textarea
              name="idea"
              placeholder="Tell us about your content idea"
              value={formData.idea}
              onChange={handleChange}
            />
            <button className="next-btn" onClick={handleNext}>
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Step 2: Shoot Preferences</h2>
            <div className="option-group">
              <label
                className={
                  formData.deviceType === "Phone" ? "option selected" : "option"
                }
                onClick={() =>
                  setFormData({ ...formData, deviceType: "Phone" })
                }
              >
                Phone
              </label>
              <label
                className={
                  formData.deviceType === "Camera" ? "option selected" : "option"
                }
                onClick={() =>
                  setFormData({ ...formData, deviceType: "Camera" })
                }
              >
                Camera
              </label>
            </div>

            <div className="option-group">
              <label
                className={
                  formData.editType === "Basic" ? "option selected" : "option"
                }
                onClick={() =>
                  setFormData({ ...formData, editType: "Basic" })
                }
              >
                Basic Edit
              </label>
              <label
                className={
                  formData.editType === "Pro" ? "option selected" : "option"
                }
                onClick={() =>
                  setFormData({ ...formData, editType: "Pro" })
                }
              >
                Pro Edit
              </label>
            </div>

            <button className="next-btn" onClick={handleNext}>
              Continue →
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Step 3: Schedule & Payment</h2>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
            >
              <option value="">Select Time Slot</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
            </select>
            <button
              className="pay-btn"
              onClick={handleBooking}
              disabled={processing}
            >
              {processing ? "Processing..." : "Confirm & Pay"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
