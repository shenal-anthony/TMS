// src/components/Navbar.jsx
import { NavLink } from "solid-bootstrap";

function Navbar() {
  



  return (
    <header class="navbar justify-between items-center bg-gray-800 text-white p-4">
      <div class="logo">
        <img src="/assets/Sign.jpg" alt="TMS Logo" />
      </div>
      <nav class="flex space-x-4">
        <NavLink href="/Home">Home</NavLink>
        <NavLink href="/Destinations">Destinations</NavLink>
        <NavLink href="/Packages">Packages</NavLink>
        <NavLink href="#tours">Tours</NavLink>
        <NavLink href="#events">Events</NavLink>
        <NavLink href="#testimonials">Testimonials</NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
