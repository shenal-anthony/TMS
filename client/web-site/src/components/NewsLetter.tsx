import { Component, createSignal } from "solid-js";

const NewsLetter: Component = () => {
  const [email, setEmail] = createSignal("");

  const handleSubscribe = (e: Event & { currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    alert(`Thank you for subscribing with ${email()}`);
    setEmail("");
  };
  return (
    <div class="bg-gray-100 rounded-lg p-8 mb-12">
      <h2 class="text-2xl font-bold mb-4">Stay up to date</h2>
      <p class="mb-6">
        Get regular updates about upcoming events by placing out new or
        compelling stories.
      </p>
      <form onSubmit={handleSubscribe} class="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          placeholder="Your email"
          required
          class="flex-grow px-4 py-2 border rounded"
          value={email()}
          onInput={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default NewsLetter;
