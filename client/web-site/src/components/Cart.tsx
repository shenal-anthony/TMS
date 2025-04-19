import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { FaSolidCartShopping } from "solid-icons/fa";
import { TiDelete } from "solid-icons/ti";
import { IoTrashBinSharp } from 'solid-icons/io'
import { VsChromeClose } from 'solid-icons/vs'

const Cart = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  
  // Mock cart data
  const [cartItems] = createSignal([
    { id: 1, name: "Tour Package 1", price: 100 },
    { id: 2, name: "Tour Package 2", price: 150 },
    { id: 3, name: "Tour Package 3", price: 200 },
  ]);

  const totalItems = () => cartItems().length;
  const totalPrice = () => cartItems().reduce((sum, item) => sum + item.price, 0);

  return (
    <div class="relative">
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        class="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
        aria-label="Cart"
      >
        <FaSolidCartShopping class="h-6 w-6" />
        {totalItems() > 0 && (
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems()}
          </span>
        )}
      </button>

      {/* Drawer Container */}
      <div
        class={`fixed inset-0 z-50 ${isOpen() ? "visible" : "invisible"}`}
      >
        {/* Overlay with gradual blur effect */}
        <div
          class={`absolute inset-0 bg-black/30 transition-all duration-300 ease-in-out ${
            isOpen() ? "opacity-100 backdrop-blur-sm" : "opacity-0 backdrop-blur-none"
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
                      <div class="flex justify-between items-center p-3 rounded-lg transition-all duration-200 group-hover:bg-amber-50/80 group-hover:shadow-sm">
                        <div class="flex items-center space-x-4">
                          <h3 class="font-medium">{item.name}</h3>
                          <p class="text-gray-600">${item.price.toFixed(2)}</p>
                        </div>
                        <button class="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <span>${totalPrice().toFixed(2)}</span>
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