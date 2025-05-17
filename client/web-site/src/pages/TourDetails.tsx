import {
  createResource,
  For,
  Show,
  ErrorBoundary,
  createSignal,
  onMount,
} from "solid-js";
import { useParams, useNavigate, A } from "@solidjs/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

function TourDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = createSignal(false);
  const [dialogUrl, setDialogUrl] = createSignal("");
  const [selectedMapUrl, setSelectedMapUrl] = createSignal("");
  const [activeImageIndices, setActiveImageIndices] = createSignal<
    Record<number, number>
  >({});

  let scrollContainerRef: HTMLDivElement | undefined;

  const scrollHorizontally = (e: WheelEvent) => {
    const container = e.currentTarget as HTMLElement;
    if (e.deltaY === 0) return;
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  };

  const [tourData] = createResource(async () => {
    const res = await axios.get(`${apiUrl}/api/contents/tours/${params.id}`);
    if (!res) throw new Error("Failed to fetch tour details");
    return res.data;
  });

  const [relatedPackages] = createResource(async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/api/contents/related_packages/${params.id}`
      );
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error fetching related packages:", error);
      return [];
    }
  });

  const openLocationPreview = (url: any) => {
    setDialogUrl(url || "#");
    setShowDialog(true);
  };

  const handleDestinationClick = (destinationId: number) => {
    navigate(`/destination/${destinationId}`);
  };

  const nextImage = (accommodationId: number) => {
    setActiveImageIndices((prev) => {
      const currentIndex = prev[accommodationId] || 0;
      const images =
        tourData()?.accommodations.find(
          (a: { id: number }) => a.id === accommodationId
        )?.picture_urls || [];
      return { ...prev, [accommodationId]: (currentIndex + 1) % images.length };
    });
  };

  const prevImage = (accommodationId: number) => {
    setActiveImageIndices((prev) => {
      const currentIndex = prev[accommodationId] || 0;
      const images =
        tourData()?.accommodations.find(
          (a: { id: number }) => a.id === accommodationId
        )?.picture_urls || [];
      return {
        ...prev,
        [accommodationId]: (currentIndex - 1 + images.length) % images.length,
      };
    });
  };

  onMount(() => {
    if (scrollContainerRef) {
      const container = scrollContainerRef;

      const handleWheel = (e: WheelEvent) => {
        const atStart = container.scrollLeft === 0;
        const atEnd =
          container.scrollLeft + container.clientWidth >= container.scrollWidth;
        const scrollingRight = e.deltaY > 0;
        const scrollingLeft = e.deltaY < 0;

        const shouldScrollHorizontally =
          (scrollingRight && !atEnd) || (scrollingLeft && !atStart);

        if (shouldScrollHorizontally) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
        // else: vertical scroll allowed
      };

      container.addEventListener("wheel", handleWheel, { passive: false });

      // Optional cleanup
      return () => container.removeEventListener("wheel", handleWheel);
    }
  });

  return (
    <div class="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main class="flex-grow pt-16">
        <div class="relative w-screen h-90 overflow-hidden rounded-xs -mx-[calc(50vw-50%)]">
          <div class="absolute inset-0 bg-gradient-to-b from-black to-gray-800 opacity-70 z-10" />
          <div class="relative w-full h-full">
            <img
              src={tourData()?.tourData?.picture_url}
              alt={tourData()?.tourData?.activity}
              class="absolute top-0 left-0 w-full object-cover"
            />
            <div class="relative flex items-center justify-center w-full h-full z-20">
              <div class="h-90 w-3/4">
                <img
                  src={tourData()?.tourData?.picture_url}
                  alt={tourData()?.tourData?.activity}
                  class="w-full h-full object-contain rounded-xs shadow-lg"
                />
              </div>
            </div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center z-30">
            <div class="text-center">
              <h1 class="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">
                {tourData()?.tourData?.activity}
              </h1>
              <p class="text-lg text-white opacity-90">
                {tourData()?.destinations[0]?.destination_name || "Explore"}
              </p>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-2 py-3">
          <nav class="text-sm text-gray-600">
            <ol class="flex items-center space-x-1.5">
              <li>
                <A href="/" class="hover:text-blue-600 font-medium">
                  Home
                </A>
              </li>
              <li class="text-gray-400">/</li>
              <li>
                <A href="/tours" class="hover:text-blue-600 font-medium">
                  Tours
                </A>
              </li>
              <li class="text-gray-400">/</li>
              <li class="font-semibold text-blue-800 truncate max-w-[160px]">
                {tourData()?.tourData?.activity}
              </li>
            </ol>
          </nav>
        </div>

        <div class="container mx-auto px-4 max-w-7xl">
          <ErrorBoundary
            fallback={
              <div class="text-red-500 text-center">
                Error loading tour details. Please try again.
              </div>
            }
          >
            <Show
              when={tourData()}
              fallback={
                <div class="animate-pulse bg-gray-200 h-80 rounded-xs"></div>
              }
            >
              {(data) => (
                <div>
                  {/* Destinations Section */}
                  <section class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2">
                      <h2 class="text-2xl font-semibold mb-4">
                        Destinations we are going to cover...
                      </h2>
                      <Show
                        when={data().destinations.length > 0}
                        fallback={
                          <p class="text-gray-600">
                            No destinations available for this tour.
                          </p>
                        }
                      >
                        <div
                          ref={scrollContainerRef}
                          onWheel={scrollHorizontally}
                          class="overflow-x-auto flex gap-6 pb-4 scroll-smooth scrollbar-hide"
                        >
                          <For each={data().destinations}>
                            {(destination) => (
                              <div
                                class="bg-yellow-100 rounded-xs shadow-md hover:shadow-lg transition-shadow cursor-pointer min-w-[380px] max-w-[380px]"
                                onClick={() =>
                                  handleDestinationClick(
                                    destination.destination_id
                                  )
                                }
                              >
                                <img
                                  src={destination.picture_url}
                                  alt={destination.destination_name}
                                  class="h-80 w-full object-cover rounded-xs"
                                />
                                <div class="pr-4 pt-2 pl-4 pb-2">
                                  <h3 class="text-xl text-amber-950 font-semibold pt-2">
                                    {destination.destination_name}
                                  </h3>
                                  <p
                                    class="text-gray-600 pt-1"
                                    style="text-align: justify;"
                                  >
                                    {destination.description}
                                  </p>
                                  <p class="text-amber-900 pt-2">
                                    Weather:{" "}
                                    {destination.weather_condition || "N/A"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </For>

                          <Show when={data().destinations.length === 1}>
                            <div class="bg-gradient-to-tr from-blue-100 to-amber-100 rounded-xs shadow-inner min-w-[380px] max-w-[380px] flex flex-col justify-center items-center p-6 text-center">
                              <h3 class="text-lg font-bold text-gray-800 mb-2">
                                Just one gem for now
                              </h3>
                              <p class="text-gray-600 italic">
                                "Sometimes, one destination is all you need to
                                spark the adventure. More wonders await!"
                              </p>
                            </div>
                          </Show>
                        </div>
                      </Show>
                    </div>
                    <Show when={data().destinations.length > 0}>
                      <div class="lg:col-span-1">
                        <h2 class="text-2xl font-semibold mb-4">
                          Location Preview
                        </h2>
                        <div class="mb-4 flex flex-wrap gap-2">
                          <For each={data().destinations}>
                            {(destination) => (
                              <button
                                class="bg-yellow-200 text-gray-800 px-3 py-1 rounded-xs hover:bg-yellow-300"
                                onClick={() =>
                                  setSelectedMapUrl(
                                    destination.location_url || "#"
                                  )
                                }
                              >
                                {destination.destination_name}
                              </button>
                            )}
                          </For>
                        </div>
                        <iframe
                          src={
                            selectedMapUrl() ||
                            data().destinations[0]?.location_url ||
                            "#"
                          }
                          class="w-full h-96 rounded-xs border-0"
                          title="Location Preview"
                        />
                      </div>
                    </Show>
                  </section>

                  {/* Accommodations Section */}
                  <section class="mt-8">
                    <h2 class="text-2xl font-semibold mb-4">
                      Accommodations That Find Throughout the Journey
                    </h2>
                    <Show
                      when={data().accommodations.length > 0}
                      fallback={
                        <p class="text-gray-600">
                          No accommodations available for this tour.
                        </p>
                      }
                    >
                      <div class="grid gap-6 grid-cols-1 w-full">
                        <For each={data().accommodations}>
                          {(accommodation) => (
                            <div class="w-full bg-yellow-100 rounded-xs shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col sm:flex-row gap-8 justify-center items-center">
                              {/* Details Square */}
                              <div class="aspect-square w-full sm:w-[300px] flex flex-col justify-around bg-yellow-100 p-4 rounded">
                                <h3 class="text-xl font-semibold text-left">
                                  {accommodation.accommodation_name}
                                </h3>
                                <p class="text-gray-600 text-left">
                                  Type:{" "}
                                  {accommodation.accommodation_type || "N/A"}
                                </p>
                                <div class="text-gray-600">
                                  <p class="font-semibold text-left">
                                    Amenities:
                                  </p>
                                  <ul class="list-disc pl-5 text-sm">
                                    <For
                                      each={accommodation.amenities
                                        ?.replace(/\r\n/g, "\n")
                                        .split("\n")
                                        .filter((item: string) => item.trim())}
                                    >
                                      {(amenity) => <li>{amenity}</li>}
                                    </For>
                                  </ul>
                                </div>
                                <div class="mt-2 text-left">
                                  <button
                                    onClick={() =>
                                      openLocationPreview(
                                        accommodation.location_url
                                      )
                                    }
                                    class="text-blue-500 hover:underline"
                                  >
                                    Preview Location
                                  </button>
                                </div>
                              </div>

                              {/* Image Square */}
                              <div class="w-full sm:w-[300px] flex flex-col items-center gap-2">
                                <div class="aspect-square w-full relative">
                                  <Show
                                    when={
                                      accommodation.picture_urls?.length > 0
                                    }
                                    fallback={
                                      <div class="w-full h-full flex justify-center items-center bg-gray-200 rounded">
                                        <img
                                          src={accommodation.picture_url}
                                          alt={accommodation.accommodation_name}
                                          class="w-full h-full object-cover rounded-xs"
                                        />
                                      </div>
                                    }
                                  >
                                    <div class="w-full h-full flex justify-center items-center">
                                      <img
                                        src={
                                          accommodation.picture_urls[
                                            activeImageIndices()[
                                              accommodation.id
                                            ] || 0
                                          ]
                                        }
                                        alt={accommodation.accommodation_name}
                                        class="w-full h-full object-cover rounded-xs"
                                      />
                                    </div>

                                    {/* Arrows - Show only if > 1 image */}
                                    <Show
                                      when={
                                        accommodation.picture_urls.length > 1
                                      }
                                    >
                                      <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                        <button
                                          onClick={() =>
                                            prevImage(accommodation.id)
                                          }
                                          class="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                        >
                                          ←
                                        </button>
                                        <button
                                          onClick={() =>
                                            nextImage(accommodation.id)
                                          }
                                          class="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                        >
                                          →
                                        </button>
                                      </div>
                                    </Show>
                                  </Show>
                                </div>

                                {/* Dot Navigation - Now Below Image */}
                                <div class="flex justify-center gap-2 mt-1">
                                  <For each={accommodation.picture_urls}>
                                    {(_, index) => (
                                      <div
                                        class={`w-3 h-3 rounded-full border border-gray-300 transition-colors duration-200 ${
                                          index() ===
                                          (activeImageIndices()[
                                            accommodation.id
                                          ] || 0)
                                            ? "bg-gray-800"
                                            : "bg-gray-300"
                                        }`}
                                      />
                                    )}
                                  </For>
                                </div>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </section>

                  {/* Related Packages Section */}
                  <section class="mt-8">
                    <h2 class="text-2xl font-semibold mb-4">
                      Related Packages
                    </h2>
                    <Show
                      when={(relatedPackages() ?? []).length > 0}
                      fallback={
                        <p class="text-gray-600">
                          No related packages available for this tour.
                        </p>
                      }
                    >
                      <div class="space-y-6 max-w-3xl mx-auto">
                        <For each={relatedPackages()}>
                          {(pkg) => (
                            <div class="bg-yellow-100 rounded-xs shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col sm:flex-row gap-4">
                              <div class="sm:w-1/2">
                                <h3 class="text-xl font-semibold">
                                  {pkg.package_name}
                                </h3>
                                <p class="text-gray-600">
                                  {pkg.description || "N/A"}
                                </p>
                                <div class="mt-2">
                                  <button
                                    onClick={() =>
                                      navigate(`/tours/${pkg.package_id}`)
                                    }
                                    class="text-blue-500 hover:underline"
                                  >
                                    View Package
                                  </button>
                                </div>
                              </div>
                              <div class="sm:w-1/2"></div>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </section>
                </div>
              )}
            </Show>
          </ErrorBoundary>

          {/* Location Preview Dialog */}
          <Show when={showDialog()}>
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div class="bg-white rounded-xs p-4 w-11/12 md:w-3/4 lg:w-1/2 max-h-[80vh]">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-xl font-semibold">Location Preview</h2>
                  <button
                    onClick={() => setShowDialog(false)}
                    class="text-gray-600 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
                <iframe
                  src={dialogUrl()}
                  class="w-full h-[60vh] rounded-xs border-0"
                  title="Location Preview"
                />
              </div>
            </div>
          </Show>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TourDetails;
