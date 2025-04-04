import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Malesiya from "../assets/malesiya.webp";
import Philippines from "../assets/philippines.jpg";
import Visayas from "../assets/visayas.webp";

function Home() {
  const destinations = [
    {
      title: "Sunny Lake",
      image: Malesiya,
      alt: "Sunny Lake in Malaysia with crystal clear waters",
      description: "Set sail on a relaxing journey across Sunny Lake's crystal clean waters. Enjoy panoramic views of lush forests and wildlife, and capture stunning photos of the surrounding mountains."
    },
    {
      title: "Mountain Valley",
      image: Philippines,
      alt: "Scenic Mountain Valley in the Philippines",
      description: "Experience the breathtaking views of Mountain Valley's lush greenery. Perfect for hiking enthusiasts and nature lovers seeking tranquility."
    },
    {
      title: "Desert Dunes",
      image: Visayas,
      alt: "Vast Desert Dunes in Visayas region",
      description: "Explore the vastness of Desert Dunes and its golden sands. An unforgettable adventure for those seeking unique landscapes and starlit nights."
    }
  ];

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />
      
      <main class="flex-grow pt-16">
        {/* Hero Section */}
        <section class="bg-blue-50 py-16 px-4 text-center">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">Welcome to Paradise Tours</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the world's most breathtaking destinations with our expertly curated tours
          </p>
        </section>

        {/* Destinations Section */}
        <section class="container mx-auto py-12 px-4">
          <h2 class="text-3xl font-semibold text-center mb-12">Featured Destinations</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination) => (
              <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div class="h-64 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.alt}
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="p-6">
                  <h3 class="text-xl font-bold mb-3">{destination.title}</h3>
                  <p class="text-gray-600 mb-4">{destination.description}</p>
                  <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                    Explore Tour
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section class="bg-blue-50 text-gray-800 py-12 px-4 text-center">
          <h2 class="text-2xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p class="mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who've experienced the trip of a lifetime with us
          </p>
          <button class="bg-white text-gray-900 hover:bg-amber-200 px-6 py-3 rounded-lg font-semibold transition-colors">
            Book Your Tour Today
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;