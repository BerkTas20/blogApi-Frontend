import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/endpoints";
import type {
  PostDto,
  PostResponse,
  CategoryDto,
  PopularPostDto,
} from "../api/types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCategoryStyleById } from "../utils/categoryColor";

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8090/api/v1";
const postPhotoUrl = (postId: number) => `${API_BASE}/photo/post/${postId}`;

type LikeUiState = {
  count: number;
  liked: boolean;
  loading: boolean;
};

// Popular sidebar için frontend’de zenginleştirilmiş tip
type PopularUiItem = PopularPostDto & {
  __likeCount: number;
};

export default function PostsPage() {
  const [data, setData] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [noPhoto, setNoPhoto] = useState<Record<number, boolean>>({});

  const [popularLoading, setPopularLoading] = useState(false);
  const [popular, setPopular] = useState<PopularUiItem[]>([]);
  const [popularNoPhoto, setPopularNoPhoto] = useState<Record<number, boolean>>(
    {}
  );

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const categoryMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of categories) m.set(Number(c.id), c.title);
    return m;
  }, [categories]);

  const [likes, setLikes] = useState<Record<number, LikeUiState>>({});

  const token = localStorage.getItem("token");
  const currentUserId = 1;
  const navigate = useNavigate();

  const pageNumber = data?.pageNumber ?? 0;
  const pageSize = data?.pageSize ?? 10;

  const hydrateLikesForPosts = async (posts: PostDto[]) => {
    const ids = posts
      .map((p) => Number(p.id))
      .filter((x) => Number.isFinite(x) && x > 0);

    setLikes((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        next[id] = next[id] ?? { count: 0, liked: false, loading: false };
      }
      return next;
    });

    await Promise.all(
      ids.map(async (id) => {
        try {
          const count = await api.getLikeCount(id);
          setLikes((prev) => ({
            ...prev,
            [id]: {
              ...(prev[id] ?? { count: 0, liked: false, loading: false }),
              count,
            },
          }));
        } catch {
          // ignore
        }
      })
    );

    if (!token) return;

    await Promise.all(
      ids.map(async (id) => {
        try {
          await api.getMyLike(currentUserId, id);
          setLikes((prev) => ({
            ...prev,
            [id]: {
              ...(prev[id] ?? { count: 0, liked: false, loading: false }),
              liked: true,
            },
          }));
        } catch {
          // ignore (404)
        }
      })
    );
  };

  const buildPopularUi = async (
    baseList: PopularPostDto[],
    fallbackFromPage: PostDto[],
    limit: number
  ): Promise<PopularUiItem[]> => {
    const baseIds = (baseList ?? [])
      .map((x) => Number(x.id))
      .filter((x) => Number.isFinite(x) && x > 0);

    const baseCounts = await Promise.all(
      baseIds.map(async (id) => {
        try {
          const c = await api.getLikeCount(id);
          return [id, c] as const;
        } catch {
          return [id, 0] as const;
        }
      })
    );
    const countMap = new Map<number, number>(baseCounts);

    // sayfadaki postları da aday yap (likes state ile)
    const fromPageCandidates: PopularUiItem[] = (fallbackFromPage ?? [])
      .map((p) => {
        const id = Number(p.id);
        const c = likes[id]?.count ?? 0;
        return {
          ...(p as any),
          __likeCount: c,
        } as PopularUiItem;
      })
      .filter((x) => Number.isFinite(Number(x.id)));

    const baseUi: PopularUiItem[] = (baseList ?? []).map((x) => {
      const id = Number(x.id);
      return {
        ...x,
        __likeCount: countMap.get(id) ?? 0,
      };
    });

    const seen = new Set<number>();
    const merged: PopularUiItem[] = [];

    for (const item of [...baseUi, ...fromPageCandidates]) {
      const id = Number(item.id);
      if (!Number.isFinite(id) || id <= 0) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      merged.push(item);
    }

    merged.sort((a, b) => (b.__likeCount ?? 0) - (a.__likeCount ?? 0));
    return merged.slice(0, limit);
  };

  const loadPopular = async (fallbackFromPage: PostDto[] = []) => {
    const LIMIT = 6;
    setPopularLoading(true);

    try {
      const list = await api.getPopularPosts(LIMIT);
      const ui = await buildPopularUi(list ?? [], fallbackFromPage, LIMIT);
      setPopular(ui);
      setPopularNoPhoto({});
    } catch {
      try {
        const ui = await buildPopularUi([], fallbackFromPage, LIMIT);
        setPopular(ui);
      } catch {
        setPopular([]);
      }
    } finally {
      setPopularLoading(false);
    }
  };

  const load = async (pn: number) => {
    setLoading(true);
    try {
      const res = await api.getPosts(pn, pageSize);
      setData(res);
      setNoPhoto({});

      await hydrateLikesForPosts(res?.content ?? []);
      await loadPopular(res?.content ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const list = await api.getCategories();
        setCategories(list ?? []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const { pathname } = useLocation();
  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ✅ Popular listede like sayısını ANINDA güncelle
  const bumpPopularLikeCount = (postId: number, delta: number) => {
    setPopular((prev) =>
      prev
        .map((x) =>
          Number(x.id) === postId
            ? { ...x, __likeCount: Math.max(0, (x.__likeCount ?? 0) + delta) }
            : x
        )
        .sort((a, b) => (b.__likeCount ?? 0) - (a.__likeCount ?? 0))
    );
  };

  const toggleLike = async (postId: number) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const ls = likes[postId] ?? { count: 0, liked: false, loading: false };
    if (ls.loading) return;

    setLikes((prev) => ({ ...prev, [postId]: { ...ls, loading: true } }));

    // optimistic delta
    const delta = ls.liked ? -1 : +1;

    // ✅ UI anında güncellensin (sol kart + sağ popular)
    setLikes((prev) => ({
      ...prev,
      [postId]: {
        ...ls,
        liked: !ls.liked,
        count: Math.max(0, ls.count + delta),
        loading: true,
      },
    }));
    bumpPopularLikeCount(postId, delta);

    try {
      if (!ls.liked) {
        await api.likePost(currentUserId, postId);
      } else {
        await api.unlikePost(currentUserId, postId);
      }

      // loading kapat
      setLikes((prev) => ({
        ...prev,
        [postId]: { ...(prev[postId] ?? ls), loading: false },
      }));

      // server ile senkron (ama UI zaten anında güncellendi)
      await loadPopular((data?.content ?? []) as PostDto[]);
    } catch {
      // rollback
      setLikes((prev) => ({
        ...prev,
        [postId]: { ...ls, loading: false },
      }));
      bumpPopularLikeCount(postId, -delta);
    }
  };

  if (loading && !data) return <Spinner />;

  return (
    <Stack gap={4}>
      <Flex align="center">
        <Heading size="lg">Posts</Heading>
        <Box flex="1" />
      </Flex>

      <Flex gap={6} align="start" direction={{ base: "column", lg: "row" }}>
        {/* SOL */}
        <Box flex="1" w="100%" minW={0}>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={3}>
            {(data?.content ?? []).map((p: PostDto) => {
              const id = Number(p.id);
              const createdAt = formatDate((p as any).createdDateTime);

              const categoryIdRaw =
                (p as any).categoryId ?? (p as any).category?.id ?? null;
              const categoryId =
                typeof categoryIdRaw === "number"
                  ? categoryIdRaw
                  : categoryIdRaw != null
                  ? Number(categoryIdRaw)
                  : undefined;

              const categoryTitle =
                (p as any).categoryTitle ||
                (p as any).category?.title ||
                (categoryId ? categoryMap.get(categoryId) : undefined);

              const style = getCategoryStyleById(categoryId);

              const likeUi = likes[id] ?? {
                count: 0,
                liked: false,
                loading: false,
              };

              return (
                <Box
                  key={p.id}
                  borderWidth="1px"
                  borderRadius="md"
                  overflow="hidden"
                  bg="white"
                  boxShadow="sm"
                  maxW="260px"
                  w="100%"
                  mx="auto"
                  transition="transform 150ms ease, box-shadow 150ms ease"
                  _hover={{
                    transform: "translateY(-4px) scale(1.02)",
                    boxShadow: "lg",
                  }}
                >
                  {/* FOTO */}
                  <Box
                    w="100%"
                    aspectRatio={1}
                    bg="gray.100"
                    overflow="hidden"
                    position="relative"
                  >
                    {!noPhoto[id] && (
                      <img
                        src={postPhotoUrl(id)}
                        alt={p.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        onError={() =>
                          setNoPhoto((prev) => ({ ...prev, [id]: true }))
                        }
                      />
                    )}

                    {noPhoto[id] && (
                      <Flex
                        position="absolute"
                        inset={0}
                        align="center"
                        justify="center"
                      >
                        <Text fontSize="xs" color="gray.500">
                          No Photo
                        </Text>
                      </Flex>
                    )}
                  </Box>

                  {/* CONTENT */}
                  <Stack gap={1.5} p={4} minW={0}>
                    {/* Kategori + Like */}
                    {(categoryTitle || Number.isFinite(likeUi.count)) && (
                      <Flex align="center" gap={2} minW={0}>
                        {categoryTitle && (
                          <Badge
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            color={style.color}
                            {...(style.bg.startsWith("linear-gradient")
                              ? { background: style.bg }
                              : { bg: style.bg })}
                            whiteSpace="nowrap"
                            flexShrink={0}
                          >
                            {categoryTitle}
                          </Badge>
                        )}

                        <Box flex="1" minW={0} />

                        {/* ❤️ Like (DEĞİŞMEYECEK) */}
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => toggleLike(id)}
                          disabled={!token || likeUi.loading}
                          title={!token ? "Like için giriş yap" : "Like"}
                          flexShrink={0}
                        >
                          {likeUi.liked ? "❤️" : "🤍"} {likeUi.count}
                        </Button>
                      </Flex>
                    )}

                    {/* Title */}
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      minW={0}
                      lineClamp={1}
                      wordBreak="break-word"
                    >
                      {p.title}
                    </Text>

                    {/* Description */}
                    <Text
                      fontSize="sm"
                      color="gray.700"
                      minW={0}
                      lineClamp={2}
                      wordBreak="break-word"
                    >
                      {p.description}
                    </Text>

                    {/* ✅ Tarih: View üstünde */}
                    {createdAt && (
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {createdAt}
                      </Text>
                    )}

                    <Box pt={2}>
                      <Link
                        to={`/posts/${p.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Button size="sm" width="full" bg="teal" color="white">
                          View
                        </Button>
                      </Link>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </SimpleGrid>

          {/* Pagination */}
          <Flex gap={2} justify="center" mt={6}>
            <Button
              onClick={() => load(Math.max(0, pageNumber - 1))}
              disabled={pageNumber <= 0}
            >
              Prev
            </Button>
            <Button
              onClick={() => load(pageNumber + 1)}
              disabled={!!data?.lastPage}
            >
              Next
            </Button>
          </Flex>
        </Box>

        {/* SAĞ */}
        <Box
          w={{ base: "100%", lg: "320px" }}
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
          boxShadow="sm"
          p={4}
          position={{ base: "static", lg: "sticky" }}
          top={{ lg: "84px" }}
          minW={0}
        >
          <Flex align="center" mb={3}>
            <Heading size="md">Popular Posts</Heading>
            <Box flex="1" />
          </Flex>

          {popularLoading ? (
            <Spinner />
          ) : popular.length === 0 ? (
            <Text fontSize="sm" opacity={0.7}>
              Henüz veri yok.
            </Text>
          ) : (
            <Stack gap={4}>
              {popular.map((pp) => {
                const pid = Number(pp.id);
                const dt = formatDate((pp as any).createdDateTime);

                return (
                  <Link
                    key={pp.id}
                    to={`/posts/${pp.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Flex gap={3} align="center" minW={0}>
                      <Box
                        w="64px"
                        h="64px"
                        borderRadius="md"
                        overflow="hidden"
                        bg="gray.100"
                        flexShrink={0}
                      >
                        {!popularNoPhoto[pid] ? (
                          <img
                            src={postPhotoUrl(pid)}
                            alt={pp.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                            onError={() =>
                              setPopularNoPhoto((prev) => ({
                                ...prev,
                                [pid]: true,
                              }))
                            }
                          />
                        ) : null}
                      </Box>

                      <Box minW={0} flex="1">
                        <Text
                          fontWeight="bold"
                          fontSize="sm"
                          lineClamp={2}
                          wordBreak="break-word"
                        >
                          {pp.title}
                        </Text>

                        <Flex align="center" gap={2} mt={1} minW={0}>
                          {dt && (
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap"
                            >
                              {dt}
                            </Text>
                          )}
                          <Box flex="1" />
                          <Text fontSize="xs" color="gray.600" flexShrink={0}>
                            ❤️ {pp.__likeCount ?? 0}
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>
                  </Link>
                );
              })}
            </Stack>
          )}
        </Box>
      </Flex>
    </Stack>
  );
}
