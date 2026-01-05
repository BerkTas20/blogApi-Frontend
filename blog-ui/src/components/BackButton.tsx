import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/"); // fallback
    }
  };

  return (
    <Button
      variant="outline"
      onClick={goBack}
      alignSelf="flex-start"
    >
      ← Geri
    </Button>
  );
}
