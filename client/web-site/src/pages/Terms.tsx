import { Component } from "solid-js";
import Footer from "../components/Footer";

const TermsAndConditions: Component = () => {
  return (
    <div class="min-h-screen flex flex-col">
      <main class="flex-grow p-6">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold mb-4">Terms and Conditions</h1>
          <p class="mb-4">Last Updated: May 19, 2025</p>

          <h2 class="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
          <p class="mb-4">
            By accessing or using the services provided by [Your Company Name] (hereinafter referred to as "we," "us," or "our"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.
          </p>

          <h2 class="text-xl font-semibold mt-6 mb-2">2. Description of Services</h2>
          <p class="mb-4">
            We provide a Travel Management System (TMS) to assist users in booking, managing, and tracking travel itineraries, including flights, accommodations, and other travel-related services. All services are subject to availability and the terms of third-party providers.
          </p>

          <h2 class="text-xl font-semibold mt-6 mb-2">3. Eligibility</h2>
          <p class="mb-4">
            You must be at least 18 years old to use our services. By using the TMS, you represent and warrant that you have the legal capacity to enter into these Terms and Conditions.
          </p>

          <h2 class="text-xl font-semibold mt-6 mb-2">4. Payment Terms</h2>
          <p class="mb-4">
            All bookings require full payment at the time of reservation unless otherwise specified. We accept payments via [list payment methods, e.g., credit card, bank transfer]. Prices are subject to change, and any applicable taxes or fees will be disclosed prior to confirmation.
          </p>

          <h2 class="text-xl font-semibold mt-6 mb-2">5. Cancellations and Refunds</h2>
          <p class="mb-4">
            Cancellations must be made at least 48 hours prior to the travel date to be eligible for a refund, subject to a 10% processing fee. Cancellations within 48 hours or no-shows are non-refundable. Refunds will be processed within 14 business days.
          </p>

          <h2 class="text-xl font-semibold mt-6 mb-2">6. Liability</h2>
          <p class="mb-4">
            We are not liable for any loss, injury, or inconvenience caused by third-party providers, natural disasters, or unforeseen circumstances. Users are responsible for obtaining travel insurance to cover such risks.
          </p>

          <h2 class="text-xl font-semibold mt-6 mb-2">7. Intellectual Property</h2>
          <p class="mb-4">
            All content, logos, and materials on the TMS are the property of [Your Company Name] and are protected by copyright laws. Unauthorized use is prohibited.
          </p>

          <h2 class="text-xl font-semibold mt-6 mb-2">8. Privacy</h2>
          <p class="mb-4">
            Your personal information is handled in accordance with our Privacy Policy. By using our services, you consent to the collection and use of your data as described therein.
          </p>

          <h2 class="text-xl font-semibold mt-6 mb-2">9. Modifications to Terms</h2>
          <p class="mb-4">
            We reserve the right to update these Terms and Conditions at any time. Changes will be effective upon posting, and continued use of the service constitutes acceptance of the revised terms.
          </p>

          <h2 class="text-xl font-semibold mt-6 mb-2">10. Contact Us</h2>
          <p class="mb-4">
            For any questions or concerns regarding these Terms and Conditions, please contact us at:
          </p>
          <p class="mb-2">Email: ceylonian@gmail.com</p>
          <p class="mb-2">Phone: +94 (077) 123-4567</p>
          <p>Address: 456 Wanderlust Avenue, Negombo, Sri Lanka</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;