import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/posts"); // ✅ login yerine posts
  };

  return (
    <Box borderBottomWidth="1px" bg="white">
      <Flex maxW="6xl" mx="auto" px={4} py={3} align="center" gap={3}>
       <Heading fontSize="28px" fontWeight="700" color={"teal.600"}>
      <Link to="/posts">My Blog</Link>
  </Heading>

        <Box flex="1" />

        {token && (
          <Link to="/posts/new">
            <Button bg="teal" color="white" _hover={{ bg: "teal.500" }} size="sm">
              New Post
            </Button>
          </Link>
        )}

        {token ? (
          <Button size="sm" variant="outline" onClick={logout}>
            Logout
          </Button>
        ) : (
          <Link to="/login">
            <Button size="sm" variant="outline">
              Login
            </Button>
          </Link>
        )}
      </Flex>
    </Box>
  );
}
