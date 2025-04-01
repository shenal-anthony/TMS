import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Packages from "./pages/Packages";
import { Route, Router } from "@solidjs/router";
import Events from "./pages/Events";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/packages" component={Packages} />
      <Route path="/events" component={Events} />
      <Route path="/about" component={About} />
    </Router>
  );
}

export default App;
