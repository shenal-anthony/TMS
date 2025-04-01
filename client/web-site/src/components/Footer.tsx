import { Component } from 'solid-js';

const Footer: Component = () => {
  return (
    <footer class="bg-gray-800 text-white content-center p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 class="font-bold mb-3">Contact Us</h3>
          <p>oeyjontani@gmail.com</p>
          <p>94 052-3452</p>
          <p>123 Ave, New York, USA</p>
        </div>
        
        <div>
          <h3 class="font-bold mb-3">About</h3>
          <p>Egestia vitae, our team</p>
          <p>services</p>
        </div>
        
        <div>
          <h3 class="font-bold mb-3">Our Accomplishments</h3>
          <p>Best i.h.</p>
          <p>Lankan best website</p>
          <p>GEO</p>
        </div>
        
        <div>
          <h3 class="font-bold mb-3">Visitor info</h3>
          <p>Season 4.3 Climate</p>
          <p>Getting here</p>
          <p>Get in touch</p>
        </div>
      </div>

      <div class="border-t mt-8 pt-8 text-center text-sm text-gray-500">
      <p>© {new Date().getFullYear()} My Website. All rights reserved.</p>
        <div class="flex justify-center gap-4 mt-2">
          <span>Instructions</span>
          <span>Licence</span>
          <span>Styleguide</span>
          <span>Charging</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;