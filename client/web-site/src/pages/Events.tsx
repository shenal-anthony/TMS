import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Events() {
  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />
      <main class="flex-grow pt-16">
        {" "}
        <h1>Events</h1>
        <p>This is the packages page.</p>
      </main>

      <Footer />
    </div>
  );
}

export default Events;
