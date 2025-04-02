import { Component } from "solid-js";

const AccommodationSection: Component = () => {
  return (
    <div id="accommodation" class="mb-8">
      <h3 class="text-xl font-bold mb-4">Accommodation</h3>
      <div class="grid grid-cols-2 gap-2 mb-4">
        <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm">
          All places
        </button>
        <button class="bg-white border border-gray-300 px-3 py-1 rounded text-sm">
          Hotels
        </button>
        <button class="bg-white border border-gray-300 px-3 py-1 rounded text-sm">
          Campings
        </button>
        <button class="bg-white border border-gray-300 px-3 py-1 rounded text-sm">
          Cabins
        </button>
      </div>

      {/* Accommodation Examples */}
      <div class="space-y-4">
        <div class="border border-gray-200 p-4 rounded-lg">
          <h4 class="font-bold mb-2">Sunny Lake Lodge</h4>
          <p class="text-sm text-gray-600">Luxury retreat with lake views</p>
        </div>
        <div class="border border-gray-200 p-4 rounded-lg">
          <h4 class="font-bold mb-2">Lakeside Cabins</h4>
          <p class="text-sm text-gray-600">Private decks by the water</p>
        </div>
      </div>
    </div>
  );
};

export default AccommodationSection;
