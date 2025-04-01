// src/components/Navbar.tsx
import { A } from "@solidjs/router";
import logo from "../assets/Sign.jpg";
import menuIcon from "../assets/list.svg";
import { createSignal } from "solid-js";

const Navbar = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <nav class="bg-white shadow-lg">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <A href="/" class="flex items-center">
          <img src={logo} alt="Company Logo" class="h-10 w-auto" />
          <span class="ml-2 text-xl font-bold">Ceylonian</span>
        </A>

        {/* Mobile Menu Button */}
        <button
          class="md:hidden focus:outline-none hover:bg-amber-200 p-1.5 rounded "
          onClick={() => setIsOpen(!isOpen())}
        >
          <img src={menuIcon} alt="Menu" class="h-7 w-7" />
        </button>

        {/* Desktop Navigation */}
        <div class="hidden md:flex space-x-8">
          <A href="/home" class="hover:text-blue-600">
            Home
          </A>
          <A href="/destinations" class="hover:text-blue-600">
            Destinations
          </A>
          <A href="/packages" class="hover:text-blue-600">
            Packages
          </A>
          <A href="/events" class="hover:text-blue-600">
            Event
          </A>
          <A href="/about" class="hover:text-blue-600">
            About
          </A>
          <A href="/contact" class="hover:text-blue-600">
            Contact
          </A>
        </div>

        {/* Mobile Navigation */}
        <div
          class={`md:hidden ${
            isOpen() ? "block" : "hidden"
          } absolute top-16 left-0 right-0 bg-white shadow-md p-4`}
        >
          <A href="/home" class="hover:text-blue-600">
            Home
          </A>
          <A href="/destinations" class="block py-2 hover:text-blue-600">
            Destinations
          </A>
          <A href="/packages" class="block py-2 hover:text-blue-600">
            Packages
          </A>
          <A href="/event" class="hover:text-blue-600">
            Event
          </A>
          <A href="/about" class="block py-2 hover:text-blue-600">
            About
          </A>
          <A href="/contact" class="block py-2 hover:text-blue-600">
            Contact
          </A>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
