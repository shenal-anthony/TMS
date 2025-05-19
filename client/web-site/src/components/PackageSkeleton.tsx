// components/PackageSkeleton.tsx
const PackageSkeleton = () => {
  return (
    <div class="p-6 space-y-6 animate-pulse">
        {/* Loading Text */}
      <div class="text-center text-gray-500 text-lg mb-4">
        Loading...
      </div>
      {/* Image banner */}
      <div class="w-full h-48 bg-gray-300 rounded-lg"></div>

      {/* Package title */}
      <div class="h-6 bg-gray-300 rounded w-1/3"></div>

      {/* Description */}
      <div class="space-y-2">
        <div class="h-4 bg-gray-300 rounded w-3/4"></div>
        <div class="h-4 bg-gray-300 rounded w-5/6"></div>
        <div class="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>

      {/* Price */}
      <div class="h-6 bg-gray-300 rounded w-1/4"></div>

      {/* Feature list */}
      <div class="space-y-2">
        <div class="h-4 bg-gray-300 rounded w-2/3"></div>
        <div class="h-4 bg-gray-300 rounded w-3/5"></div>
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default PackageSkeleton;
