import { createSignal, For, Show } from "solid-js";

type FilterProps = {
  onFilterChange: (filters: { location: string; time: string; price: string }) => void;
  locations: () => string[];
};

const Filter = ({ onFilterChange, locations }: FilterProps) => {
  const [selectedLocation, setSelectedLocation] = createSignal("ALL");
  const [selectedTime, setSelectedTime] = createSignal("ALL");
  const [selectedPrice, setSelectedPrice] = createSignal("ALL");

  // Debug: Log locations prop
  console.log("Filter locations prop:", locations);

  const handleFilterChange = () => {
    onFilterChange({
      location: selectedLocation(),
      time: selectedTime(),
      price: selectedPrice(),
    });
  };

  // Get locations array safely
  const getLocations = () => {
    try {
      return typeof locations === "function" ? locations() : [];
    } catch (error) {
      console.error("Error accessing locations:", error);
      return [];
    }
  };

  return (
    <div class="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-8">
      <div>
        <label class="block text-sm font-medium mb-1">Location</label>
        <select
          class="border rounded-xs px-3 py-2 text-sm w-full sm:w-48"
          value={selectedLocation()}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            handleFilterChange();
          }}
          aria-label="Filter by location"
        >
          <option value="ALL">All Locations</option>
          <Show when={getLocations().length > 0} fallback={<option value="">No locations available</option>}>
            <For each={getLocations()}>
              {(location) => <option value={location}>{location}</option>}
            </For>
          </Show>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Duration</label>
        <select
          class="border rounded-xs px-3 py-2 text-sm w-full sm:w-48"
          value={selectedTime()}
          onChange={(e) => {
            setSelectedTime(e.target.value);
            handleFilterChange();
          }}
          aria-label="Filter by duration"
        >
          <option value="ALL">All Durations</option>
          <option value="SHORT">Less than 1 day</option>
          <option value="MEDIUM">1-3 days</option>
          <option value="LONG">More than 3 days</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Price</label>
        <select
          class="border rounded-xs px-3 py-2 text-sm w-full sm:w-48"
          value={selectedPrice()}
          onChange={(e) => {
            setSelectedPrice(e.target.value);
            handleFilterChange();
          }}
          aria-label="Filter by price"
        >
          <option value="ALL">All Prices</option>
          <option value="LOW">Less than 2000 LKR</option>
          <option value="MEDIUM">2000-5000 LKR</option>
          <option value="HIGH">More than 5000 LKR</option>
        </select>
      </div>
    </div>
  );
};

export default Filter;