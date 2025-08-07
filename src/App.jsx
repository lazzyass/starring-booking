
import BookingForm from "./BookingForm";

function App() {
  return (
    <div className="container">
      <div className="header">
        <img src="/logo.png" alt="Starring Logo" style={{ width: 80 }} />
        <h1>Book Your Slot with Starring</h1>
        <p>Helping you shine, one frame at a time ✨</p>
      </div>
      <BookingForm />
    </div>
  );
}

export default App;
