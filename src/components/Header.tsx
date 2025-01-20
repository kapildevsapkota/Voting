export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">TechConf 2023</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="#" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Schedule
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Speakers
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
