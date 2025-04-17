import { createSignal, onMount, Show } from "solid-js";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CountryDropdown from "../components/CountryDropdown";

const apiUrl = import.meta.env.VITE_API_URL;

function PaymentForm() {
  // Storage key
  const STORAGE_KEY = "touristBookingForm";
  const EXPIRY_HOURS = 12; // Data expires after 12 hours
  const [phase, setPhase] = createSignal(1);
  const [formData, setFormData] = createSignal({
    tourist: {
      firstName: "",
      lastName: "",
      email: "",
      nicNumber: "",
      contactNumber: "",
      country: "Sri Lanka", // Default value
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
    },
    payment: {
      method: "credit",
      cardNumber: "",
      expiry: "",
      cvv: "",
      bankName: "",
      accountNumber: "",
    },

    _meta: {
      lastSaved: 0,
      expires: 0,
    },
  });

  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  // Handle input changes
  const handleInputChange = (
    section: "tourist" | "payment",
    field: string,
    value: string
  ) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
      saveFormData(newData); // Auto-save on every change
      return newData;
    });
  };

  // Submit each phase to API using Axios
  const submitPhase = async () => {
    setLoading(true);
    setError("");

    try {
      let endpoint = "";
      let payload = {};

      switch (phase()) {
        case 1:
          endpoint = `${apiUrl}/api/tourists/register`;
          payload = formData().tourist;
          break;
        case 2:
          endpoint = "/api/tourists/payment";
          payload = formData().payment;
          break;
        case 3:
          endpoint = "/api/confirm-booking";
          payload = formData();
          break;
      }

      // Using Axios instead of fetch
      const response = await axios.post(endpoint, payload);

      // Axios wraps the response data in a data property
      if (response.data.success) {
        if (phase() < 3) {
          setPhase((prev) => prev + 1);
        } else {
          alert("Booking confirmed! Check your email for details.");
          // Redirect or reset form as needed
        }
      } else {
        throw new Error(response.data.message || "Submission failed");
      }
    } catch (err) {
      // Axios error handling
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || err.message || "Request failed"
        );
      } else {
        if (err instanceof Error) {
          setError(err.message || "Submission failed");
        } else {
          setError("Submission failed");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await submitPhase();
  };

  // Progress steps
  const steps = [
    { number: 1, title: "Tourist Details" },
    { number: 2, title: "Payment Method" },
    { number: 3, title: "Confirmation" },
  ];

  // Save to localStorage
  const saveFormData = (data: ReturnType<typeof formData>) => {
    const dataToSave = {
      ...data,
      _meta: {
        lastSaved: Date.now(),
        expires: Date.now() + EXPIRY_HOURS * 60 * 60 * 1000,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  };

  // Load from localStorage
  const loadFormData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved);
      if (Date.now() > parsed._meta?.expires) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  };

  onMount(() => {
    const savedData = loadFormData();
    if (savedData) {
      setFormData(savedData);
    }
  });

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />

      <main class="flex-grow pt-16">
        <div class="max-w-2xl mx-auto container px-4 py-8">
          {/* Progress Steps */}
          <div class="flex justify-between mb-8">
            {steps.map((step) => (
              <div
                class={`flex flex-col items-center ${
                  step.number <= phase() ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  class={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.number <= phase()
                      ? "bg-blue-100 border-2 border-blue-600"
                      : "bg-gray-100 border-2 border-gray-300"
                  }`}
                >
                  {step.number}
                </div>
                <span class="text-sm mt-2">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error() && (
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              {error()}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            class="bg-white p-6 rounded-lg shadow-md"
          >
            {/* Phase 1: Tourist Details */}
            <Show when={phase() === 1}>
              <h2 class="text-xl font-semibold mb-4">Tourist Information</h2>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-gray-700 mb-1">First Name*</label>
                    <input
                      type="text"
                      required
                      value={formData().tourist.firstName}
                      onInput={(e) =>
                        handleInputChange(
                          "tourist",
                          "firstName",
                          e.target.value
                        )
                      }
                      class="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label class="block text-gray-700 mb-1">Last Name*</label>
                    <input
                      type="text"
                      required
                      value={formData().tourist.lastName}
                      onInput={(e) =>
                        handleInputChange("tourist", "lastName", e.target.value)
                      }
                      class="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-gray-700 mb-1">Email*</label>
                    <input
                      type="email"
                      required
                      value={formData().tourist.email}
                      onInput={(e) =>
                        handleInputChange("tourist", "email", e.target.value)
                      }
                      class="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label class="block text-gray-700 mb-1">
                      Contact Number*
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData().tourist.contactNumber}
                      onInput={(e) =>
                        handleInputChange(
                          "tourist",
                          "contactNumber",
                          e.target.value
                        )
                      }
                      class="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-gray-700 mb-1">NIC/Passport*</label>
                  <input
                    type="text"
                    required
                    value={formData().tourist.nicNumber}
                    onInput={(e) =>
                      handleInputChange("tourist", "nicNumber", e.target.value)
                    }
                    class="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                {/* country */}
                {/* <div>
                  <label class="block text-gray-700 mb-1">Country*</label>
                  <select
                    required
                    value={formData().tourist.country}
                    onInput={(e) =>
                      handleInputChange("tourist", "country", e.target.value)
                    }
                    class="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Wakanda">Wakanda</option> // 😁 for testing
                    purposes
                  </select>
                </div> */}
                <CountryDropdown
                value={formData().tourist.country}
                onChange={(value: string) => handleInputChange("tourist", "country", value)}
                label={"Country*"}
                />

                <div>
                  <label class="block text-gray-700 mb-1">
                    Address Line 1*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData().tourist.addressLine1}
                    onInput={(e) =>
                      handleInputChange(
                        "tourist",
                        "addressLine1",
                        e.target.value
                      )
                    }
                    class="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label class="block text-gray-700 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={formData().tourist.addressLine2}
                    onInput={(e) =>
                      handleInputChange(
                        "tourist",
                        "addressLine2",
                        e.target.value
                      )
                    }
                    class="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-gray-700 mb-1">City*</label>
                    <input
                      type="text"
                      required
                      value={formData().tourist.city}
                      onInput={(e) =>
                        handleInputChange("tourist", "city", e.target.value)
                      }
                      class="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label class="block text-gray-700 mb-1">Postal Code*</label>
                    <input
                      type="text"
                      required
                      value={formData().tourist.postalCode}
                      onInput={(e) =>
                        handleInputChange(
                          "tourist",
                          "postalCode",
                          e.target.value
                        )
                      }
                      class="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>
            </Show>

            {/* Phase 2: Payment Method */}
            <Show when={phase() === 2}>
              <h2 class="text-xl font-semibold mb-4">Payment Method</h2>
              <div class="space-y-4">
                <div class="flex space-x-4 mb-4 transition-shadow duration-300">
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("payment", "method", "credit")
                    }
                    class={`px-4 py-2 rounded-md ${
                      formData().payment.method === "credit"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Credit/Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("payment", "method", "bank")
                    }
                    class={`px-4 py-2 rounded-md ${
                      formData().payment.method === "bank"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Bank Transfer
                  </button>
                </div>

                <Show when={formData().payment.method === "credit"}>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-gray-700 mb-1">
                        Card Number*
                      </label>
                      <input
                        type="text"
                        required
                        pattern="\d{16}"
                        title="16-digit card number"
                        value={formData().payment.cardNumber}
                        onInput={(e) =>
                          handleInputChange(
                            "payment",
                            "cardNumber",
                            e.target.value
                          )
                        }
                        class="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-gray-700 mb-1">Expiry*</label>
                        <input
                          type="text"
                          required
                          pattern="\d{2}/\d{2}"
                          placeholder="MM/YY"
                          value={formData().payment.expiry}
                          onInput={(e) =>
                            handleInputChange(
                              "payment",
                              "expiry",
                              e.target.value
                            )
                          }
                          class="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label class="block text-gray-700 mb-1">CVV*</label>
                        <input
                          type="text"
                          required
                          pattern="\d{3}"
                          value={formData().payment.cvv}
                          onInput={(e) =>
                            handleInputChange("payment", "cvv", e.target.value)
                          }
                          class="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </Show>

                <Show when={formData().payment.method === "bank"}>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-gray-700 mb-1">Bank Name*</label>
                      <input
                        type="text"
                        required
                        value={formData().payment.bankName}
                        onInput={(e) =>
                          handleInputChange(
                            "payment",
                            "bankName",
                            e.target.value
                          )
                        }
                        class="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label class="block text-gray-700 mb-1">
                        Account Number*
                      </label>
                      <input
                        type="text"
                        required
                        value={formData().payment.accountNumber}
                        onInput={(e) =>
                          handleInputChange(
                            "payment",
                            "accountNumber",
                            e.target.value
                          )
                        }
                        class="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Phase 3: Confirmation */}
            <Show when={phase() === 3}>
              <h2 class="text-xl font-semibold mb-4">Confirm Your Booking</h2>
              <div class="bg-blue-50 p-4 rounded-md mb-6">
                <h3 class="font-medium mb-2">Tourist Information</h3>
                <p>
                  Name: {formData().tourist.firstName}{" "}
                  {formData().tourist.lastName}
                </p>
                <p>Email: {formData().tourist.email}</p>
                <p>contactNumber: {formData().tourist.contactNumber}</p>
                <p>NIC/Passport: {formData().tourist.nicNumber}</p>
                <p>
                  Address: {formData().tourist.addressLine1},{" "}
                  {formData().tourist.addressLine2}
                </p>
                <p>
                  {formData().tourist.city}, {formData().tourist.postalCode}
                </p>
                <p>Country: {formData().tourist.country}</p>

                <h3 class="font-medium mt-4 mb-2">Payment Details</h3>
                <Show when={formData().payment.method === "credit"}>
                  <p>Method: Credit/Debit Card</p>
                  <p>Card: ****{formData().payment.cardNumber.slice(-4)}</p>
                  <p>Expires: {formData().payment.expiry}</p>
                </Show>
                <Show when={formData().payment.method === "bank"}>
                  <p>Method: Bank Transfer</p>
                  <p>Bank: {formData().payment.bankName}</p>
                  <p>Account: {formData().payment.accountNumber}</p>
                </Show>
              </div>

              <div class="mb-4">
                <label class="flex items-start">
                  <input type="checkbox" required class="mt-1 mr-2" />
                  <span class="text-sm">
                    I confirm all information is correct and agree to the{" "}
                    <a href="/terms" class="text-blue-600 hover:underline">
                      Terms and Conditions
                    </a>
                  </span>
                </label>
              </div>
            </Show>

            {/* Navigation Buttons */}
            <div class="flex justify-between mt-8">
              <Show when={phase() > 1}>
                <button
                  type="button"
                  onClick={() => setPhase((prev) => prev - 1)}
                  class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  disabled={loading()}
                >
                  Back
                </button>
              </Show>
              <div class="ml-auto">
                <button
                  type="submit"
                  class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading()}
                >
                  {loading() ? (
                    <span class="inline-flex items-center">
                      <svg
                        class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : phase() === 3 ? (
                    "Confirm Booking"
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PaymentForm;
