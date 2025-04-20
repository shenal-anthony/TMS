import { createStore } from "solid-js/store";
import { onMount, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../util/useCart";

const apiUrl = import.meta.env.VITE_API_URL;

type PackageDetails = {
  pkgId: number;
  pkgName: string;
  price: number;
  duration: string;
  accommodation: string;
  startDate?: string;
  endDate?: string;
};

function BookingConfiguration() {
  const params = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const cartDate = new Date().toISOString().split("T")[0];

  const [state, setState] = createStore({
    headCount: 1,
    acceptedTerms: false,
    booking: {
      key: "",
      details: null as PackageDetails | null,
      loading: true,
      error: "",
    },
  });

  // Derived value for total price
  const totalPrice = () =>
    state.booking.details ? state.headCount * state.booking.details.price : 0;

  // Initialize booking session
  onMount(async () => {
    const token = sessionStorage.getItem("bookingKey");
    if (!token) {
      setState("booking", "error", "Please start booking from package page");
      navigate("/packages");
      return;
    }

    try {
      const { data } = await axios.post(`${apiUrl}/api/bookings/verify-token`, {
        token,
      });

      if (!data.success) {
        throw new Error(data.message || "Invalid token");
      }

      setState({
        booking: {
          key: token,
          details: {
            pkgId: data.pkgId,
            pkgName: data.pkgName,
            price: data.price,
            duration: data.duration,
            accommodation: data.accommodation,
            startDate: data.startDate,
            endDate: data.endDate,
          },
          loading: false,
          error: "",
        },
      });
    } catch (error) {
      sessionStorage.removeItem("bookingKey");
      setState("booking", {
        error: error instanceof Error ? error.message : "Booking failed",
        loading: false,
      });
      navigate("/packages");
    }
  });

  const handleAddToCart = () => {
    if (!state.booking.details) return;

    addToCart({
      pkgName: state.booking.details.pkgName,
      price: state.booking.details.price,
      headCount: state.headCount,
      date: cartDate,
      pkgId: state.booking.details.pkgId,
      duration: state.booking.details.duration,
    });

    alert("Item added to cart!");
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!state.acceptedTerms) {
      alert("Please accept the terms and conditions");
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/bookings/configured-booking`,
        {
          pkgId: params.id,
          headCount: state.headCount,
          token: state.booking.key,
          price: state.booking.details?.price,
        }
      );

      if (!response.data.success) {
        alert(response.data.message || "Package not available");
        return;
      }

      if (response.status === 200 && response.data.bookingKey) {
        sessionStorage.setItem("bookingKey", response.data.bookingKey); // Store booking key in session storage
        console.log("Booking key stored:", response.data.bookingKey);
      }

      navigate("/checkout", {
        state: {
          pkgId: params.id,
          bookingKey: response.data.bookingKey,
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
          when={!state.booking.loading}
          fallback={
            <div class="text-center py-12">Loading booking session...</div>
          }
        >
          <Show
            when={state.booking.details}
            fallback={
              <div class="text-center py-12">
                {state.booking.error || "Unable to load package details"}
              </div>
            }
          >
            {(details) => (
              <div class="max-w-4xl mx-auto container px-4 py-8">
                <h1 class="text-3xl font-bold mb-6">
                  Configure your package: {details().pkgName}
                </h1>

                <div class="grid md:grid-cols-2 gap-8">
                  {/* Package Details Section */}
                  <div>
                    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                      <h2 class="text-xl font-semibold mb-4">
                        Package Details
                      </h2>
                      <p class="mb-2">
                        <span class="font-medium">Duration:</span>{" "}
                        {details().duration}
                      </p>
                      <p class="mb-2">
                        <span class="font-medium">Accommodation:</span>{" "}
                        {details().accommodation}
                      </p>
                      <p class="mb-2">
                        <span class="font-medium">Price per person:</span> $
                        {details().price}
                      </p>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow-md">
                      <h2 class="text-xl font-semibold mb-4">
                        What happens next?
                      </h2>
                      <ol class="list-decimal pl-5 space-y-2">
                        <li>
                          Pay advance payment (50%) to secure the reservation
                        </li>
                        <li>Receive confirmation email with booking details</li>
                        <li>Our team will contact you to finalize details</li>
                        <li>Get a reminder 24 hours before your booking</li>
                        <li>Enjoy your experience!</li>
                      </ol>
                    </div>
                  </div>

                  {/* Booking Form Section */}
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <h2 class="text-xl font-semibold mb-4">
                      Booking Information
                    </h2>
                    <form onSubmit={handleSubmit}>
                      <div class="mb-6">
                        <label class="block text-gray-700 mb-2">
                          Number of people
                        </label>
                        <div class="flex items-center">
                          <button
                            type="button"
                            onClick={() =>
                              setState("headCount", (c) => Math.max(1, c - 1))
                            }
                            class="bg-gray-200 px-3 py-1 rounded-l-md"
                          >
                            -
                          </button>
                          <span class="bg-gray-100 px-4 py-1 text-center">
                            {state.headCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setState("headCount", (c) => c + 1)}
                            class="bg-gray-200 px-3 py-1 rounded-r-md"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div class="mb-6 p-4 bg-blue-50 rounded-md">
                        <p class="font-medium">Total Price:</p>
                        <p class="text-2xl font-bold">${totalPrice()}</p>
                        <p class="text-sm text-gray-600">
                          (50% deposit required: $
                          {(totalPrice() * 0.5).toFixed(2)})
                        </p>
                      </div>

                      <div class="mb-6">
                        <label class="flex items-start">
                          <input
                            type="checkbox"
                            checked={state.acceptedTerms}
                            onChange={(e) =>
                              setState("acceptedTerms", e.target.checked)
                            }
                            class="mt-1 mr-2"
                          />
                          <span class="text-sm">
                            I agree to the{" "}
                            <a
                              href="/terms"
                              class="text-blue-600 hover:underline"
                            >
                              Terms and Conditions
                            </a>
                          </span>
                        </label>
                      </div>

                      <div class="space-y-4">
                        <button
                          type="submit"
                          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                        >
                          Checkout Now
                        </button>
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-md font-medium transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </Show>
        </Show>
      </main>

      <Footer />
    </div>
  );
}

export default BookingConfiguration;
