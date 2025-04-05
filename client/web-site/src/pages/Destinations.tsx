import { createResource, createSignal, For, Show } from "solid-js";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import NewsLetter from "../components/NewsLetter";
import Filter from "../components/Filter";
import { A } from "@solidjs/router";

const apiUrl = import.meta.env.VITE_API_URL;
const [imageLoaded, setImageLoaded] = createSignal(false);

// Skeleton loader component for individual cards
const CardSkeleton = () => (
  <div class="bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col">
    <div class="h-48 w-full bg-gray-200 animate-pulse"></div>
    <div class="p-6 flex-grow flex flex-col">
      <div class="h-6 w-3/4 bg-gray-200 rounded mb-3 animate-pulse"></div>
      <div class="space-y-2 flex-grow">
        <div class="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div class="flex justify-between items-center mt-auto">
        <div class="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-6 w-1/4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

const Destinations = () => {
  const [destinations] = createResource(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/contents/destinations`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching destinations:", error);
      return [];
    }
  });

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />
      <main class="flex-grow pt-16">
        <div class="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold mb-4">Look at our Destinations</h1>
            <Filter />
          </div>

          {/* Destinations Grid */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Show
              when={!destinations.loading}
              fallback={
                <>
                  {[...Array(6)].map(() => (
                    <CardSkeleton />
                  ))}
                </>
              }
            >
              <For each={destinations()}>
                {(destination) => (
                  <A
                    href={`/destination/${destination.destination_id}`}
                    class="block h-full" // Important for proper link behavior
                  >
                    {/* Destination Card */}
                    <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                      <Show
                        when={destination.picture_url}
                        fallback={
                          <div class="h-48 w-full bg-gray-200 flex items-center justify-center">
                            <span class="text-gray-500">Loading image...</span>
                          </div>
                        }
                      >
                        {/* Image with fixed aspect ratio */}
                        <div class="h-48 overflow-hidden flex-shrink-0">
                          <img
                            src={destination.picture_url}
                            onLoad={() => setImageLoaded(true)}
                            classList={{
                              "opacity-0": !imageLoaded(),
                              "opacity-100 transition-opacity duration-300":
                                imageLoaded(),
                            }}
                          />
                        </div>
                      </Show>

                      {/* Card Content */}
                      <div class="p-6 flex-grow flex flex-col">
                        <h2 class="text-xl font-bold mb-3 line-clamp-1">
                          {destination.destination_name || (
                            <span class="text-gray-400 italic">
                              Loading title...
                            </span>
                          )}
                        </h2>
                        <p class="text-gray-600 mb-4 line-clamp-3 flex-grow">
                          {destination.description ||
                            "No description available"}
                        </p>
                        <div class="flex justify-between items-center ">
                          <span class="text-sm text-gray-500 line-clamp-2">
                            {destination.weather_condition || "No weather info"}
                          </span>
                          <button class="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </A>
                )}
              </For>
            </Show>
          </div>

          <NewsLetter />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Destinations;
