import { createResource, Show, createSignal, createEffect } from "solid-js";
import { useParams, A, useNavigate } from "@solidjs/router";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import pic from "../assets/Background.png";

const apiUrl = import.meta.env.VITE_API_URL;
const weatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

const PackageDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = createSignal(false);
  const [weather, setWeather] = createSignal("Loading...");

  const [pkg] = createResource(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/contents/detailed_package/${params.id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pkg:", error);
      return null;
    }
  });

  createEffect(async () => {
    const packageData = pkg();
    if (packageData && packageData.latitude && packageData.longitude) {
      try {
        const res = await axios.get(
          "https://api.openweathermap.org/data/2.5/weather",
          {
            params: {
              lat: packageData.latitude,
              lon: packageData.longitude,
              appid: weatherApiKey,
              units: "metric",
            },
          }
        );

        const w = res.data;
        setWeather(`${w.weather[0].main}, ${w.main.temp}°C`);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setWeather("Weather unavailable");
      }
    } else {
      setWeather("Weather unavailable");
    }
  });

  const handleBookNow = async () => {
    setIsBooking(true);
    const bookingDate = new Date().toISOString();

    try {
      const response = await axios.post(
        `${apiUrl}/api/bookings/check-availability`,
        {
          packageId: params.id,
          date: bookingDate,
        }
      );

      if (!response.data.success) {
        alert(response.data.message || "Package not available");
        return;
      }

      if (response.status === 200 && response.data.bookingKey) {
        sessionStorage.setItem("bookingKey", response.data.bookingKey);
        console.log("Booking key stored:", response.data.bookingKey);

        navigate(`/booking/${params.id}`, {
          state: {
            bookingKey: response.data.bookingKey,
            packageId: params.id,
          },
        });
      } else {
        throw new Error("Failed to create booking session");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div class="min-h-screen flex flex-col bg-gray-50">
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
          {/* Hero Section */}
          <div class="relative w-full h-80 overflow-hidden rounded-xs">
            <div class="absolute inset-0 bg-gradient-to-b from-black to-gray-800 opacity-70 z-5" />
            <div class="relative w-full h-full">
              <img
                src={pkg().picture_url || pic}
                alt={pkg().package_name}
                class="absolute top-0 left-0 w-full object-cover"
                // style={{ height: "100%", min-height: "320px" }}
              />
              <div class="relative flex items-center justify-center w-full h-full z-10">
                <div class="h-80 w-3/4">
                  <img
                    src={pkg().picture_url || pic}
                    alt={pkg().package_name}
                    class="w-full h-full object-contain rounded-xs"
                  />
                </div>
              </div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center z-15">
              <div class="text-center">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-2">
                  {pkg().package_name}
                </h1>
                <p class="text-lg text-white opacity-80">
                  {pkg().destination_name}
                </p>
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
  <div class="container mx-auto px-1 py-2">
          <nav class="text-sm text-gray-600">
            <ol class="flex items-center space-x-1.5">
              <li>
                <A href="/" class="hover:text-blue-600 font-medium">
                  Home
                </A>
              </li>
              <li class="text-gray-400">/</li>
              <li>
                <A href="/tours" class="hover:text-blue-600 font-medium">
                  Tours
                </A>
              </li>
              <li class="text-gray-400">/</li>
              <li class="font-semibold text-blue-800 truncate max-w-[160px]">
                {pkg().package_name}
              </li>
            </ol>
          </nav>
        </div>

          {/* Main Content */}
          <div class="container mx-auto px-4 py-12">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Content Sections */}
              <div class="lg:col-span-2 space-y-12">
                {/* Package Details Section (Card) */}
                <section class="bg-white p-6 rounded-xs shadow-md">
                  <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    Package Details
                  </h2>
                  <div class="space-y-4">
                    <p class="text-gray-600 leading-relaxed">
                      {pkg().package_description}
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span class="font-medium text-gray-700">Duration:</span>{" "}
                        {pkg().duration} minutes
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Price:</span> $
                        {pkg().price}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Duration, Location, Weather Section */}
                <section class="bg-yellow-50 p-6 rounded-xs">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <h3 class="text-sm font-semibold text-gray-600 uppercase">
                        Duration
                      </h3>
                      <p class="text-lg font-medium">
                        {Math.floor(pkg().duration / 60)} Hours
                      </p>
                    </div>
                    <div>
                      <h3 class="text-sm font-semibold text-gray-600 uppercase">
                        Location
                      </h3>
                      <p class="text-lg font-medium">
                        {pkg().destination_name}
                      </p>
                    </div>
                    <div>
                      <h3 class="text-sm font-semibold text-gray-600 uppercase">
                        Weather Now
                      </h3>
                      <p class="text-lg font-medium">{weather()}</p>
                    </div>
                  </div>
                </section>

                {/* Accommodation Section */}
                <section class="bg-transparent p-0">
                  <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    Accommodation
                  </h2>
                  <div class="space-y-4">
                    <h3 class="text-xl font-semibold text-gray-700">
                      {pkg().accommodation_name}
                    </h3>
                    <p class="text-gray-600">
                      Type: {pkg().accommodation_type}
                    </p>
                    <p class="text-gray-600">Amenities: {pkg().amenities}</p>
                    <p class="text-gray-600">Contact: {pkg().contact_number}</p>
                  </div>
                  {/* Accommodation Pictures */}
                  <div class="mt-6">
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">
                      Accommodation Gallery
                    </h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <img
                        src={pkg().accommodation_picture_url}
                        alt="Accommodation Image"
                        class="w-full h-48 object-cover rounded-xs"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div class="lg:col-span-1">
                <div class="sticky top-22 space-y-6">
                  {/* Booking Card */}
                  <div class="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-xs shadow-md">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                      Book This Package
                    </h3>
                    <p class="text-gray-600 mb-4">
                      Secure your spot for an unforgettable experience!
                    </p>
                    <button
                      onClick={handleBookNow}
                      disabled={isBooking()}
                      class="w-full bg-blue-600 text-white py-3 rounded-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBooking() ? (
                        <span class="flex items-center justify-center">
                          <svg
                            class="animate-spin h-5 w-5 mr-2 text-white"
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
                        "Book Now"
                      )}
                    </button>
                  </div>

                  {/* Map Card */}
                  <div class="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-xs shadow-md">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                      Location
                    </h3>
                    <div class="relative">
                      <iframe
                        src={pkg().location_url}
                        width="100%"
                        height="192"
                        style={{ border: "0" }}
                        allowfullscreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        class="rounded-xs"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </main>

      <Footer />
    </div>
  );
};

export default PackageDetail;
