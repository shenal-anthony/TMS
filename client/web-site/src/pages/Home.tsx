import { createResource, For, Show } from "solid-js";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useNavigate } from "@solidjs/router";
import { Motion } from "@motionone/solid";

function Home() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [tours] = createResource(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/contents/tours`);
      return Array.isArray(res.data) ? res.data.slice(0, 2) : [];
    } catch (error) {
      console.error("Error fetching tours:", error);
      return [];
    }
  });

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
    <div class="min-h-screen flex flex-col font-sans bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <main class="flex-grow pt-16">
        {/* Hero Section */}
        <section class="sky-hero py-32 px-4 text-center text-white relative">
          <div class="  py-10 px-4 rounded-xs max-w-4xl mx-auto">
            <h1 class="text-5xl md:text-6xl font-extrabold mb-6 text-bottom-glow">
              Welcome to Paradise of Tours
            </h1>
            <p class="text-2xl text-gray-100 max-w-3xl mx-auto italic">
              Discover Sri Lanka's most breathtaking destinations with our
              curated adventures.
            </p>
          </div>
        </section>

        {/* Destinations Section */}
        <section class="container mx-auto py-16 px-4">
          <h2 class="text-4xl font-bold text-center mb-12 text-gray-750">
            Featured Destinations
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <Show when={destinations()}>
              <For each={destinations()}>
                {(destination) => (
                  <Motion.div
                    class="bg-white rounded-xs shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 backdrop-blur-lg"
                    animate={{ opacity: [0, 1], y: [-20, 0] }}
                    transition={{ duration: 0.6 }}
                  >
                    <img
                      src={destination.picture_url}
                      alt={destination.destination_name}
                      class="h-64 w-full object-cover"
                      loading="lazy"
                    />
                    <div class="p-6">
                      <h3 class="text-2xl font-bold mb-2 text-blue-800">
                        {destination.destination_name}
                      </h3>
                      <p class="text-gray-600 mb-4 line-clamp-3">
                        {destination.description}
                      </p>
                      <button
                        onClick={() =>
                          navigate(`/destination/${destination.destination_id}`)
                        }
                        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xs w-full transition duration-300"
                      >
                        Explore Destination
                      </button>
                    </div>
                  </Motion.div>
                )}
              </For>
            </Show>
          </div>
        </section>

        {/* Tours Section */}
        <section class="container mx-auto py-16 px-4">
          <h2 class="text-4xl font-bold text-center mb-12 text-gray-750">
            Featured Tours
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <Show when={tours()}>
              <For each={tours()}>
                {(tour) => (
                  <Motion.div
                    class="bg-white rounded-xs shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 backdrop-blur-lg"
                    animate={{ opacity: [0, 1], y: [-20, 0] }}
                    transition={{ duration: 0.6 }}
                  >
                    <img
                      src={tour.picture_url}
                      alt={tour.activity}
                      class="h-64 w-full object-cover"
                      loading="lazy"
                    />
                    <div class="p-6">
                      <h3 class="text-2xl font-bold mb-3 text-blue-800">
                        {tour.activity}
                      </h3>
                      <button
                        onClick={() => navigate(`/tours/${tour.tour_id}`)}
                        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xs w-full transition duration-300"
                      >
                        Explore Tour
                      </button>
                    </div>
                  </Motion.div>
                )}
              </For>
            </Show>

            {/* Explore More Card */}
            <Motion.div
              class="rounded-xs shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-tr from-blue-200 to-amber-200 hover:from-amber-300 hover:to-blue-300"
              animate={{ opacity: [0, 1], y: [-20, 0] }}
              transition={{ duration: 0.8 }}
            >
              <div class="h-full w-full flex items-center justify-center p-6 text-center">
                <div>
                  <h3 class="text-2xl font-bold mb-3 text-gray-800">
                    Explore More
                  </h3>
                  <p class="text-gray-700 italic mb-4">
                    "The world is full of magic things, patiently waiting for
                    our senses to grow sharper."
                  </p>
                  <button
                    onClick={() => navigate("/tours")}
                    class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xs w-full transition duration-300"
                  >
                    Discover More Tours
                  </button>
                </div>
              </div>
            </Motion.div>
          </div>
        </section>

        {/* Call to Action */}
        <section class="bg-gradient-to-r from-blue-100 to-amber-100 py-16 px-4 text-center text-gray-900">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p class="mb-6 max-w-2xl mx-auto text-lg">
            Join thousands of satisfied travelers who've experienced the trip of
            a lifetime with us.
          </p>
          <button
            onClick={() => navigate("/packages")}
            class="bg-white text-gray-900 hover:bg-amber-300 px-6 py-3 rounded-xs font-semibold transition-colors"
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
