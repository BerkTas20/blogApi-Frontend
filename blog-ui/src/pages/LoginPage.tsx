import { useState } from "react";
import {
  Flex,
  Heading,
  Input,
  Button,
  Stack,
  chakra,
  Box,
  Link,
  Text,
} from "@chakra-ui/react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { api } from "../api/endpoints";
import { useNavigate } from "react-router-dom";

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // ✅ Çift tıklama / tekrar submit engeli
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.login({
        username,
        password,
        rememberMe: true,
      });

      if (!res?.token) {
        throw new Error("Token dönmedi");
      }

      localStorage.setItem("token", res.token);
      navigate("/posts");
    } catch (err: any) {
      const status = err?.response?.status;

      // 🔒 UX + Security: yanlış giriş her zaman aynı mesaj
      if (status === 401 || status === 403 || status === 500) {
        setError("Kullanıcı adı veya şifre yanlış.");
      } else {
        setError("Sunucuya ulaşılamıyor. Lütfen tekrar deneyin.");
      }
    } finally {
      // ✅ KRİTİK: loading her durumda kapanır
      setLoading(false);
    }
  };

  return (
    <Flex
      direction="column"
      w="100%"
      minH="calc(100vh - 64px)" // navbar yüksekliği
      bg="white"
      justify="center"
      align="center"
      px={4}
    >
      <Stack gap={4} align="center">
        {/* Avatar */}
        <Box
          w="48px"
          h="48px"
          borderRadius="full"
          bg="teal.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CFaUserAlt color="white" />
        </Box>

        <Heading color="teal.500" size="lg">
          Welcome
        </Heading>

        <Box w={{ base: "90%", sm: "360px", md: "340px" }}>
          <form onSubmit={onSubmit}>
            <Stack gap={4} p="1.25rem" bg="white" boxShadow="lg" borderRadius="md">
              {error && (
                <Box
                  bg="red.50"
                  borderColor="red.200"
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  color="red.800"
                  fontSize="sm"
                >
                  {error}
                </Box>
              )}

              {/* Username */}
              <Box position="relative">
                <Box
                  position="absolute"
                  top="50%"
                  left="12px"
                  transform="translateY(-50%)"
                >
                  <CFaUserAlt color="gray.300" />
                </Box>
                <Input
                  pl="2.5rem"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username or email"
                  autoComplete="username"
                />
              </Box>

              {/* Password */}
              <Box position="relative">
                <Box
                  position="absolute"
                  top="50%"
                  left="12px"
                  transform="translateY(-50%)"
                >
                  <CFaLock color="gray.300" />
                </Box>

                <Input
                  pl="2.5rem"
                  pr="4.5rem"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                />

                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="teal"
                  position="absolute"
                  top="50%"
                  right="8px"
                  transform="translateY(-50%)"
                  onClick={() => setShowPassword((s) => !s)}
                  type="button"
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </Box>

              <Text fontSize="xs" textAlign="right">
                <Link color="teal.500">forgot password?</Link>
              </Text>

              <Button
                type="submit"
                bg="teal.500"
                color="white"
                _hover={{ bg: "teal.600" }}
                _active={{ bg: "teal.700" }}
                width="full"
                borderRadius="md"
                loading={loading}
                disabled={loading}
              >
                Sign in
              </Button>
            </Stack>
          </form>
        </Box>

        <Box fontSize="sm">
          New to us?{" "}
          <Link color="teal.500" fontWeight="semibold">
            Sign Up
          </Link>
        </Box>
      </Stack>
    </Flex>
  );
}
