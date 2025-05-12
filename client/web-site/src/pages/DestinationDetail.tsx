import {
  createResource,
  Show,
  createSignal,
  For,
  createEffect,
} from "solid-js";
import { useParams } from "@solidjs/router";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const apiUrl = import.meta.env.VITE_API_URL;
const weatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

const DestinationDetail = () => {
  const params = useParams();
  const [modalOpen, setModalOpen] = createSignal(false);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [weather, setWeather] = createSignal("Loading...");

  const [destination] = createResource(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/contents/destination/${params.id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching destination:", error);
      return null;
    }
  });

  createEffect(async () => {
    const dest = destination();
    if (dest && dest.latitude && dest.longitude) {
      try {
        const res = await axios.get(
          "https://api.openweathermap.org/data/2.5/weather",
          {
            params: {
              lat: dest.latitude,
              lon: dest.longitude,
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
    }
  });

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const nextImage = (length: number) =>
    setCurrentIndex((prev) => (prev + 1) % length);

  const prevImage = (length: number) =>
    setCurrentIndex((prev) => (prev === 0 ? length - 1 : prev - 1));

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />
      <main class="flex-grow pt-16">
        <Show
          when={destination()}
          fallback={<div class="text-center py-20">Loading destination...</div>}
        >
          {(data) => {
            const images = [
              data().picture_url,
              "https://placekitten.com/1200/800", // Replace with real images if needed
            ];

            return (
              <div class="container mx-auto px-4 py-8">
                <section class="mb-12">
                  <h1 class="text-4xl font-bold mb-4">
                    {data().destination_name}
                  </h1>
                  <p class="text-xl text-gray-600">{data().description}</p>
                </section>

                {/* GALLERY SECTION */}
                <section class="mb-12">
                  <h2 class="text-2xl font-bold mb-4">Photo Gallery</h2>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <For each={images}>
                      {(img, index) => (
                        <img
                          src={img}
                          alt={`Image ${index() + 1}`}
                          class="w-full h-48 object-cover rounded shadow cursor-pointer"
                          onClick={() => openModal(index())}
                        />
                      )}
                    </For>
                  </div>
                </section>

                <Show when={modalOpen()}>
                  <div class="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
                    <button
                      class="absolute top-4 right-4 text-white text-3xl"
                      onClick={closeModal}
                    >
                      &times;
                    </button>

                    <div class="relative flex items-center justify-center w-full max-w-4xl px-4">
                      <button
                        class="absolute left-0 text-white text-5xl px-4 py-2 hover:text-yellow-400"
                        onClick={() => prevImage(images.length)}
                      >
                        &#60;
                      </button>

                      <img
                        src={images[currentIndex()]}
                        class="max-h-[80vh] object-contain rounded shadow transition duration-300 ease-in-out"
                        alt={`Image ${currentIndex() + 1}`}
                      />

                      <button
                        class="absolute right-0 text-white text-5xl px-4 py-2 hover:text-yellow-400"
                        onClick={() => nextImage(images.length)}
                      >
                        &#62;
                      </button>
                    </div>

                    <div class="mt-4 flex space-x-2">
                      <For each={images}>
                        {(_, index) => (
                          <span
                            class={`w-3 h-3 rounded-full ${
                              index() === currentIndex()
                                ? "bg-yellow-400"
                                : "bg-gray-400"
                            }`}
                          ></span>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>

                {/* Weather and Map */}
                <section class="mb-12">
                  <h2 class="text-2xl font-bold mb-4">Weather Now</h2>
                  <p>{weather()}</p>
                </section>

                <section class="mb-12">
                  <h2 class="text-2xl font-bold mb-4">Map Location</h2>
                  <iframe
                    src={data().location_url}
                    width="100%"
                    height="300"
                    style={{ border: "0" }}
                    allowfullscreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    class="rounded shadow"
                  ></iframe>
                </section>
              </div>
            );
          }}
        </Show>
      </main>
      <Footer />
    </div>
  );
};

export default DestinationDetail;
