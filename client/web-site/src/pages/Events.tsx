import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createSignal, For, onMount } from "solid-js";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

interface DestinationImage {
  picture_url: string;
  destination_name: string;
  description?: string;
}

function Events() {
  const [file, setFile] = createSignal<File | null>(null);
  const [previewUrl, setPreviewUrl] = createSignal("");
  const [isUploading, setIsUploading] = createSignal(false);
  const [uploadProgress, setUploadProgress] = createSignal(0);
  const [error, setError] = createSignal("");
  const [destinations, setDestinations] = createSignal<DestinationImage[]>([]);
  const [selectedDestination, setSelectedDestination] = createSignal("");

  // Fetch destinations from backend
  const fetchDestinations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/uploads/images`);
      setDestinations(response.data.images);
    } catch (err) {
      console.error("Failed to fetch destinations:", err);
      setError("Failed to load destinations");
    }
  };

  // Handle file selection
  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;

    if (files && files[0]) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Upload image
  const uploadImage = async () => {
    if (!file()) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file() as Blob);
    formData.append("name", selectedDestination() || "New Destination");

    try {
      await axios.post(`${apiUrl}/api/uploads/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });
      await fetchDestinations(); // Refresh the list
      setPreviewUrl("");
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Load destinations on mount
  onMount(fetchDestinations);

  return (
    <div class="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main class="flex-grow pt-16 container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
          <h1 class="text-3xl font-bold text-gray-800 mb-8">
            Destination Gallery
          </h1>

          {/* Upload Section */}
          <div class="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">
              Add New Destination
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Destination Name
                </label>
                <input
                  type="text"
                  value={selectedDestination()}
                  onInput={(e) => setSelectedDestination(e.currentTarget.value)}
                  placeholder="Enter destination name"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image
                </label>
                <div class="flex items-center space-x-4">
                  <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    {previewUrl() ? (
                      <img
                        src={previewUrl()}
                        alt="Preview"
                        class="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          class="w-8 h-8 mb-3 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          ></path>
                        </svg>
                        <p class="text-sm text-gray-500">Click to upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      class="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>

              {isUploading() && (
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    class="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress()}%` }}
                  ></div>
                </div>
              )}

              {error() && <p class="text-red-500 text-sm">{error()}</p>}

              <button
                onClick={uploadImage}
                disabled={isUploading() || !file()}
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading()
                  ? `Uploading... ${uploadProgress()}%`
                  : "Upload Destination"}
              </button>
            </div>
          </div>

          {/* Destination Gallery */}
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-700">
                Explore Destinations
              </h2>
              <button
                onClick={fetchDestinations}
                disabled={isUploading()}
                class="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                Refresh
              </button>
            </div>

            {destinations().length === 0 ? (
              <div class="text-center py-12">
                <p class="text-gray-500">
                  No destinations found. Upload one to get started!
                </p>
              </div>
            ) : (
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <For each={destinations()}>
                  {(destination) => (
                    <div class="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div class="aspect-w-16 aspect-h-9 bg-gray-200 overflow-hidden">
                        <img
                          src={destination.picture_url}
                          alt={destination.destination_name}
                          class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div class="text-white">
                          <h3 class="font-bold text-lg">
                            {destination.destination_name}
                          </h3>
                          {destination.description && (
                            <p class="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                              {destination.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div class="p-4 bg-white">
                        <h3 class="font-semibold text-gray-800">
                          {destination.destination_name}
                        </h3>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Events;