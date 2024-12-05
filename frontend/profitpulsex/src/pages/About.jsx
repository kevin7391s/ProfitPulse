import React from "react";
import person1 from "../assets/105828845.jpg";
import person2 from "../assets/1545159912042.jpg";
import person3 from "../assets/1649558051151.jpg";
import person4 from "../assets/1709157975796.jpg";

function About() {
  return (
    <div className="min-h-screen bg-bgdark p-10 font-body">
      {/* Main Section */}
      <div className="text-center max-w-screen-lg mx-auto">
        <h1 className="text-4xl font-heading text-white mb-4">
          Meet our team of{" "}
          <span className="text-lightgreen">creators</span>,{" "}
          <span className="text-lightgreen">designers</span>, and world-class{" "}
          <span className="text-lightgreen">problem solvers</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
          To be the company our customers want us to be, it takes an eclectic
          group of passionate operators. Get to know the people leading the way
          at ProfitPulseX.
        </p>
      </div>

      {/* Team Section */}
      <div className="flex justify-center mt-16 space-x-10">
        <div className="text-center bg-gray-800 p-6 rounded-lg border border-lightgreen">
          <img
            src={person1}
            alt="Mitchell Brown"
            className="w-40 h-40 object-cover rounded-full mx-auto"
          />
          <h2 className="mt-4 text-xl text-lightgreen font-bold">Mitchell Brown</h2>
          <p className="text-white">Team Lead & Backend Lead</p>
          <p className="text-white mt-2">
            Mitchell drives the project with a passion for backend architecture
            and leadership. His technical expertise ensures that our backend is
            scalable and efficient, while his leadership keeps the team motivated
            and aligned with our goals.
          </p>
        </div>

        <div className="text-center bg-gray-800 p-6 rounded-lg border border-lightgreen">
          <img
            src={person2}
            alt="Kevin Smith"
            className="w-40 h-40 object-cover rounded-full mx-auto"
          />
          <h2 className="mt-4 text-xl text-lightgreen font-bold">Kevin Smith</h2>
          <p className="text-white">Frontend Lead & Database Support</p>
          <p className="text-white mt-2">
            Kevin brings creativity and innovation to the front end of the project.
            With his keen eye for detail and user experience, he ensures that our
            interface is not only functional but also visually engaging. His
            support on the database side ensures smooth integration across the
            board.
          </p>
        </div>

        <div className="text-center bg-gray-800 p-6 rounded-lg border border-lightgreen">
          <img
            src={person3}
            alt="Tarek Silmi"
            className="w-40 h-40 object-cover rounded-full mx-auto"
          />
          <h2 className="mt-4 text-xl text-lightgreen font-bold">Tarek Silmi</h2>
          <p className="text-white">Database Lead & Frontend Support</p>
          <p className="text-white mt-2">
            Tarek is the mastermind behind our database architecture. His
            dedication to data integrity and performance ensures that our
            platform runs smoothly. In addition, his support for the frontend team
            helps maintain a seamless connection between the backend and user
            interface.
          </p>
        </div>

        <div className="text-center bg-gray-800 p-6 rounded-lg border border-lightgreen">
          <img
            src={person4}
            alt="Mohammed Rashid"
            className="w-40 h-40 object-cover rounded-full mx-auto"
          />
          <h2 className="mt-4 text-xl text-lightgreen font-bold">Mohammed Rashid</h2>
          <p className="text-white">QA Lead & Backend Support</p>
          <p className="text-white mt-2">
            Mohammed ensures that our platform is reliable and bug-free. His
            meticulous attention to quality assurance keeps our code robust and
            efficient. Additionally, his backend support work complements the
            overall development process, ensuring smooth functionality.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
