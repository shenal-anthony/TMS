import { createResource, Show, createSignal } from "solid-js";
import { useParams, A, useNavigate } from "@solidjs/router";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import pic from "../assets/Background.png";
import AccommodationSection from "../components/AccommodationSection";
import Testimonial from "../components/Testimonial";
import lake from "../assets/lake.png";
import mountain from "../assets/mountain.png";
import dock from "../assets/dock.png";

const apiUrl = import.meta.env.VITE_API_URL;

const PackageDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [heroLoaded, setHeroLoaded] = createSignal(false);
  const [isBooking, setIsBooking] = createSignal(false);

  const [pkg] = createResource(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/tourists/package/${params.id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pkg:", error);
      return null;
    }
  });

  const handleBookNow = async () => {
    setIsBooking(true);

    try {
      const response = await axios.post(
        `${apiUrl}/api/bookings/check-availability`,
        { packageId: params.id }
      );

      // 2. Check both the status and the response data
      if (response.data.available && response.status === 200) {
        navigate(`/booking/${params.id}`, {
          state: {
            packageData: response.data,
          },
        });
      } else {
        alert(
          response.data.message ||
            "Package is not available for booking at this time."
        );
      }
    } catch (error) {
      console.error("Availability check failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        // Handle specific error messages from the server
        alert(
          error.response.data.message ||
            "Failed to check availability. Please try again."
        );
      } else {
        alert("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />

      <main class="flex-grow pt-16">
        <Show
          when={pkg()}
          fallback={
            <div class="text-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Loading package details...
            </div>
          }
        >
          {/* Hero Image Section with Loading State */}
          <div class="relative">
            {/* Breadcrumb Navigation */}
            <div class="absolute top-4 left-0 right-0 z-10">
              <div class="container mx-auto px-4">
                <nav class="text-sm">
                  <ol class="flex space-x-2">
                    <li>
                      <A href="/" class="text-white hover:text-blue-200">
                        Home
                      </A>
                    </li>
                    <li class="text-white">/</li>
                    <li>
                      <A
                        href="/packages"
                        class="text-white hover:text-blue-200"
                      >
                        Packages
                      </A>
                    </li>
                    <li class="text-white">/</li>
                    <li class="text-white font-medium">{pkg().package_name}</li>
                  </ol>
                </nav>
              </div>
            </div>

            {/* Hero Image */}
            <div class="w-full h-96 overflow-hidden">
              <img
                src={pic}
                alt="Package Image"
                onLoad={() => setHeroLoaded(true)}
                class="w-full h-full object-cover"
                classList={{
                  "opacity-0": !heroLoaded(),
                  "opacity-100 transition-opacity duration-500": heroLoaded(),
                }}
              />
            </div>

            {/* Gradient Overlay */}
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-32"></div>

            {/* Title and Back Button - Positioned above gradient */}
            <div class="absolute bottom-8 left-0 right-0 z-10">
              <div class="container mx-auto px-4">
                <div class="flex justify-between items-center">
                  <h1 class="text-4xl font-bold text-white">
                    {pkg().package_name}
                  </h1>
                  <A
                    href="/packages"
                    class="text-white hover:text-blue-200 px-4 py-2 rounded-lg transition-colors"
                  >
                    Back to Packages
                  </A>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Container */}
          <div class="container mx-auto px-4 py-6">
            {/* Package Details and Sidebar Grid */}
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
              {/* Package Details (3/4 width) */}
              <div class="lg:col-span-3">
                <section class="mb-12">
                  <h2 class="text-2xl font-bold mb-4">
                    Explore the heart of Sunny Lake
                  </h2>
                  <p class="mb-6 text-gray-700 leading-relaxed">
                    {pkg().description}
                  </p>
                </section>

                <section class="mb-12">
                  <h2 class="text-2xl font-bold mb-4">
                    Comfortable, scenic, and unforgettable
                  </h2>
                  <p class="mb-6 text-gray-700 leading-relaxed">
                    The boat is equipped with comfortable seating and shaded
                    areas, ensuring a relaxing experience for everyone on board.
                    Feel the gentle breeze as you cruise the calm waters, and
                    enjoy light refreshments provided during the tour.
                  </p>
                </section>

                <section class="mb-12">
                  <h2 class="text-2xl font-bold mb-4">
                    Tour duration and booking information
                  </h2>
                  <p class="mb-6 text-gray-700 leading-relaxed">
                    The {pkg().package_name} typically lasts {pkg().duration}.
                    Tours operate daily, weather permitting. To secure your
                    spot, advance booking is recommended, especially during peak
                    season.
                  </p>
                </section>

                {/* Destination Images */}
                <section class="mb-12">
                  <h2 class="text-2xl font-bold mb-4">Destinations Covered</h2>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <img
                      src={lake}
                      alt="Sunny Lake"
                      class="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <img
                      src={dock}
                      alt="Dock area"
                      class="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <img
                      src={mountain}
                      alt="Mountain view"
                      class="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </section>
              </div>

              {/* Sidebar (1/4 width) */}
              <div class="lg:col-span-1">
                <div class=" p-4 rounded-lg top-4 sticky">
                  {/* booking button */}
                  <div class="bg-blue-50 p-4 rounded-sm">
                    <p class="text-sm font-medium mb-6">
                      Paddle your way through the crystal-clear waters of Sunny
                      Lake with options that suit all ages and skill levels.
                    </p>
                    <button
                      onClick={handleBookNow}
                      class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isBooking() ? (
                        <span class="inline-flex items-center justify-center">
                          <svg
                            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              class="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              stroke-width="4"
                            ></circle>
                            <path
                              class="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Book Here"
                      )}
                    </button>
                  </div>

                  {/* map section */}
                  <div>
                    <div class="mb-4 pt-4">
                      <h3 class="text-xl font-bold mb-4">View on a map</h3>
                      <div class="bg-gray-200 h-48 rounded-lg flex items-center justify-center text-gray-500">
                        Map Preview
                      </div>
                    </div>

                    <A
                      href="/news"
                      class="text-blue-600 font-medium block mb-6 hover:text-blue-800"
                    >
                      Latest news →
                    </A>
                  </div>
                </div>
              </div>
            </div>

            {/* Accommodation Section */}
            <section class="mb-16 py-8 border-t border-gray-200">
              <h2 class="text-3xl font-bold mb-8 text-center">
                Accommodation Options
              </h2>
              <AccommodationSection />
            </section>

            {/* Testimonials Section */}
            <section class="py-16 bg-gray-50 rounded-lg">
              <h2 class="text-3xl font-bold mb-8 text-center">
                What Our Guests Say
              </h2>
              <Testimonial />
            </section>
          </div>
        </Show>
      </main>

      <Footer />
    </div>
  );
};

export default PackageDetail;
