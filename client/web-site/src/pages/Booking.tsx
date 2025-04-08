import { createResource, createSignal, Show } from "solid-js";
import { useParams, useNavigate, useSearchParams } from "@solidjs/router";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const apiUrl = import.meta.env.VITE_API_URL;

function Booking() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [headCount, setHeadCount] = createSignal(1);
  const [acceptedTerms, setAcceptedTerms] = createSignal(false);
  const [bookingToken, setBookingToken] = createSignal(
    searchParams.token || ""
  );

  // Fetch package details using the booking token
  const [packageDetails] = createResource(async () => {
    // if (!bookingToken()) {
    //   navigate("/", { replace: true }); // Redirect if no token
    //   return null;
    // }

    try {
      const response = await axios.get(
        `${apiUrl}/api/bookings/booking-details`,
        {
          headers: {
            "x-booking-key": bookingToken(),
          },
        }
      );

      return {
        packageName: response.data.packageDetails.packageName,
        duration: response.data.packageDetails.duration,
        accommodation: response.data.packageDetails.accommodation,
        price: response.data.packageDetails.price,
        packageId: response.data.packageDetails.packageId,
      };
    } catch (error) {
      console.error("Error fetching package details:", error);
      navigate("/packages", { replace: true }); // Redirect on error
      return null;
    }
  });

  // Calculate total price
  const totalPrice = () => {
    if (!packageDetails()) return 0;
    return headCount() * packageDetails().price;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!acceptedTerms()) {
      alert("Please accept the terms and conditions");
      return;
    }

    try {
      const bookingResponse = await axios.post(
        `${apiUrl}/api/bookings/configured-booking`,
        {
          packageId: packageDetails()?.packageId || params.id,
          headCount: headCount(),
          totalPrice: totalPrice(),
        },
        {
          headers: {
            "x-booking-key": bookingToken(),
          },
        }
      );

      navigate("/checkout", {
        state: {
          bookingId: bookingResponse.data.id,
          bookingToken: bookingToken(),
        },
      });
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
    }
  };

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />

      <main class="flex-grow pt-16">
        <Show
          when={packageDetails()}
          fallback={
            <div class="text-center py-12">Loading package details...</div>
          }
        >
          <div class="max-w-4xl mx-auto container px-4 py-8">
            <h1 class="text-3xl font-bold mb-6">
              Configure your package: {packageDetails().packageName}
            </h1>
            <div class="grid md:grid-cols-2 gap-8">
              {/* Package Details */}
              <div>
                <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h2 class="text-xl font-semibold mb-4">Package Details</h2>
                  <p class="mb-2">
                    <span class="font-medium">Duration:</span>{" "}
                    {packageDetails().duration}
                  </p>
                  <p class="mb-2">
                    <span class="font-medium">Accommodation:</span>{" "}
                    {packageDetails().accommodation}
                  </p>
                  <p class="mb-2">
                    <span class="font-medium">Price per person:</span> $
                    {packageDetails().price}
                  </p>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md">
                  <h2 class="text-xl font-semibold mb-4">What happens next?</h2>
                  <ol class="list-decimal pl-5 space-y-2">
                    <li>Pay advance payment (50%) to secure the reservation</li>
                    <li>Receive confirmation email with booking details</li>
                    <li>Our team will contact you to finalize details</li>
                    <li>Get a reminder 24 hours before your booking</li>
                    <li>Enjoy your experience!</li>
                  </ol>
                </div>
              </div>

              {/* Booking Form */}
              <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-semibold mb-4">Booking Information</h2>
                <form onSubmit={handleSubmit}>
                  {/* Headcount Selector */}
                  <div class="mb-6">
                    <label class="block text-gray-700 mb-2">
                      Number of people
                    </label>
                    <div class="flex items-center">
                      <button
                        type="button"
                        onClick={() => setHeadCount((c) => Math.max(1, c - 1))}
                        class="bg-gray-200 px-3 py-1 rounded-l-md"
                      >
                        -
                      </button>
                      <span class="bg-gray-100 px-4 py-1 text-center">
                        {headCount()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setHeadCount((c) => c + 1)}
                        class="bg-gray-200 px-3 py-1 rounded-r-md"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div class="mb-6 p-4 bg-blue-50 rounded-md">
                    <p class="font-medium">Total Price:</p>
                    <p class="text-2xl font-bold">${totalPrice()}</p>
                    <p class="text-sm text-gray-600">
                      (50% deposit required: ${totalPrice() * 0.5})
                    </p>
                  </div>

                  {/* Terms and Conditions */}
                  <div class="mb-6">
                    <label class="flex items-start">
                      <input
                        type="checkbox"
                        checked={acceptedTerms()}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        class="mt-1 mr-2"
                      />
                      <span class="text-sm">
                        I agree to the{" "}
                        <a href="/terms" class="text-blue-600 hover:underline">
                          Terms and Conditions
                        </a>
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                  >
                    Checkout
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Show>
      </main>

      <Footer />
    </div>
  );
}

export default Booking;
