import { Component } from 'solid-js';

const Footer: Component = () => {
  return (
    <footer class="bg-gray-800 text-white p-4 w-full">
      <div class="container mx-auto text-center">
        <p>© {new Date().getFullYear()} My Website. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;