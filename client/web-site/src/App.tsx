import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Packages from "./pages/Packages";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Route, Router} from "@solidjs/router";

function App() {
  return (
    <div class="h-full">
      <Navbar />
      <main class="flex-grow">
      <Router>
        <Route path="/" component={Home} />
        <Route path="/home" component={Home} />
        <Route path="/destinations" component={Destinations} />
        <Route path="/packages" component={Packages} />
      </Router>
      </main>
      <Footer />
    </div>
  );
}

export default App;
