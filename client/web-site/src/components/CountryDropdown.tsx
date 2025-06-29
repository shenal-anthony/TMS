import { countries } from 'countries-list';
import { createSignal, onMount } from 'solid-js';

const CountryDropdown = (props: { onChange: (arg0: any) => void; label: any; value: string; }) => {
  const [searchTerm, setSearchTerm] = createSignal('');
  const [isOpen, setIsOpen] = createSignal(false);
  const [filteredCountries, setFilteredCountries] = createSignal<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = createSignal(0);

  const allCountries = Object.values(countries)
    .map(c => c.name)
    .sort((a, b) => a.localeCompare(b));

  onMount(() => {
    setFilteredCountries(allCountries);
  });

  const handleSearch = (e: { target: { value: any; }; }) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredCountries(
      allCountries.filter(country => 
        country.toLowerCase().includes(term.toLowerCase())
      )
    );
    setHighlightedIndex(0);
    setIsOpen(true);
  };

  const handleSelect = (country: string) => {
    props.onChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: { key: string; preventDefault: () => void; }) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCountries().length > 0) {
        handleSelect(filteredCountries()[highlightedIndex()]);
      } else if (searchTerm()) {
        // Allow custom entry if not found
        handleSelect(searchTerm());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        Math.min(prev + 1, filteredCountries().length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    }
  };

  return (
    <div class="relative">
      <label class="block text-gray-700 mb-1">{props.label || 'Country*'}</label>
      <div class="relative">
        <input
          type="text"
          value={isOpen() ? searchTerm() : props.value || ''}
          onInput={handleSearch}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Type to search countries..."
          class="w-full px-3 py-2 border rounded-md"
        />
        {isOpen() && (
          <div class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredCountries().length > 0 ? (
              filteredCountries().map((country, index) => (
                <div
                  onClick={() => handleSelect(country)}
                  class={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                    props.value === country ? 'bg-blue-50' : ''
                  } ${highlightedIndex() === index ? 'bg-gray-200' : ''}`}
                >
                  {country}
                </div>
              ))
            ) : (
              <div class="px-3 py-2 text-gray-500">
                {searchTerm() ? "No matches. Press Enter to use this value" : "Type to search countries"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryDropdown;