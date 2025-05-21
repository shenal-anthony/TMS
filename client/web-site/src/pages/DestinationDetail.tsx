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
import neg from "../assets/1720219-hd_1920_1080_25fps.mp4";
import matara from "../assets/2169879-hd_1920_1080_30fps.mp4";
import galle from "../assets/2169880-hd_1920_1080_30fps.mp4";
import batticloa from "../assets/2231485-hd_1920_1080_24fps.mp4";
import nuwara from "../assets/2324123-hd_1920_1080_30fps.mp4";
import jungle from "../assets/2330728-hd_1920_1080_24fps.mp4";
import kandy from "../assets/4471213-hd_1920_1080_30fps.mp4";
import neg2 from "../assets/5937356-hd_1366_684_30fps.mp4";


const apiUrl = import.meta.env.VITE_API_URL;
const weatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Manual mapping of destination IDs to video URLs
const videoMap: Record<number, string> = {
  6: neg,
  4: galle,
  5: nuwara,
  1: jungle,
  2: kandy,


};

const DestinationDetail = () => {
  const params = useParams();
  const [modalOpen, setModalOpen] = createSignal(false);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [weather, setWeather] = createSignal("Loading...");
  const [expandedSections, setExpandedSections] = createSignal({
    highlights: false,
    travelTips: false,
  });

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

  const toggleSection = (section: "highlights" | "travelTips") => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const images = () => {
    const data = destination();
    return data ? [data.picture_url] : [];
  };

  const getVideoUrl = () => {
    const destId = Number(destination()?.destination_id || params.id);
    return videoMap[destId];
  };

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />
      <main class="flex-grow pt-16 pb-8">
        <Show
          when={destination()}
          fallback={<div class="text-center py-20">Loading destination...</div>}
        >
          {(data) => (
            <div class="container mx-auto px-4">
              {/* Hero Section with Video */}
              <section class="relative w-screen h-[50vh] mb-8 overflow-hidden -mx-[calc(50vw-50%)]">
                <video
                  src={getVideoUrl()}
                  loop
                  autoplay
                  muted
                  playsinline
                  class="w-full h-full object-cover rounded-none"
                >
                  Your browser does not support the video tag.
                </video>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
                  <h1 class="text-5xl font-bold text-white drop-shadow-md">
                    {data().destination_name}
                  </h1>
                </div>
              </section>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div class="lg:col-span-2 space-y-6">
                  <section class="mb-10">
                    <h1 class="text-3xl font-bold mb-3">
                      {data().destination_name}
                    </h1>
                    <p class="text-lg text-gray-600">{data().description}</p>
                  </section>
                  {/* Weather Now */}
                  <section class="mb-12 bg-yellow-100 p-4 rounded-xs">
                    <h2 class="text-2xl font-bold mb-2">Weather Now</h2>
                    <p>{weather()}</p>
                  </section>

                  {/* GALLERY SECTION */}
                  <section class="mb-12">
                    <h2 class="text-2xl font-bold mb-4">Photo Gallery</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <For each={images()}>
                        {(img, index) => (
                          <img
                            src={img}
                            alt={`Image ${index() + 1}`}
                            class="w-full aspect-square object-cover rounded shadow cursor-pointer"
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
                        ×
                      </button>

                      <div class="relative flex items-center justify-center w-full max-w-4xl px-4">
                        <button
                          class="absolute left-0 text-white text-5xl px-4 py-2 hover:text-yellow-400"
                          onClick={() => prevImage(images().length)}
                        >
                          {"<"}
                        </button>

                        <img
                          src={images()[currentIndex()]}
                          class="max-h-[80vh] object-contain rounded shadow transition duration-300 ease-in-out"
                          alt={`Image ${currentIndex() + 1}`}
                        />

                        <button
                          class="absolute right-0 text-white text-5xl px-4 py-2 hover:text-yellow-400"
                          onClick={() => nextImage(images().length)}
                        >
                          {">"}
                        </button>
                      </div>

                      <div class="mt-4 flex space-x-2">
                        <For each={images()}>
                          {(_, index) => (
                            <span
                              class={`w-3 h-3 rounded-full ${
                                index() === currentIndex()
                                  ? "bg-yellow-400"
                                  : "bg-gray-400"
                              }`}
                            />
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Highlights Section */}
                  <section class="bg-yellow-100 p-4 rounded-xs shadow-md mb-6">
                    <button
                      class="w-full text-left text-lg font-semibold text-gray-800 flex items-center justify-between"
                      onClick={() => toggleSection("highlights")}
                    >
                      Highlights
                      <span>{expandedSections().highlights ? "▲" : "▼"}</span>
                    </button>
                    <Show when={expandedSections().highlights}>
                      <div class="mt-2 bg-white p-4 rounded-xs">
                        <ul class="list-disc pl-5 text-gray-600 space-y-2">
                          <li>Historic architecture and forts</li>
                          <li>Stunning coastal views</li>
                          <li>Rich cultural heritage</li>
                          <li>Local markets and cuisine</li>
                        </ul>
                      </div>
                    </Show>
                  </section>

                  {/* Travel Tips Section */}
                  <section class="bg-yellow-100 p-4 rounded-xs shadow-md mb-6">
                    <button
                      class="w-full text-left text-lg font-semibold text-gray-800 flex items-center justify-between"
                      onClick={() => toggleSection("travelTips")}
                    >
                      Travel Tips
                      <span>{expandedSections().travelTips ? "▲" : "▼"}</span>
                    </button>
                    <Show when={expandedSections().travelTips}>
                      <div class="mt-2 bg-white p-4 rounded-xs">
                        <ul class="list-disc pl-5 text-gray-600 space-y-2">
                          <li>Check weather forecasts before traveling</li>
                          <li>Wear comfortable shoes for walking tours</li>
                          <li>Carry local currency for small purchases</li>
                          <li>Stay hydrated, especially in hot weather</li>
                        </ul>
                      </div>
                    </Show>
                  </section>
                </div>

                {/* Sidebar with Map */}
                <div class="lg:col-span-1">
                  <div class="sticky top-20 space-y-6">
                    <section class="bg-white bg-opacity-80 backdrop-blur-md p-4 rounded-xs shadow-md">
                      <h2 class="text-xl font-bold text-gray-800 mb-4">
                        Map Location
                      </h2>
                      <iframe
                        src={data().location_url}
                        width="100%"
                        height="300"
                        style={{ border: "0" }}
                        allowfullscreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        class="rounded-xs"
                      />
                    </section>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Show>
      </main>
      <Footer />
    </div>
  );
};

export default DestinationDetail;
