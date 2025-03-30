import solidLogo from '../assets/solid.svg'

function Home() {
  return (
    <div >
      <h2>Welcome to Our Tour Booking Website</h2>
      <div>
        <a href="#">
          <img src={solidLogo} class="logo solid" width={50} alt="Solid logo" />
        </a>
      </div>

      <div class="destination-cards">
        {/* <!-- Example destination cards --> */}
        <div class="card" style="margin: 1rem;">
          <h3>Sunny Lake</h3>
          <img
            src="assets/malesiya.webp"
            style="width: auto; margin: 1rem;"
            alt="malysiya"
          ></img>
          <p>
            Set aside on a relaxing level four of Sunny Lake’s crystal clean
            waters.
          </p>
        </div>
        <div class="card" style="margin: 1rem;">
          <h3>Mountain Valley</h3>
          <img
            src="assets/philippines.jpg"
            style="width: auto; margin: 1rem;"
            alt="philippines"
          ></img>
          <p>
            Experience the breathtaking views of Mountain Valley’s lush
            greenery.
          </p>
        </div>
        <div class="card" style="margin: 1rem;">
          <h3>Desert Dunes</h3>
          <img src="./assets/visayas.webp" style="width: auto; margin: 1rem;">
            {" "}
          </img>

          <p>Explore the vastness of Desert Dunes and its golden sands.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
