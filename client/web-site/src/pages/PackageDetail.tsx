import { createResource, Show } from "solid-js";
import { useParams, A } from "@solidjs/router";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const apiUrl = import.meta.env.VITE_API_URL;

const PackageDetail = () => {
  const params = useParams();
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

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />

      <main class="flex-grow">
        <Show
          when={pkg()}
          fallback={<div class="text-center py-20">Loading pkg...</div>}
        >
          <div class="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <section class="mb-12">
              <h1 class="text-4xl font-bold mb-4">{pkg().package_name}</h1>
              <p class="text-xl text-gray-600">
                Explore the heart of {pkg().package_name}
              </p>
            </section>

            {/* Main Content */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2">
                {/* Description Section */}
                <section class="mb-12">
                  <p class="mb-6">{pkg().description}</p>
                </section>

                {/* Highlights Section */}
                <section class="mb-12">
                  <h2 class="text-2xl font-bold mb-4">
                    Comfortable, scenic, and unforgettable
                  </h2>
                  <p class="mb-6">
                    The boat is equipped with comfortable seating and outdoor
                    areas, ensuring a relaxing experience for everyone on board.
                  </p>
                </section>

                {/* Tour Info Section */}
                <section class="mb-12">
                  <h2 class="text-2xl font-bold mb-4">
                    Tour duration and booking information
                  </h2>
                  <p class="mb-6">
                    The tour lasts approximately 1.5 to 2 hours. Tours operate
                    daily from May to October, weather permitting.
                  </p>
                </section>

                {/* Call to Action */}
                <div class="bg-blue-50 p-6 rounded-lg mb-12">
                  <p class="font-bold mb-4">
                    Get a closer look at {pkg().package_name}'s crystal clear
                    waters. Enjoy the stunning views of lush forests and
                    wildlife.
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div class="lg:col-span-1">
                <div class="bg-gray-50 p-6 rounded-lg sticky top-4">
                  <h3 class="text-xl font-bold mb-4">Tour Packages</h3>
                  <table class="w-full mb-6">
                    <tbody>
                      <tr>
                        <td class="py-2">View on a map</td>
                        <td class="text-right">9</td>
                      </tr>
                      <tr>
                        <td class="py-2">(365) 152-4457</td>
                        <td class="text-right">0</td>
                      </tr>
                      <tr>
                        <td class="py-2">info@gmail.com</td>
                        <td class="text-right">☐</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3 class="text-xl font-bold mb-4">When to go</h3>
                  <p class="mb-6">
                    {pkg().package_name} experiences warm summers perfect for
                    water activities.
                  </p>

                  <A href="/news" class="text-blue-600 font-medium block mb-6">
                    Latest news →
                  </A>
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
