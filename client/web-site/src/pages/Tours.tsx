import { createResource, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Filter from "../components/Filter";

const apiUrl = import.meta.env.VITE_API_URL;

// Skeleton loader component for individual cards
const CardSkeleton = () => (
  <div class="bg-gray-200 rounded-xs overflow-hidden h-full animate-pulse">
    <div class="w-full h-[300px] bg-gray-300"></div>
  </div>
);

function Tours() {
  const [tours] = createResource(async () => {
    const res = await fetch(`${apiUrl}/api/contents/tours`);
    if (!res.ok) throw new Error("Failed to fetch tours");
    return res.json();
  });

  return (
    <div class="min-h-screen flex flex-col bg-gray-50">
      <style>
        {`
          .custom-shadow:hover {
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.4);
          }
        `}
      </style>
      <Navbar />
      <main class="flex-grow pt-16">
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-4xl font-extrabold text-gray-800 mb-4 text-center tracking-tight">
            Explore Our Tours
          </h1>
          <Filter />
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Show
              when={tours()}
              fallback={<For each={Array(6)}>{() => <CardSkeleton />}</For>}
            >
              {(tourList) => (
                <For each={tourList()}>
                  {(tour) => (
                    <A href={`/tours/${tour.tour_id}`} class="block h-full">
                      <div class="bg-white rounded-xs shadow-md overflow-hidden custom-shadow transition-shadow duration-300 h-full">
                        <div class="relative w-full h-[340px] aspect-[2/3]">
                          <img
                            src={tour.picture_url}
                            alt={tour.activity}
                            class="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {/* Gradient Overlay for Text Readability */}
                          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          {/* Title and View Link */}
                          <div class="absolute bottom-4 left-4 right-4">
                            <h2 class="text-3xl font-semibold text-white line-clamp-1 mb-1">
                              {tour.activity || "Loading..."}
                            </h2>
                            <span class="text-sm text-white font-medium hover:text-amber-300 transition-colors flex items-center gap-1">
                              View
                              <span>&rarr;</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </A>
                  )}
                </For>
              )}
            </Show>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Tours;
