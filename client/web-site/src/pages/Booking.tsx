import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Booking() {
  let numbers= [1, 2, 3];
  numbers[5] = 6;
  console.log(numbers.length);
  
  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />
      <main class="flex-grow pt-16">
        <h1>Configure your package</h1>
        <p></p>
       
        {/* package duration */}

        {/* headcount increamenter  */}

        {/* per head price */}

        {/* total price */}

        <p> what happen next?</p>
        <p>1. you can pay advance payment (50%) to secure the reservation. </p>
        <p>
          2. You will receive a confirmation email with the details of your
          booking.
        </p>
        <p>
          3. You will be contacted by our team to finalize the details of your
          booking.
        </p>
        <p>
          4. You will receive a reminder email 24 hours before your booking.
        </p>
        <p>4. Enjoy your experience!</p>
        <p>Please read our terms and conditions before booking.</p>
        {/* Terms and Conditions tick box */}
        {/* proceed to reservation button */}
      </main>
      <Footer />
    </div>
  );
}

export default Booking;
