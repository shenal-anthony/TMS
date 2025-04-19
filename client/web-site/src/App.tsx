import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Packages from "./pages/Packages";
import { Route, Router } from "@solidjs/router";
import Events from "./pages/Events";
import About from "./pages/About";
import DestinationDetail from "./pages/DestinationDetail";
import PackageDetail from "./pages/PackageDetail";
import Booking from "./pages/BookingConfiguration";
import PaymentForm from "./pages/PaymentForm";
import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/destination/:id" component={DestinationDetail} />
      <Route path="/packages" component={Packages} />
      <Route path="/package/:id" component={PackageDetail} />
      <Route path="/booking/:id" component={Booking} />
      <Route path="/checkout" component={PaymentForm} />
      <Route path="/events" component={Events} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
    </Router>
  );
}

export default App;
