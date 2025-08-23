import React, { useState } from "react";
import "./BookingForm.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* =========================
   CONFIG
   ========================= */
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw2IxgZKpenhE44DAKHoLgbotfnQF0nNPBhk-fp4OxeYcS0VWwNqDC5cVVDUkLoQKYIHw/exec";

// Toggle this to false to enable live Razorpay flow
const MOCK_PAYMENT_MODE = true; // <- per your ask (3s mock)

// INR in paise (₹1 = 100)
const PRICE_MAP = {
  "phone-basic": 99900,    // ₹999
  "phone-pro": 219900,     // ₹2199
  "camera-basic": 349900,  // ₹3499
  "camera-pro": 499900,    // ₹4999
};

export default function BookingForm() {
  const [step, setStep] = useState(1);
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

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const goNext = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.phone)) {
      toast.error("Please fill in all your details.");
      return;
    }
    if (step === 2 && (!formData.deviceType || !formData.editType)) {
      toast.error("Please select device type and edit type.");
      return;
    }
    setStep((s) => s + 1);
  };

  async function handleBooking() {
    // Basic guards (unchanged beyond requirements)
    if (!formData.deviceType || !formData.editType) {
      toast.error("Please complete the previous step (device & edit type).");
      return;
    }
    if (!formData.date || !formData.timeSlot) {
      toast.error("Please choose a date and time slot.");
      return;
    }

    const categoryKey = `${formData.deviceType}-${formData.editType}`.toLowerCase();
    const amount = PRICE_MAP[categoryKey];
    if (!amount) {
      toast.error("Invalid category selected.");
      return;
    }

    // ---- MOCK PAYMENT MODE (3s delay, then save to Google Sheet) ----
    if (MOCK_PAYMENT_MODE) {
      try {
        setProcessing(true);

        // 3s fake gateway animation
        await new Promise((res) => setTimeout(res, 3000));

        // Save booking directly to your Google Sheet (same keys your script expects)
        const payload = new URLSearchParams({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          category: categoryKey,
          date: formData.date,
          time: formData.timeSlot,
          requirements: formData.idea || "",
        });

        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: payload,
        });

        toast.success("Payment successful & booking saved! 🎉");
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
      } catch (e) {
        console.error(e);
        toast.error("Network error. Please try again.");
      } finally {
        setProcessing(false);
      }
      return;
    }

    // ---- LIVE RAZORPAY FLOW (kept intact) ----
    try {
      setProcessing(true);

      // 1) Create order via Apps Script
      const createRes = await fetch(`${GOOGLE_SCRIPT_URL}?action=createOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount, // paise
          receipt: `starring_${Date.now()}`,
        }),
      }).then((r) => r.json());

      if (!createRes?.ok) {
        setProcessing(false);
        toast.error("Could not start payment. Please try again.");
        return;
      }

      const { order, key_id } = createRes;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Starring",
        description: `${formData.deviceType} • ${formData.editType}`,
        order_id: order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#9B5DE5" },

        // 2) On success → verify & write to Sheet
        handler: async function (response) {
          const bookingPayload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            category: categoryKey,           // sheet expects "category"
            date: formData.date,
            time: formData.timeSlot,         // sheet expects "time"
            requirements: formData.idea || "",
          };

          const verifyRes = await fetch(`${GOOGLE_SCRIPT_URL}?action=verifyPayment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              booking: bookingPayload,
            }),
          }).then((r) => r.json());

          setProcessing(false);

          if (verifyRes?.ok) {
            toast.success("Payment successful & booking saved! 🎉");
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
            toast.error("Payment verification failed — booking not saved.");
          }
        },

        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast("Payment cancelled.");
          },
        },
      };

      // 3) Open Razorpay checkout
      // eslint-disable-next-line no-undef
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setProcessing(false);
      toast.error("Network error. Please try again.");
    }
  }

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
            <button className="next-btn" onClick={goNext}>
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
                onClick={() => setFormData((s) => ({ ...s, deviceType: "Phone" }))}
              >
                Phone
              </label>
              <label
                className={
                  formData.deviceType === "Camera" ? "option selected" : "option"
                }
                onClick={() => setFormData((s) => ({ ...s, deviceType: "Camera" }))}
              >
                Camera
              </label>
            </div>

            <div className="option-group">
              <label
                className={
                  formData.editType === "Basic" ? "option selected" : "option"
                }
                onClick={() => setFormData((s) => ({ ...s, editType: "Basic" }))}
              >
                Basic Edit
              </label>
              <label
                className={
                  formData.editType === "Pro" ? "option selected" : "option"
                }
                onClick={() => setFormData((s) => ({ ...s, editType: "Pro" }))}
              >
                Pro Edit
              </label>
            </div>

            <button className="next-btn" onClick={goNext}>
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
