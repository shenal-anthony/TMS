import { Component } from "solid-js";

const Testimonial: Component = () => {
  return (
    <section class="py-12 border-t border-gray-200">
      <h2 class="text-2xl font-bold mb-8 text-center">Testimonials</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-gray-50 p-6 rounded-lg">
          <p class="italic mb-4">
            "An unforgettable experience! The tour guides were knowledgeable and
            the scenery was breathtaking."
          </p>
          <p class="font-medium">- Sarah J.</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg">
          <p class="italic mb-4">
            "Perfect family outing. The kids loved it and we got amazing photos
            of the lake."
          </p>
          <p class="font-medium">- Michael T.</p>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
