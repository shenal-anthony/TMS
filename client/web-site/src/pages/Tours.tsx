import { createResource, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Filter from "../components/Filter";

const apiUrl = import.meta.env.VITE_API_URL;

function Tours() {
  const [tours] = createResource(async () => {
    const res = await fetch(`${apiUrl}/api/contents/tours`);
    if (!res.ok) throw new Error("Failed to fetch tours");
    return res.json();
  });

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />
      <main class="flex-grow pt-16">
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-4xl font-bold mb-4">Explore Our Tours</h1>
          <Filter />
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Show
              when={tours()}
              fallback={
                <For each={Array(6)}>
                  {() => (
                    <div class="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
                  )}
                </For>
              }
            >
              {(tourList) => (
                <For each={tourList()}>
                  {(tour) => (
                    <A href={`/tours/${tour.tour_id}`} class="block">
                      <div class="bg-white rounded-xs shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <img
                          src={tour.picture_url}
                          alt={tour.activity}
                          class="h-48 w-full object-cover"
                        />
                        <div class="p-4">
                          <h2 class="text-xl font-semibold">{tour.activity}</h2>
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