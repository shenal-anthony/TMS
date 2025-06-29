import { A } from "@solidjs/router";
import logo from "../assets/Sign.jpg";
import { IoMenu } from "solid-icons/io";
import { createSignal } from "solid-js";
import Cart from "../components/Cart";

const Navbar = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <nav class="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <A href="/" class="flex items-center">
          <img src={logo} alt="Company Logo" class="h-10 w-auto" />
          <span class="ml-2 text-xl font-bold">Ceylonian</span>
        </A>

        <div class="flex items-center space-x-4">
          {/* Desktop Navigation */}
          <div class="hidden md:flex space-x-8">
            <A href="/home" class="hover:text-blue-600 transition-colors">
              Home
            </A>
            <A
              href="/destinations"
              class="hover:text-blue-600 transition-colors"
            >
              Destinations
            </A>
            <A href="/packages" class="hover:text-blue-600 transition-colors">
              Packages
            </A>
            <A href="/tours" class="hover:text-blue-600 transition-colors">
              Tours
            </A>
            {/* <A href="/events" class="hover:text-blue-600 transition-colors">
              Events
            </A> */}
            <A href="/about" class="hover:text-blue-600 transition-colors">
              About
            </A>
            <A href="/contact" class="hover:text-blue-600 transition-colors">
              Contact
            </A>
          </div>

          {/* Cart Component */}
          <Cart />

          {/* Mobile Menu Button */}
          <button
            class="md:hidden focus:outline-none p-1.5 rounded-md transition-colors hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen())}
          >
            <IoMenu
              class={`h-7 w-7 transition-colors ${
                isOpen() ? "filter brightness-0 invert-[.5]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        class={`md:hidden bg-white shadow-md transition-all duration-400 ease-in-out overflow-hidden ${
          isOpen() ? "max-h-96 py-4" : "max-h-0 py-0"
        }`}
      >
        <div class="container mx-auto px-4 flex flex-col space-y-3">
          <A
            href="/home"
            class="block py-2 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </A>
          <A
            href="/destinations"
            class="block py-2 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Destinations
          </A>
          <A
            href="/packages"
            class="block py-2 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Packages
          </A>
          <A
            href="/tours"
            class="block py-2 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Tours
          </A>
          {/* <A
            href="/events"
            class="block py-2 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Events
          </A> */}
          <A
            href="/about"
            class="block py-2 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            About
          </A>
          <A
            href="/contact"
            class="block py-2 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </A>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
