import { createResource, createSignal, For, Show, createMemo } from "solid-js";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Filter from "../components/Filter";
import { A } from "@solidjs/router";
import image from "../assets/IMG20230629104331.jpg";

const apiUrl = import.meta.env.VITE_API_URL;
const defaultImage = image;

// Skeleton loader component for individual cards
const CardSkeleton = () => (
  <div class="bg-white rounded-xs overflow-hidden shadow-md h-full flex flex-col">
    <div class="h-[300px] w-full bg-gray-200 animate-pulse"></div>
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

const Packages = () => {
  const [imageLoaded, setImageLoaded] = createSignal(false);
  const [filters, setFilters] = createSignal({
    location: "ALL",
    time: "ALL",
    price: "ALL",
  });

  const [packages] = createResource(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/contents/packages`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching packages:", error);
      return [];
    }
  });

  // Extract unique locations from packages using destinationName
  const locations = createMemo<string[]>(() => {
    if (!packages()) return [];
    const locationSet = new Set<string>();
    (packages() ?? []).forEach((pkg) => {
      pkg.destinations.forEach((dest: { destinationName: string; }) => {
        const location = dest.destinationName?.trim() || "Unknown";
        if (location !== "Unknown") locationSet.add(location);
      });
    });
    return [...locationSet].sort();
  });

  // Filter packages based on selected filters
  const filteredPackages = createMemo(() => {
    if (!packages()) return [];
    return (packages() ?? []).filter((pkg) => {
      const { location, time, price } = filters();

      // Location filter (using destinationName)
      const matchesLocation =
        location === "ALL" ||
        pkg.destinations.some((dest: { destinationName: string; }) => dest.destinationName?.trim() === location);

      // Time filter
      const duration = pkg.package.duration || 0;
      const matchesTime =
        time === "ALL" ||
        (time === "SHORT" && duration < 1440) ||
        (time === "MEDIUM" && duration >= 1440 && duration <= 4320) ||
        (time === "LONG" && duration > 4320);

      // Price filter
      const pkgPrice = pkg.package.price || 0;
      const matchesPrice =
        price === "ALL" ||
        (price === "LOW" && pkgPrice < 2000) ||
        (price === "MEDIUM" && pkgPrice >= 2000 && pkgPrice <= 5000) ||
        (price === "HIGH" && pkgPrice > 5000);

      return matchesLocation && matchesTime && matchesPrice;
    });
  });

  return (
    <>
      <style>
        {`
          @keyframes slide {
            0% { opacity: 1; z-index: 10; }
            20% { opacity: 1; z-index: 10; }
            25% { opacity: 0; z-index: 5; }
            95% { opacity: 0; z-index: 5; }
            100% { opacity: 1; z-index: 10; }
          }
          .animate-slide {
            animation: slide 6s infinite;
          }
        `}
      </style>
      <div class="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main class="flex-grow pt-16">
          <div class="container mx-auto px-4 py-12">
            {/* Header Section */}
            <div class="text-center mb-12">
              <h1 class="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
                Explore Our Exclusive Packages
              </h1>
              <Filter onFilterChange={setFilters} locations={locations} />
            </div>

            {/* Packages Grid */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <Show
                when={!packages.loading}
                fallback={
                  <>
                    {[...Array(6)].map(() => (
                      <CardSkeleton />
                    ))}
                  </>
                }
              >
                <Show
                  when={filteredPackages().length > 0}
                  fallback={
                    <p class="text-gray-600 text-center col-span-full">
                      No packages match the selected filters.
                    </p>
                  }
                >
                  <For each={filteredPackages()}>
                    {(pkg) => {
                      console.log("Tours for package", pkg.package.packageId, pkg.tours);
                      return (
                        <A
                          href={`/package/${pkg.package.packageId}`}
                          class="block h-full group"
                        >
                          <div class="bg-white rounded-xs overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                            <div class="h-[300px] w-full relative overflow-hidden flex-shrink-0">
                              <Show
                                when={pkg.tours?.length > 0}
                                fallback={
                                  <div class="h-full w-full bg-gray-200 flex items-center justify-center">
                                    <img
                                      src={defaultImage}
                                      alt="Default Package"
                                      class="h-full w-full object-cover"
                                      onLoad={() => setImageLoaded(true)}
                                      classList={{
                                        "opacity-0": !imageLoaded(),
                                        "opacity-100 transition-opacity duration-300": imageLoaded(),
                                      }}
                                    />
                                  </div>
                                }
                              >
                                <div class="h-full w-full relative">
                                  <For each={pkg.tours.slice(0, 4)}>
                                    {(tour, index) => (
                                      <img
                                        src={tour.pictureUrl}
                                        alt={`Tour ${tour.tourId}`}
                                        class="h-full w-full object-cover absolute top-0 left-0 transition-opacity duration-500"
                                        classList={{
                                          "opacity-0": index() !== 0 && !(pkg.tours.length > 1),
                                          "group-hover:animate-slide": pkg.tours.length > 1,
                                        }}
                                        style={{
                                          "animation-delay": `${index() * (6 / pkg.tours.length)}s`,
                                          "z-index": index() === 0 ? 10 : 5,
                                        }}
                                        onLoad={() => setImageLoaded(true)}
                                      />
                                    )}
                                  </For>
                                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </div>
                              </Show>
                            </div>
                            <div class="p-4 flex-grow flex flex-col bg-gradient-to-b from-white to-gray-50">
                              <div class="flex items-start justify-between mb-1">
                                <h2 class="text-xl font-bold text-gray-800 line-clamp-1">
                                  {pkg.package.packageName || (
                                    <span class="text-gray-400 italic">
                                      Loading title...
                                    </span>
                                  )}
                                </h2>
                                <h3 class="text-lg font-semibold text-blue-600 ml-4">
                                  LKR {Number(pkg.package.price).toFixed(2)}{" "}
                                  <span class="text-sm font-normal">pp</span>
                                </h3>
                              </div>
                              <p class="text-gray-600 text-sm text-justify tracking-tight mt-1 mb-3 line-clamp-3">
                                {pkg.package.description || "No description available"}
                              </p>
                              <div class="flex flex-wrap gap-2 mb-2">
                                <For each={pkg.destinations.slice(0, 2)}>
                                  {(dest) => (
                                    <span class="bg-amber-300 text-gray-800 text-xs font-semibold px-2 py-1 rounded-xs shadow">
                                      {dest.destinationName}
                                    </span>
                                  )}
                                </For>
                                {pkg.destinations.length > 2 && (
                                  <span class="bg-amber-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-xs shadow">
                                    +{pkg.destinations.length - 2} more
                                  </span>
                                )}
                                <For each={pkg.accommodations.slice(0, 2)}>
                                  {(acc) => (
                                    <span class="bg-blue-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded-xs shadow">
                                      {acc.accommodationName}
                                    </span>
                                  )}
                                </For>
                                {pkg.accommodations.length > 2 && (
                                  <span class="bg-blue-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-xs shadow">
                                    +{pkg.accommodations.length - 2} more
                                  </span>
                                )}
                              </div>
                              <div class="flex justify-between items-center mt-auto pt-2">
                                <span class="text-sm text-gray-500">
                                  {pkg.package.duration
                                    ? pkg.package.duration >= 1440
                                      ? `${Math.floor(pkg.package.duration / 1440)} day(s)`
                                      : pkg.package.duration >= 60
                                      ? `${Math.floor(pkg.package.duration / 60)} hour(s)`
                                      : `${pkg.package.duration} minutes`
                                    : "No duration info"}
                                </span>
                                <button class="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors">
                                  Learn More
                                </button>
                              </div>
                            </div>
                          </div>
                        </A>
                      );
                    }}
                  </For>
                </Show>
              </Show>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Packages;