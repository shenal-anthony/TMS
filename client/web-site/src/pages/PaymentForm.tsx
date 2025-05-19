import { createSignal, onMount, Show } from "solid-js";
import axios, { AxiosResponse } from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CountryDropdown from "../components/CountryDropdown";
import { useNavigate } from "@solidjs/router";

const apiUrl = import.meta.env.VITE_API_URL;

// Predefined payment details for validation
const PREDEFINED_PAYMENT_DETAILS = {
  credit: {
    cardNumber: "4242424242424242",
    expiry: "12/25",
    cvv: "123",
  },
  bank: {
    bankName: "Sample Bank",
    accountNumber: "9876543210",
  },
};

function PaymentForm() {
  const navigate = useNavigate();
  const [phase, setPhase] = createSignal(1);
  const [formData, setFormData] = createSignal({
    tourist: {
      firstName: "",
      lastName: "",
      email: "",
      nicNumber: "",
      contactNumber: "",
      country: "Sri Lanka",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
    },
    payment: {
      method: "credit",
      paymentType: "full",
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
  const [verifiedBookingData, setVerifiedBookingData] = createSignal<{
    price?: string;
    pkgId?: number;
    headcount?: number;
    startDate?: string;
  }>({});
  const [tourId, setTourId] = createSignal<number | null>(null); // Store the fetched tour_id
  const [encryptedBookingData, setEncryptedBookingData] = createSignal<{
    token?: string;
    touristId?: number;
  }>({});
  const [encryptedPaymentData, setEncryptedPaymentData] = createSignal<{
    paidAmount?: string;
    token?: string;
    paymentId?: string;
    amount?: number;
    paymentDate?: string;
    status?: string;
    bookingId?: number;
    paymentType?: string;
  }>({});
  const steps = [
    { number: 1, title: "Tourist Details" },
    { number: 2, title: "Payment Method" },
    { number: 3, title: "Confirmation" },
  ];

  onMount(async () => {
    const token = sessionStorage.getItem("bookingKey");

    if (!token) {
      navigate("/packages");
      return;
    }

    try {
      const verify = await axios.post(`${apiUrl}/api/bookings/verify-token`, {
        token,
      });

      if (!verify.data.success) {
        throw new Error(verify.data.message || "Invalid token");
      }

      setVerifiedBookingData({
        price: verify.data.price,
        pkgId: verify.data.pkgId,
        headcount: verify.data.headcount,
        startDate: verify.data.startDate,
      });

      // Fetch tour_id based on pkgId
      if (verify.data.pkgId) {
        try {
          const tourResponse = await axios.post(
            `${apiUrl}/api/bookings/tour_by_package`,
            {
              packageId: verify.data.pkgId,
            }
          );

          if (
            tourResponse.data.tour_ids &&
            tourResponse.data.tour_ids.length > 0
          ) {
            setTourId(tourResponse.data.tour_ids[0]); // Use the first tour_id
          } else {
            throw new Error("No tours found for this package.");
          }
        } catch (tourErr) {
          console.error("Failed to fetch tour ID:", tourErr);
          setError("Unable to fetch tour details. Please try again later.");
          navigate("/packages");
          return;
        }
      }

      const savedData = loadFormData();
      if (savedData) {
        setFormData(savedData);
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      sessionStorage.removeItem("bookingKey");
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Invalid booking session"
          : err instanceof Error
          ? err.message
          : "Invalid booking session"
      );
      navigate("/packages");
    }
  });

  const saveFormData = (data: any) => {
    sessionStorage.setItem("bookingFormData", JSON.stringify(data));
  };

  const loadFormData = () => {
    const saved = sessionStorage.getItem("bookingFormData");
    return saved ? JSON.parse(saved) : null;
  };

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
      saveFormData(newData);
      return newData;
    });
  };

  const submitPhase = async () => {
    setLoading(true);
    setError("");

    try {
      let endpoint = "";
      let payload = {};
      let paymentResponse: AxiosResponse<any, any>;
      let confirmResponse: AxiosResponse<any, any>;

      switch (phase()) {
        case 1:
          endpoint = `${apiUrl}/api/tourists/register`;
          payload = formData().tourist;

          try {
            const regResponse = await axios.post(endpoint, payload);

            if (regResponse.data.success) {
              alert("Registration successful!");

              const bookingPayload = {
                touristId: regResponse.data.touristId,
                pkgId: verifiedBookingData().pkgId,
                headcount: verifiedBookingData().headcount,
                bookingDate: verifiedBookingData().startDate,
                tourId: tourId(),
                userId: 1, // default
                eventId: 1, // default
              };

              const bookingResponse = await axios.post(
                `${apiUrl}/api/bookings/add`,
                bookingPayload
              );

              if (bookingResponse.data.success) {
                setEncryptedBookingData({
                  token: bookingResponse.data.token,
                  touristId: regResponse.data.touristId,
                });
                setPhase((prev) => prev + 1);
              } else {
                throw new Error(
                  "Booking creation failed: " + bookingResponse.data.message
                );
              }
            } else {
              throw new Error(
                "Registration failed: " + regResponse.data.message
              );
            }
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to complete registration process"
            );
            return;
          }
          return;

        case 2:
          const paymentMethod = formData().payment.method;
          const paymentType = formData().payment.paymentType;
          if (!paymentType) {
            setError("Please select a payment type (Full or Half).");
            setLoading(false);
            return;
          }

          if (paymentMethod === "credit") {
            const { cardNumber, expiry, cvv } = formData().payment;
            const predefined = PREDEFINED_PAYMENT_DETAILS.credit;
            if (
              cardNumber !== predefined.cardNumber ||
              expiry !== predefined.expiry ||
              cvv !== predefined.cvv
            ) {
              setError(
                "Invalid credit card details. Please use the predefined card details."
              );
              setLoading(false);
              return;
            }
          } else if (paymentMethod === "bank") {
            const { bankName, accountNumber } = formData().payment;
            const predefined = PREDEFINED_PAYMENT_DETAILS.bank;
            if (
              bankName !== predefined.bankName ||
              accountNumber !== predefined.accountNumber
            ) {
              setError(
                "Invalid bank details. Please use the predefined bank details."
              );
              setLoading(false);
              return;
            }
          }

          const price = Number(verifiedBookingData().price ?? 0);
          const headcount = Number(verifiedBookingData().headcount ?? 0);
          const totalPrice = price * headcount;
          const amount = paymentType === "full" ? totalPrice : totalPrice * 0.5;

          endpoint = `${apiUrl}/api/tourists/payment`;
          payload = {
            token: encryptedBookingData().token,
            method: paymentMethod,
            paymentType,
            amount,
            ...(paymentMethod === "credit"
              ? {
                  cardNumber: formData().payment.cardNumber,
                  expiry: formData().payment.expiry,
                  cvv: formData().payment.cvv,
                }
              : {
                  bankName: formData().payment.bankName,
                  accountNumber: formData().payment.accountNumber,
                }),
          };
          paymentResponse = await axios.post(endpoint, payload);

          if (paymentResponse.data.success) {
            alert("Payment successful!");
            setEncryptedPaymentData({
              paymentId: paymentResponse.data.paymentId,
              amount: paymentResponse.data.amount,
              paidAmount: paymentResponse.data.paidAmount,
              paymentDate: paymentResponse.data.paymentDate,
              status: paymentResponse.data.status,
              bookingId: paymentResponse.data.bookingId,
              paymentType,
            });
            setPhase((prev) => prev + 1);
          }
          return;

        case 3:
          endpoint = `${apiUrl}/api/tourists/confirm-booking`;
          payload = {
            paymentId: encryptedPaymentData().paymentId,
            amount: encryptedPaymentData().amount,
            paidAmount: encryptedPaymentData().paidAmount,
            paymentDate: encryptedPaymentData().paymentDate,
            status: encryptedPaymentData().status,
            bookingId: encryptedPaymentData().bookingId,
            touristId: encryptedBookingData().touristId,
            paymentType: encryptedPaymentData().paymentType,
          };
          confirmResponse = await axios.post(endpoint, payload);
          // console.log(
          //   "🚀 ~ PaymentForm.tsx:326 ~ submitPhase ~ payload:",
          //   payload
          // );

          if (confirmResponse.data.success) {
            alert("Booking confirmed! Check your email for details.");
            sessionStorage.removeItem("bookingKey");
            navigate("/home");
          }
          return;
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message || "Request failed"
        : err instanceof Error
        ? err.message
        : "Submission failed";

      setError(errorMessage);
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await submitPhase();
  };

  return (
    <div class="min-h-screen flex flex-col">
      <Navbar />

      <main class="flex-grow pt-16">
        <div class="max-w-2xl mx-auto container px-4 py-8">
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

          {error() && (
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              {error()}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            class="bg-white p-6 rounded-xs shadow-md"
          >
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
                      class="w-full px-3 py-2 border rounded-xs"
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
                      class="w-full px-3 py-2 border rounded-xs"
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
                      class="w-full px-3 py-2 border rounded-xs"
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
                      class="w-full px-3 py-2 border rounded-xs"
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
                    class="w-full px-3 py-2 border rounded-xs"
                  />
                </div>

                <CountryDropdown
                  value={formData().tourist.country}
                  onChange={(value: string) =>
                    handleInputChange("tourist", "country", value)
                  }
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
                    class="w-full px-3 py-2 border rounded-xs"
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
                    class="w-full px-3 py-2 border rounded-xs"
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
                      class="w-full px-3 py-2 border rounded-xs"
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
                      class="w-full px-3 py-2 border rounded-xs"
                    />
                  </div>
                </div>
              </div>
            </Show>

            <Show when={phase() === 2}>
              <h2 class="text-xl font-semibold mb-4">Payment Method</h2>
              <div class="space-y-4">
                {(() => {
                  const price = Number(verifiedBookingData().price ?? 0);
                  const headcount = Number(
                    verifiedBookingData().headcount ?? 0
                  );
                  const totalPrice = price * headcount;
                  return (
                    <div class="mb-4">
                      <p class="text-gray-700">
                        Total Price: LKR {totalPrice.toFixed(2)}
                      </p>
                      <p class="text-gray-700">
                        Amount to Pay: LKR{" "}
                        {formData().payment.paymentType === "full"
                          ? totalPrice.toFixed(2)
                          : (totalPrice * 0.5).toFixed(2)}
                      </p>
                    </div>
                  );
                })()}

                <div class="flex space-x-4 mb-4 transition-shadow duration-300">
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("payment", "paymentType", "full")
                    }
                    class={`px-4 py-2 rounded-xs ${
                      formData().payment.paymentType === "full"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Full Payment
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("payment", "paymentType", "half")
                    }
                    class={`px-4 py-2 rounded-xs ${
                      formData().payment.paymentType === "half"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Half Payment
                  </button>
                </div>

                <div class="flex space-x-4 mb-4 transition-shadow duration-300">
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("payment", "method", "credit")
                    }
                    class={`px-4 py-2 rounded-xs ${
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
                    class={`px-4 py-2 rounded-xs ${
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
                        class="w-full px-3 py-2 border rounded-xs"
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
                          class="w-full px-3 py-2 border rounded-xs"
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
                          class="w-full px-3 py-2 border rounded-xs"
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
                        class="w-full px-3 py-2 border rounded-xs"
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
                        class="w-full px-3 py-2 border rounded-xs"
                      />
                    </div>
                  </div>
                </Show>
              </div>
            </Show>

            <Show when={phase() === 3}>
              <h2 class="text-2xl font-semibold mb-6 text-gray-800">
                Confirm Your Booking
              </h2>

              <div class="bg-blue-50 p-6 rounded-md shadow-sm space-y-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-700 mb-2">
                    Tourist Information
                  </h3>
                  <p>
                    <strong>Name:</strong> {formData().tourist.firstName}{" "}
                    {formData().tourist.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData().tourist.email}
                  </p>
                  <p>
                    <strong>Contact Number:</strong>{" "}
                    {formData().tourist.contactNumber}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {encryptedPaymentData().status === "half_paid"
                      ? "Half Paid"
                      : encryptedPaymentData().status === "completed"
                      ? "Completed"
                      : encryptedPaymentData().status}
                  </p>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-gray-700 mb-2">
                    Payment Details
                  </h3>
                  <p>
                    <strong>Payment Type:</strong>{" "}
                    {encryptedPaymentData().paymentType === "full"
                      ? "Full Payment"
                      : "Half Payment"}
                  </p>
                  <p>
                    <strong>Total Amount:</strong> LKR{" "}
                    {encryptedPaymentData().amount}
                  </p>

                  <Show when={encryptedPaymentData().status === "half_paid"}>
                    <p class="text-sm text-gray-600 italic">
                      * Please note: The remaining balance will be settled at
                      the end of the tour.
                    </p>
                  </Show>

                  <p>
                    <strong>Paid Amount:</strong> LKR{" "}
                    {encryptedPaymentData().paidAmount}
                  </p>

                  <Show when={formData().payment.method === "credit"}>
                    <p>
                      <strong>Method:</strong> Credit/Debit Card
                    </p>
                    <p>
                      <strong>Card:</strong> ****
                      {formData().payment.cardNumber.slice(-4)}
                    </p>
                    <p>
                      <strong>Expires:</strong> {formData().payment.expiry}
                    </p>
                  </Show>

                  <Show when={formData().payment.method === "bank"}>
                    <p>
                      <strong>Method:</strong> Bank Transfer
                    </p>
                    <p>
                      <strong>Bank:</strong> {formData().payment.bankName}
                    </p>
                    <p>
                      <strong>Account:</strong>{" "}
                      {formData().payment.accountNumber}
                    </p>
                  </Show>
                </div>
              </div>

              <div class="mt-6">
                <label class="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    required
                    class="mt-1 accent-blue-600"
                  />
                  <span class="text-sm text-gray-700">
                    I confirm that all information provided is accurate and I
                    agree to the{" "}
                    <a href="/terms" class="text-blue-600 hover:underline">
                      Terms and Conditions
                    </a>
                    .
                  </span>
                </label>
              </div>
            </Show>

            <div class="flex justify-between mt-8">
              <Show when={phase() > 1}>
                <button
                  type="button"
                  onClick={() => setPhase((prev) => prev - 1)}
                  class="px-4 py-2 bg-gray-200 rounded-xs hover:bg-gray-300"
                  disabled={loading()}
                >
                  Back
                </button>
              </Show>
              <div class="ml-auto">
                <button
                  type="submit"
                  class="px-6 py-2 bg-blue-600 text-white rounded-xs hover:bg-blue-700 disabled:opacity-50"
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
