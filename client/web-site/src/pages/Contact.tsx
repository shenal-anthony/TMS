import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AiFillInstagram, AiFillFacebook } from 'solid-icons/ai'
import { VsTwitter } from "solid-icons/vs";

function Contact() {
  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />

      <main class="flex-grow pt-16">
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-4xl font-bold mb-6 text-center">Contact Us</h1>

          <p class="text-lg mb-8 text-center max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a question about
            destinations, travel tips, or just want to say hello, feel free to
            reach out to us.
          </p>

          <div class="grid md:grid-cols-2 gap-10">
            {/* Contact Info Section */}
            <div>
              <h2 class="text-2xl font-semibold mb-4">Get in Touch</h2>
              <p class="mb-2">
                <strong>Email:</strong> info@yourtourwebsite.com
              </p>
              <p class="mb-2">
                <strong>Phone:</strong> +1 (123) 456-7890
              </p>
              <p class="mb-2">
                <strong>Address:</strong> 123 Travel St, Adventure City, Country
              </p>
              <p class="mt-4">
                Follow us on social media for updates and inspiration:
              </p>

              <div class="flex space-x-4 mt-4">
                <a
                  href="https://instagram.com/yourtourwebsite"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AiFillInstagram class="w-6 h-6 hover:text-pink-500 transition" />
                </a>
                <a
                  href="https://facebook.com/yourtourwebsite"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AiFillFacebook class="w-6 h-6 hover:text-blue-600 transition" />
                </a>
                <a
                  href="https://twitter.com/yourtourweb"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VsTwitter class="w-6 h-6 hover:text-sky-500 transition" />
                </a>
              </div>
            </div>

            {/* Contact Form Section */}
            <form class="space-y-4">
              <h2 class="text-2xl font-semibold mb-2">Send a Message</h2>
              <input
                type="text"
                placeholder="Your Name"
                class="w-full border border-gray-300 rounded px-4 py-2"
              />
              <input
                type="email"
                placeholder="Your Email"
                class="w-full border border-gray-300 rounded px-4 py-2"
              />
              <textarea
                placeholder="Your Message"
                rows="5"
                class="w-full border border-gray-300 rounded px-4 py-2"
              ></textarea>
              <button
                type="submit"
                class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
