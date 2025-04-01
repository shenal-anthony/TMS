import { Component, createSignal } from "solid-js";

const Filter: Component = () => {
  const [selectedCategory, setSelectedCategory] = createSignal("ALL");
  const [selectedLocation, setSelectedLocation] = createSignal("ALL");

  return (
    <div class="flex justify-center gap-8 mb-8">
      <div>
        <label class="block text-sm font-medium mb-1">
          Experience Category
        </label>
        <select
          class="border rounded px-3 py-2"
          value={selectedCategory()}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">ALL</option>
          <option value="ADVENTURE">Adventure</option>
          <option value="RELAXATION">Relaxation</option>
          <option value="CULTURE">Culture</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Location</label>
        <select
          class="border rounded px-3 py-2"
          value={selectedLocation()}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="ALL">ALL</option>
          <option value="MOUNTAIN">Mountain</option>
          <option value="BEACH">Beach</option>
          <option value="CITY">City</option>
        </select>
      </div>
    </div>
  );
};
export default Filter;