import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />

      <div class="flex pt-16">
        <h1>About</h1>
        <p>This is the packages page.</p>
      </div>
      <Footer />
    </div>
  );
}

export default About;
