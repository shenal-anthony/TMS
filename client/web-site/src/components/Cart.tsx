import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { FaSolidCartShopping } from "solid-icons/fa";
import { FaSolidCalendarDays } from "solid-icons/fa";
import { IoTrashBinSharp } from "solid-icons/io";
import { VsChromeClose } from "solid-icons/vs";
import { useCart } from "../util/useCart";

const Cart = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  const { cartItems, removeFromCart, totalPrice } = useCart();

  const totalItems = () => cartItems().length;

  return (
    <div class="relative">
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        class="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
        aria-label="Cart"
      >
        <FaSolidCartShopping class="h-6 w-6" />
        {cartItems().length > 0 && (
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartItems().length}
          </span>
        )}
      </button>

      {/* Drawer Container */}
      <div class={`fixed inset-0 z-50 ${isOpen() ? "visible" : "invisible"}`}>
        {/* Overlay with gradual blur effect */}
        <div
          class={`absolute inset-0 bg-black/30 transition-all duration-300 ease-in-out ${
            isOpen()
              ? "opacity-100 backdrop-blur-xs"
              : "opacity-0 backdrop-blur-none"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer Content */}
        <div
          class={`absolute top-0 right-0 h-full w-full max-w-md bg-white/95 shadow-xl transform transition-transform duration-300 ease-in-out ${
            isOpen() ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div class="flex flex-col h-full">
            {/* Header */}
            <div class="flex justify-between items-center border-b p-4 bg-white">
              <h2 class="text-lg font-bold">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                class="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <VsChromeClose class="h-7 w-7" />
              </button>
            </div>

            {/* Cart Items */}
            <div class="flex-grow overflow-y-auto p-4">
              {totalItems() === 0 ? (
                <div class="flex flex-col items-center justify-center h-full text-center p-4">
                  <FaSolidCartShopping class="h-12 w-12 text-gray-400 mb-4" />
                  <p class="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <ul class="space-y-2">
                  {cartItems().map((item) => (
                    <li class="group">
                      <div class="flex justify-between items-start p-3 rounded-lg transition-all duration-200 group-hover:bg-amber-100/80 group-hover:shadow-sm">
                        <div class="flex-1">
                          <h3 class="font-medium">{item.pkgName}</h3>
                          <div class="flex items-center mt-1 text-gray-500 text-sm">
                            <FaSolidCalendarDays class="mr-1.5 h-4 w-4" />
                            <span>
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div class="flex items-center justify-between mt-1">
                            <span class="text-gray-500 text-sm">
                              {item.headcount}{" "}
                              {item.headcount === 1 ? "person" : "people"}
                            </span>
                            <span class="text-gray-600 font-medium">
                              ${item.price * item.headcount}
                            </span>
                          </div>
                        </div>
                        <button
                          class="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity ml-4"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <IoTrashBinSharp class="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div class="border-t p-4 bg-white">
              <div class="flex justify-between font-bold text-lg mb-4">
                <span>Total:</span>
                <span>${totalPrice()}</span>
              </div>
              <A
                href="/checkout"
                onClick={() => setIsOpen(false)}
                class="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded transition-colors"
              >
                Checkout
              </A>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
