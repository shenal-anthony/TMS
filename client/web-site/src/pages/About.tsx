import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />

      <main class="flex-grow pt-16">
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-4xl font-bold mb-4 text-center">About Us</h1>

          <p class="text-lg leading-relaxed mb-6 text-justify">
            Welcome to our tourism website – your gateway to unforgettable
            adventures and inspiring destinations. We are passionate about
            connecting travelers with the beauty, culture, and excitement that
            each location has to offer.
          </p>

          <p class="text-lg leading-relaxed mb-6 text-justify">
            Whether you're looking to explore breathtaking landscapes, discover
            rich heritage sites, or relax in hidden gems off the beaten path,
            our platform is designed to help you plan your perfect trip. We
            offer detailed travel guides, curated experiences, and practical
            tips to make your journey seamless and memorable.
          </p>

          <h2 class="text-2xl font-semibold mb-2">Our Mission</h2>
          <p class="text-lg leading-relaxed mb-6 text-justify">
            Our mission is to inspire and empower travelers by providing
            reliable information, expert recommendations, and a touch of local
            insight. We believe that travel is not just about reaching a
            destination, but about experiencing something new, meaningful, and
            enriching.
          </p>

          <h2 class="text-2xl font-semibold mb-2">Why Choose Us?</h2>
          <ul class="list-disc pl-6 text-lg leading-relaxed text-justify mb-6">
            <li>Up-to-date guides and travel tips</li>
            <li>Handpicked destinations and activities</li>
            <li>Local insights and hidden treasures</li>
            <li>Easy planning and customizable itineraries</li>
          </ul>

          <p class="text-lg leading-relaxed text-justify">
            Start your adventure today and let us help you create memories that
            will last a lifetime. Your journey begins here.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default About;
