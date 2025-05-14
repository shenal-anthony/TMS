import { createResource } from "solid-js";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useNavigate } from "@solidjs/router";

function Home() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch tours data (limit to 2)
  const [tours] = createResource(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/contents/tours`);
      return Array.isArray(res.data) ? res.data.slice(0, 2) : [];
    } catch (error) {
      console.error("Error fetching tours:", error);
      return [];
    }
  });

  // Fetch destinations data (limit to 3)
  const [destinations] = createResource(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/contents/destinations`);
      return Array.isArray(response.data) ? response.data.slice(0, 3) : [];
    } catch (error) {
      console.error("Error fetching destinations:", error);
      return [];
    }
  });

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />

      <main class="flex-grow pt-16">
        {/* Hero Section */}
        <section class="bg-blue-50 py-16 px-4 text-center">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">
            Welcome to Paradise of Tours
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover Sri Lanka's most breathtaking destinations with our
            expertly curated tours.
          </p>
        </section>

        {/* Destinations Section */}
        <section class="container mx-auto py-12 px-4">
          <h2 class="text-3xl font-semibold text-center mb-12">
            Featured Destinations
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations()?.map((destination) => (
              <div class="bg-white/30 backdrop-blur-md rounded-xs overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div class="h-80 w-full overflow-hidden rounded-xs">
                  <img
                    src={destination.picture_url}
                    alt={destination.destination_name}
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="p-6">
                  <h3 class="text-xl font-bold mb-3">
                    {destination.destination_name}
                  </h3>
                  <p class="text-gray-600 mb-4 line-clamp-2">
                    {destination.description}
                  </p>
                  <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xs transition-colors w-full">
                    Explore Destination
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tours Section */}
        <section class="container mx-auto py-12 px-4">
          <h2 class="text-3xl font-semibold text-center mb-12">
            Featured Tours
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours()?.map((tour) => (
              <div class="bg-white/30 backdrop-blur-md rounded-xs overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div class="h-80 w-full overflow-hidden rounded-xs">
                  <img
                    src={tour.picture_url}
                    alt={tour.activity}
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="p-6">
                  <h3 class="text-xl font-bold mb-3">{tour.activity}</h3>
                  <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xs transition-colors w-full">
                    Explore Tour
                  </button>
                </div>
              </div>
            ))}
            {/* Explore More Card */}
            <div class="bg-white/30 backdrop-blur-md rounded-xs overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div class="h-80 w-full overflow-hidden rounded-xs bg-gradient-to-br from-blue-200 to-amber-200 flex items-center justify-center">
                <div class="text-center p-6">
                  <h3 class="text-xl font-bold mb-3 text-gray-800">
                    Explore More
                  </h3>
                  <p class="text-gray-600 italic mb-4">
                    "The world is full of magic things, patiently waiting for
                    our senses to grow sharper."
                  </p>
                  <button
                    onClick={() => navigate("/tours")}
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xs transition-colors w-full"
                  >
                    Discover More Tours
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section class="bg-blue-50 text-gray-800 py-12 px-4 text-center">
          <h2 class="text-2xl font-bold mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p class="mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who've experienced the trip of
            a lifetime with us
          </p>
          <button
            onClick={() => navigate("/packages")}
            class="bg-white text-gray-900 hover:bg-amber-200 px-6 py-3 rounded-xs font-semibold transition-colors"
          >
            Book Your Tour Today
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
