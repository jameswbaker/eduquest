import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={() => navigate("/ability")}>Go to Ability Viewer</button>
      <button onClick={() => navigate("/test")}>Go to Test</button>

      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default Home;