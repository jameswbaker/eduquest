import { useNavigate } from "react-router-dom";

const BackButton = ({ backRoute }) => {
    const navigate = useNavigate();
  
    return (
      <button className="back-btn" onClick={() => backRoute ? navigate(backRoute) : navigate(-1)}>
        🔙
      </button>
    );
};
  

export default BackButton;