import { createResource, For } from "solid-js";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import NewsLetter from "../components/NewsLetter";
import Filter from "../components/Filter";

const apiUrl = import.meta.env.VITE_API_URL;

const Destinations = () => {
 
  const [destinations] = createResource(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/tourists/destinations`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching destinations:", error);
      return [];
    }
  });

  return (
    <div>
      <Navbar />
      <div class="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold mb-4">Look at our Destinations</h1>

          {/* Filters */}
          <Filter />
         
        </div>

        {/* Destinations Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <For each={destinations()}>
            {(destination) => (
              <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div class="h-48 overflow-hidden">
                  <img
                    src={destination.picture_url}
                    alt={destination.destination_name}
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="p-6">
                  <h2 class="text-xl font-bold mb-3">
                    {destination.destination_name}
                  </h2>
                  <p class="text-gray-600 mb-4">{destination.description}</p>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">
                      {destination.weather_condition}
                    </span>
                    <button class="text-blue-600 hover:text-blue-800 font-medium">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Newsletter Section */}
        <NewsLetter/>
      </div>

      {/* Footer Section */}
      <Footer />

      {/* Optional: Add some styling for the destination cards */}
    </div>
  );
};

export default Destinations;
