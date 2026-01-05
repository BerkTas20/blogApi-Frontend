import {
  Button,
  Heading,
  Input,
  Stack,
  Textarea,
  Box,
  Text,

  Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/endpoints";
import { useNavigate } from "react-router-dom";
import type { CategoryDto } from "../api/types";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photo, setPhoto] = useState<File | null>(null);

  // ✅ categories
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // ŞİMDİLİK sabit (ileride auth / me() ile bağlarız)
  const userId = 1;

  const navigate = useNavigate();

  // Foto seçilince preview URL üret
  const previewUrl = useMemo(() => {
    if (!photo) return null;
    return URL.createObjectURL(photo);
  }, [photo]);

  // ✅ cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ✅ load categories
  useEffect(() => {
    (async () => {
      setCatLoading(true);
      try {
        const list = await api.getCategories();
        setCategories(list ?? []);
        // default: ilk kategori
        if (list && list.length > 0) {
          setCategoryId(list[0].id);
        } else {
          setCategoryId(null);
        }
      } catch {
        setCategories([]);
        setCategoryId(null);
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Başlık ve içerik zorunlu");
      return;
    }
    if (!categoryId) {
      setError("Kategori seçmelisiniz");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1) Post oluştur (id dönmeli)
      const createdPost = await api.createPost(
        userId,
        categoryId,
        title.trim(),
        description.trim()
      );

      // 2) Foto varsa postId ile upload et
      if (photo && createdPost?.id) {
        await api.uploadPostPhoto(createdPost.id, userId, photo);
      }

      navigate("/posts");
    } catch (e: any) {
      const status = e?.response?.status;

      if (status === 401 || status === 403) {
        setError("Bu işlem için giriş yapmalısınız.");
      } else {
        setError("Post oluşturulamadı. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="2xl"
      mx="auto"
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      boxShadow="md"
      bg="white"
    >
      <Stack gap={4}>
        <Heading size="lg">New Post</Heading>

        {error && (
          <Box
            bg="red.50"
            borderColor="red.200"
            borderWidth="1px"
            borderRadius="md"
            p={3}
            color="red.800"
          >
            {error}
          </Box>
        )}

        {/* ✅ Category dropdown */}
        <Stack gap={2}>
          <Text fontSize="sm" fontWeight="medium">
            Category *
          </Text>

          {catLoading ? (
    <HStackLike>
      <Spinner size="sm" />
      <Text fontSize="sm" opacity={0.7}>
        Kategoriler yükleniyor...
      </Text>
    </HStackLike>
  ) : categories.length === 0 ? (
    <Box
      bg="yellow.50"
      borderColor="yellow.200"
      borderWidth="1px"
      borderRadius="md"
      p={3}
    >
      <Text fontSize="sm" color="yellow.800">
        Kategori bulunamadı. (API boş dönüyor veya hata alıyor olabilir.)
      </Text>
    </Box>
  ) : (
    <Box
      borderWidth="1px"
      borderRadius="md"
      px={3}
      py={2}
      bg="white"
    >
      <select
        value={categoryId ?? ""}
        onChange={(e) => setCategoryId(Number(e.target.value))}
        style={{
          width: "100%",
          outline: "none",
          border: "none",
          background: "transparent",
        }}
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </Box>
  )}
</Stack>

        <Stack gap={2}>
          <Text fontSize="sm" fontWeight="medium">
            Title *
          </Text>
          <Input
            placeholder="Post başlığı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" fontWeight="medium">
            Description *
          </Text>
          <Textarea
            placeholder="Post içeriği"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" fontWeight="medium">
            Photo (optional)
          </Text>
          <Input
            type="file"
            accept="image/*"
            p={1}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setPhoto(file);
            }}
          />

          {previewUrl && (
            <Box borderWidth="1px" borderRadius="md" overflow="hidden" maxW="360px">
              <img
                src={previewUrl}
                alt="preview"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            </Box>
          )}
        </Stack>

        <Button
          bg="teal.400"
          color="white"
          _hover={{ bg: "teal.500" }}
          onClick={submit}
          disabled={loading || catLoading || !categoryId}
        >
          {loading ? "Paylaşılıyor..." : "Share Post"}
        </Button>
      </Stack>
    </Box>
  );
}

/**
 * Chakra v3'te HStack import etmeden minik helper:
 * (istersen direkt HStack import edip bunu silebilirsin)
 */
function HStackLike({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      {children}
    </Box>
  );
}
