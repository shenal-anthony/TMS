import { Component } from 'solid-js';

const Footer: Component = () => {
  return (
    <footer class="bg-blue-950 backdrop-blur-md text-white py-12 px-4">
      <div class="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 class="text-lg font-bold mb-4 text-amber-200">About Us</h3>
          <p class="text-gray-200 mb-2">
            Ceylonian Tours is dedicated to crafting unforgettable travel experiences, connecting you with the world's most stunning destinations.
          </p>
          <p class="text-gray-200">
            Our passionate team ensures every journey is seamless and memorable.
          </p>
        </div>
        
        <div>
          <h3 class="text-lg font-bold mb-4 text-amber-200">Contact</h3>
          <p class="text-gray-200 mb-2">Email: ceylonian@gmail.com</p>
          <p class="text-gray-200 mb-2">Phone: +94 (077) 123-4567</p>
          <p class="text-gray-200">Address: 456 Wanderlust Avenue, Negombo, Sri Lanka</p>
        </div>
        
        <div>
          <h3 class="text-lg font-bold mb-4 text-amber-200">Accomplishments</h3>
          <p class="text-gray-200 mb-2">Global Travel Award 2024</p>
          <p class="text-gray-200 mb-2">Top Adventure Tour Operator 2024</p>
          <p class="text-gray-200">Certified Sustainable Tourism Partner</p>
        </div>
      </div>

      <div class="border-t border-gray-600/50 mt-8 pt-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Ceylonian Tours. All rights reserved.</p>
        <div class="flex justify-center gap-6 mt-4">
          <a class="hover:text-amber-200 transition-colors">Terms & Conditions</a>
          <a class="hover:text-amber-200 transition-colors">Privacy Policy</a>
          <a class="hover:text-amber-200 transition-colors">FAQ</a>
          <a href="/contact" class="hover:text-amber-200 transition-colors">Get in Touch</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;