import {
  createResource,
  Show,
  createSignal,
  For,
  createEffect,
} from "solid-js";
import { useParams, A, useNavigate } from "@solidjs/router";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import pic from "../assets/Background.png";
import PackageSkeleton from "../components/PackageSkeleton";

const apiUrl = import.meta.env.VITE_API_URL;
const weatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
const defaultImage = pic;

// Hardcoded fallback images
const defaultImages = [
  "https://via.placeholder.com/300x200?text=Image+1",
];

// Parse coordinates from Google Maps embed URL
const parseCoordinates = (url: string) => {
  try {
    const match = url.match(/!2d([-\d.]+)!3d([-\d.]+)/);
    if (match) {
      return { lon: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
    return null;
  } catch {
    return null;
  }
};

const PackageDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = createSignal(false);
  const [activeImageIndices, setActiveImageIndices] = createSignal<
    Record<string | number, number>
  >({});
  const [selectedMapUrl, setSelectedMapUrl] = createSignal("");
  const [weathers, setWeathers] = createSignal<Record<string | number, string>>(
    {}
  );
  type SectionKey =
    | "package"
    | "destinations"
    | "accommodations"
    | "tours"
    | "terms"
    | "thingsNeeded"
    | "includedNot";

  const [expandedSections, setExpandedSections] = createSignal<
    Record<SectionKey, boolean>
  >({
    package: false,
    destinations: false,
    accommodations: false,
    tours: false,
    terms: false,
    thingsNeeded: false,
    includedNot: false,
  });

  const [pkg] = createResource(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/contents/detailed_package/${params.id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching package:", error);
      return null;
    }
  });

  // Fetch weather for each destination
  createEffect(() => {
    const packageData = pkg();
    if (packageData?.destinations?.length > 0) {
      packageData.destinations.forEach(
        async (dest: {
          locationUrl: string;
          destinationId: any;
          destinationName: any;
        }) => {
          const coords = parseCoordinates(dest.locationUrl);
          if (coords) {
            try {
              const res = await axios.get(
                "https://api.openweathermap.org/data/2.5/weather",
                {
                  params: {
                    lat: coords.lat,
                    lon: coords.lon,
                    appid: weatherApiKey,
                    units: "metric",
                  },
                }
              );
              const w = res.data;
              setWeathers((prev) => ({
                ...prev,
                [dest.destinationId]: `${w.weather[0].main}, ${w.main.temp}°C`,
              }));
            } catch (err) {
              console.error(
                "Weather fetch error for",
                dest.destinationName,
                err
              );
              setWeathers((prev) => ({
                ...prev,
                [dest.destinationId]: "Weather unavailable",
              }));
            }
          } else {
            setWeathers((prev) => ({
              ...prev,
              [dest.destinationId]: "Weather unavailable",
            }));
          }
        }
      );

      // Set initial map URL
      setSelectedMapUrl(packageData.destinations[0]?.locationUrl || "");
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
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const nextImage = (id: string | number) => {
    setActiveImageIndices((prev) => {
      const currentIndex = prev[id] || 0;
      const images = [
        ...(pkg()?.tours?.map((t: { pictureUrl: any }) => t.pictureUrl) || []),
        ...defaultImages,
      ].filter(Boolean);
      return { ...prev, [id]: (currentIndex + 1) % images.length };
    });
  };

  const prevImage = (id: string | number) => {
    setActiveImageIndices((prev) => {
      const currentIndex = prev[id] || 0;
      const images = [
        ...(pkg()?.tours?.map((t: { pictureUrl: any }) => t.pictureUrl) || []),
        ...defaultImages,
      ].filter(Boolean);
      return {
        ...prev,
        [id]: (currentIndex - 1 + images.length) % images.length,
      };
    });
  };

  return (
    <div class="min-h-screen flex flex-col bg-gray-50">
      <style>
        {`
          @keyframes slide {
            0% { opacity: 1; z-index: 10; }
            20% { opacity: 1; z-index: 10; }
            25% { opacity: 0; z-index: 5; }
            95% { opacity: 0; z-index: 5; }
            100% { opacity: 1; z-index: 10; }
          }
          .animate-slide {
            animation: slide 6s infinite;
          }
        `}
      </style>
      <Navbar />
      <main class="flex-grow pt-16">
        <Show
          when={pkg()}
          fallback={
            <div class="container mx-auto px-4 py-12">
              <PackageSkeleton />
            </div>
          }
        >
          {(packageData) => (
            <>
              {/* Hero Section */}
              <div class="relative w-screen h-90 overflow-hidden rounded-xs -mx-[calc(50vw-50%)]">
                <div class="absolute inset-0 bg-gradient-to-b from-black to-gray-800 opacity-70 z-10" />
                <div class="relative w-full h-full">
                  <img
                    src={packageData().package?.pictureUrl || defaultImage}
                    alt={packageData().package?.packageName || "Package"}
                    class="absolute top-0 left-0 w-full object-cover"
                  />
                  <div class="relative flex items-center justify-center w-full h-full z-20">
                    <div class="h-90 w-3/4">
                      <img
                        src={packageData().package?.pictureUrl || defaultImage}
                        alt={packageData().package?.packageName || "Package"}
                        class="w-full h-full object-contain rounded-xs shadow-lg"
                      />
                    </div>
                  </div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center z-30">
                  <div class="text-center">
                    <h1 class="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">
                      {packageData().package?.packageName || "Package"}
                    </h1>
                    <p class="text-lg text-white opacity-90">{"Explore"}</p>
                  </div>
                </div>
              </div>

              {/* Breadcrumb Navigation */}
              <div class="container mx-auto px-4 py-3">
                <nav class="text-sm text-gray-600">
                  <ol class="flex items-center space-x-2">
                    <li>
                      <A href="/" class="hover:text-blue-600 font-medium">
                        Home
                      </A>
                    </li>
                    <li class="text-gray-400">/</li>
                    <li>
                      <A
                        href="/packages"
                        class="hover:text-blue-600 font-medium"
                      >
                        Packages
                      </A>
                    </li>
                    <li class="text-gray-400">/</li>
                    <li class="font-semibold text-blue-800 truncate max-w-[200px]">
                      {packageData().package?.packageName}
                    </li>
                  </ol>
                </nav>
              </div>

              {/* Main Content */}
              <div class="container mx-auto px-4 py-12">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Content Sections */}
                  <div class="lg:col-span-2 space-y-6">
                    {/* Package Details Section */}
                    <section class="bg-yellow-100 p-4 rounded-xs shadow-md ">
                      <h2 class="text-2xl font-bold text-gray-800 mb-4">
                        Package Details
                      </h2>
                      <div class="space-y-4">
                        <p class="text-gray-600 leading-relaxed text-justify">
                          {packageData().package?.description ||
                            "No description available"}
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span class="font-medium text-gray-700">
                              Duration:
                            </span>{" "}
                            {packageData().package?.duration
                              ? packageData().package.duration >= 1440
                                ? `${Math.floor(
                                    packageData().package.duration / 1440
                                  )} day(s)`
                                : packageData().package.duration >= 60
                                ? `${Math.floor(
                                    packageData().package.duration / 60
                                  )} hour(s)`
                                : `${packageData().package.duration} minute(s)`
                              : "N/A"}
                          </div>
                          <div>
                            <span class="font-medium text-gray-700">
                              Price:
                            </span>{" "}
                            LKR{" "}
                            {Number(packageData().package?.price || 0).toFixed(
                              2
                            )}{" "}
                            pp
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Destinations Section */}
                    <section class="bg-yellow-100 p-4 rounded-xs shadow-md">
                      <h2 class="text-2xl font-bold text-gray-800 mb-4">
                        Destinations
                      </h2>
                      <Show
                        when={packageData().destinations?.length > 0}
                        fallback={
                          <p class="text-gray-600">
                            No destinations available for this package.
                          </p>
                        }
                      >
                        <div class="space-y-6">
                          <For each={packageData().destinations}>
                            {(dest) => {
                              const images = [
                                dest.pictureUrl,
                                ...defaultImages,
                              ].filter(Boolean);
                              return (
                                <div class="bg-white rounded-xs shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                                  <div class="flex-1">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                      {dest.destinationName}
                                    </h3>
                                    <p class="text-gray-600 text-sm mb-1">
                                      Explore the beauty of{" "}
                                      {dest.destinationName}.
                                    </p>
                                    <div>
                                      <span class="font-sm text-gray-800">
                                        Description:
                                      </span>{" "}
                                      {dest.description || "N/A"}
                                    </div>
                                    <p class="text-gray-600 text-sm">
                                      Weather:{" "}
                                      {weathers()[dest.destinationId] ||
                                        "Loading..."}
                                    </p>
                                  </div>
                                  <div class="relative w-full sm:w-64 h-64">
                                    <img
                                      src={
                                        images[
                                          activeImageIndices()[
                                            dest.destinationId
                                          ] || 0
                                        ] || defaultImage
                                      }
                                      alt={dest.destinationName}
                                      class="w-full h-full object-cover rounded-xs"
                                    />
                                    <Show when={images.length > 1}>
                                      <button
                                        onClick={() =>
                                          prevImage(dest.destinationId)
                                        }
                                        class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          class="w-6 h-6"
                                        >
                                          <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M15 19l-7-7 7-7"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() =>
                                          nextImage(dest.destinationId)
                                        }
                                        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          class="w-6 h-6"
                                        >
                                          <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 5l7 7-7 7"
                                          />
                                        </svg>
                                      </button>
                                      <div class="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                                        <For each={images}>
                                          {(_, index) => (
                                            <div
                                              class={`w-3 h-3 rounded-full transition-colors ${
                                                index() ===
                                                (activeImageIndices()[
                                                  dest.destinationId
                                                ] || 0)
                                                  ? "bg-blue-600"
                                                  : "bg-gray-400"
                                              }`}
                                            />
                                          )}
                                        </For>
                                      </div>
                                    </Show>
                                  </div>
                                </div>
                              );
                            }}
                          </For>
                        </div>
                      </Show>
                    </section>

                    {/* Accommodations Section */}
                    <section class="bg-yellow-100 p-4 rounded-xs shadow-md">
                      <h2 class="text-2xl font-bold text-gray-800 mb-4">
                        Accommodations
                      </h2>
                      <Show
                        when={packageData().accommodations?.length > 0}
                        fallback={
                          <p class="text-gray-600">
                            No accommodations available for this package.
                          </p>
                        }
                      >
                        <div class="space-y-6">
                          <For each={packageData().accommodations}>
                            {(acc) => {
                              const images = [
                                acc.pictureUrl,
                                ...defaultImages,
                              ].filter(Boolean);
                              return (
                                <div class="bg-white rounded-xs shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                                  <div class="flex-1">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                      {acc.accommodationName || "Unnamed"}
                                    </h3>
                                    <p class="text-gray-600 text-sm mb-1">
                                      Type: {acc.accommodationType || "N/A"}
                                    </p>
                                    <p class="text-gray-600 text-sm mb-1">
                                      Amenities:{" "}
                                      {acc.amenities
                                        ?.split("\n")
                                        .filter((item: string) => item.trim())
                                        .join(", ") || "N/A"}
                                    </p>
                                  </div>
                                  <div class="relative w-full sm:w-64 h-64">
                                    <img
                                      src={
                                        images[
                                          activeImageIndices()[
                                            acc.accommodationId
                                          ] || 0
                                        ] || defaultImage
                                      }
                                      alt={acc.accommodationName}
                                      class="w-full h-full object-cover rounded-xs"
                                    />
                                    <Show when={images.length > 1}>
                                      <button
                                        onClick={() =>
                                          prevImage(acc.accommodationId)
                                        }
                                        class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          class="w-6 h-6"
                                        >
                                          <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M15 19l-7-7 7-7"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() =>
                                          nextImage(acc.accommodationId)
                                        }
                                        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          class="w-6 h-6"
                                        >
                                          <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 5l7 7-7 7"
                                          />
                                        </svg>
                                      </button>
                                      <div class="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                                        <For each={images}>
                                          {(_, index) => (
                                            <div
                                              class={`w-3 h-3 rounded-full transition-colors ${
                                                index() ===
                                                (activeImageIndices()[
                                                  acc.accommodationId
                                                ] || 0)
                                                  ? "bg-blue-600"
                                                  : "bg-gray-400"
                                              }`}
                                            />
                                          )}
                                        </For>
                                      </div>
                                    </Show>
                                  </div>
                                </div>
                              );
                            }}
                          </For>
                        </div>
                      </Show>
                    </section>

                    {/* Terms & Conditions Section */}
                    <section class="bg-yellow-100 p-4 rounded-xs shadow-md">
                      <button
                        class="w-full text-left text-lg font-semibold text-gray-800 flex items-center justify-between"
                        onClick={() => toggleSection("terms")}
                      >
                        Terms & Conditions
                        <span>{expandedSections().terms ? "▲" : "▼"}</span>
                      </button>
                      <Show when={expandedSections().terms}>
                        <div class="mt-2 bg-white p-4 rounded-xs">
                          <ul class="list-disc pl-5 text-gray-600 space-y-2">
                            <li>
                              Full payment is required at the time of booking.
                            </li>
                            <li>
                              Cancellations within 48 hours of the trip will
                              incur a 50% fee.
                            </li>
                            <li>
                              Participants must adhere to the guide's
                              instructions at all times.
                            </li>
                            <li>
                              The company is not liable for personal injuries or
                              lost belongings during the trip.
                            </li>
                            <li>
                              Travel insurance is recommended but not included.
                            </li>
                          </ul>
                        </div>
                      </Show>
                    </section>

                    {/* A Few Things You'll Need Section */}
                    <section class="bg-yellow-100 p-4 rounded-xs shadow-md">
                      <button
                        class="w-full text-left text-lg font-semibold text-gray-800 flex items-center justify-between"
                        onClick={() => toggleSection("thingsNeeded")}
                      >
                        A Few Things You'll Need
                        <span>
                          {expandedSections().thingsNeeded ? "▲" : "▼"}
                        </span>
                      </button>
                      <Show when={expandedSections().thingsNeeded}>
                        <div class="mt-2 bg-white p-4 rounded-xs">
                          <ul class="list-disc pl-5 text-gray-600 space-y-2">
                            <li>Comfortable walking shoes</li>
                            <li>
                              Lightweight clothing suitable for warm weather
                            </li>
                            <li>Sunscreen and a hat for sun protection</li>
                            <li>A reusable water bottle</li>
                            <li>A small backpack for personal items</li>
                          </ul>
                        </div>
                      </Show>
                    </section>

                    {/* What's Included & Not Section */}
                    <section class="bg-yellow-100 p-4 rounded-xs shadow-md">
                      <button
                        class="w-full text-left text-lg font-semibold text-gray-800 flex items-center justify-between"
                        onClick={() => toggleSection("includedNot")}
                      >
                        What's Included & Not
                        <span>
                          {expandedSections().includedNot ? "▲" : "▼"}
                        </span>
                      </button>
                      <Show when={expandedSections().includedNot}>
                        <div class="mt-2 bg-white p-4 rounded-xs">
                          <h3 class="text-md font-semibold text-gray-800 mb-2">
                            Included:
                          </h3>
                          <ul class="list-disc pl-5 text-gray-600 space-y-2 mb-4">
                            <li>Transportation to and from destinations</li>
                            <li>Accommodation as listed</li>
                            <li>Guided tours at each destination</li>
                            <li>Breakfast and lunch on travel days</li>
                          </ul>
                          <h3 class="text-md font-semibold text-gray-800 mb-2">
                            Not Included:
                          </h3>
                          <ul class="list-disc pl-5 text-gray-600 space-y-2">
                            <li>Personal expenses (e.g., souvenirs)</li>
                            <li>Dinner meals</li>
                            <li>Travel insurance</li>
                            <li>Tips for guides and drivers</li>
                          </ul>
                        </div>
                      </Show>
                    </section>
                  </div>

                  {/* Sidebar */}
                  <div class="lg:col-span-1">
                    <div class="sticky top-20 space-y-6">
                      {/* Booking Card */}
                      <div class="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-xs shadow-md ">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">
                          Book This Package
                        </h3>
                        <p class="text-gray-600 text-sm mb-4">
                          Secure your spot for an unforgettable adventure!
                        </p>
                        <button
                          onClick={handleBookNow}
                          disabled={isBooking()}
                          class="w-full bg-blue-600 text-white py-3 rounded-xs hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isBooking() ? (
                            <>
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
                            </>
                          ) : (
                            "Book Now"
                          )}
                        </button>
                      </div>

                      {/* Map Card */}
                      <div class="bg-white bg-opacity-80 backdrop-blur-md p-4 rounded-xs shadow-md ">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">
                          Location
                        </h3>
                        <Show
                          when={packageData().destinations?.length > 0}
                          fallback={
                            <p class="text-gray-600 text-sm">
                              No location map available.
                            </p>
                          }
                        >
                          <div class="flex flex-wrap gap-2 mb-4 overflow-x-auto">
                            <For each={packageData().destinations}>
                              {(dest) => (
                                <button
                                  class="bg-yellow-200 text-gray-800 px-3 py-1 rounded-xs hover:bg-yellow-300 transition-colors"
                                  onClick={() =>
                                    setSelectedMapUrl(dest.locationUrl || "#")
                                  }
                                >
                                  {dest.destinationName}
                                </button>
                              )}
                            </For>
                          </div>
                          <iframe
                            src={
                              selectedMapUrl() ||
                              packageData().destinations[0]?.locationUrl
                            }
                            width="100%"
                            height="300"
                            style={{ border: "0" }}
                            allowfullscreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            class="rounded-xs"
                          />
                        </Show>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Show>
      </main>
      <Footer />
    </div>
  );
};

export default PackageDetail;
