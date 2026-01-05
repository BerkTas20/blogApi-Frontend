import {
  Heading,
  Spinner,
  Stack,
  Text,
  Image,
  Box,
  Textarea,
  Button,
  HStack,
  Input,
  Dialog,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { api } from "../api/endpoints";
import type { PostDto, CommentDto } from "../api/types";
import { formatDate } from "../utils/date";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8090/api/v1";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // post edit
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  // dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);

  // comments
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // Şimdilik sabit – istersen api.me() ile bağlarız
  const currentUserId = 1;

  const photoUrl = useMemo(() => `${API_BASE}/photo/post/${postId}`, [postId]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const list = await api.getComments(postId);
      setComments(list ?? []);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(postId) || postId <= 0) return;

    (async () => {
      setLoading(true);
      try {
        const res = await api.getPostById(postId);
        setPost(res);
        setImgError(false);
        setEditTitle(res.title ?? "");
        setEditDesc(res.description ?? "");
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  useEffect(() => {
    if (!Number.isFinite(postId) || postId <= 0) return;
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const addComment = async () => {
    if (!isLoggedIn) return; // ✅ UI seviyesinde güvenlik
    const desc = newComment.trim();
    if (!desc) return;

    await api.createComment(postId, currentUserId, desc);
    setNewComment("");
    loadComments();
  };

  const saveEdit = async () => {
    if (!isLoggedIn) return; // ✅
    if (editingId == null) return;
    const desc = editingText.trim();
    if (!desc) return;

    await api.updateComment(editingId, { description: desc });
    setEditingId(null);
    setEditingText("");
    loadComments();
  };

  const deleteComment = async (id: number) => {
    if (!isLoggedIn) return; // ✅
    if (!confirm("Yorum silinsin mi?")) return;
    await api.deleteComment(id);
    loadComments();
  };

  const startPostEdit = () => {
    if (!post) return;
    setEditTitle(post.title ?? "");
    setEditDesc(post.description ?? "");
    setIsEditingPost(true);
  };

  const cancelPostEdit = () => {
    if (!post) return;
    setEditTitle(post.title ?? "");
    setEditDesc(post.description ?? "");
    setIsEditingPost(false);
  };

  const savePost = async () => {
    if (!isLoggedIn) return; // ✅
    const t = editTitle.trim();
    const d = editDesc.trim();
    if (!t || !d) return;

    setSavingPost(true);
    try {
      const updated = await api.updatePost(postId, { title: t, description: d });
      setPost(updated);
      setIsEditingPost(false);
    } finally {
      setSavingPost(false);
    }
  };

  const confirmDeletePost = async () => {
    if (!isLoggedIn) return; // ✅
    setDeletingPost(true);
    try {
      await api.deletePost(postId);
      setDeleteOpen(false);
      navigate(-1);
    } finally {
      setDeletingPost(false);
    }
  };

  if (!Number.isFinite(postId) || postId <= 0) return <Text>Geçersiz post id</Text>;
  if (loading) return <Spinner />;
  if (!post) return <Text>Post bulunamadı</Text>;

  return (
    <Stack gap={4}>
      <HStack justify="space-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Geri
        </Button>

        {/* Post aksiyonları: sadece login ise göster */}
        {isLoggedIn && (
          <HStack>
            {!isEditingPost ? (
              <>
                <Button variant="outline" onClick={startPostEdit}>
                  Düzenle
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(true)}
                  disabled={deletingPost}
                >
                  {deletingPost ? "Siliniyor..." : "Sil"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={cancelPostEdit}
                  disabled={savingPost}
                >
                  İptal
                </Button>
                <Button
                  onClick={savePost}
                  disabled={savingPost || !editTitle.trim() || !editDesc.trim()}
                >
                  {savingPost ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </>
            )}
          </HStack>
        )}
      </HStack>

      {!isEditingPost ? (
        <Heading textAlign="center">{post.title}</Heading>
      ) : (
        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
      )}

      {!imgError ? (
        <Box w="100%" aspectRatio={16 / 9} overflow="hidden" borderRadius="lg">
          <Image
            src={photoUrl}
            alt={post.title}
            w="100%"
            h="100%"
            objectFit="contain"
            onError={() => setImgError(true)}
          />
        </Box>
      ) : (
        <Box fontSize="sm" opacity={0.7}>
          (Bu post için fotoğraf bulunamadı ya da yüklenemedi.)
        </Box>
      )}

      {!isEditingPost ? (
        <Text whiteSpace="pre-wrap">{post.description}</Text>
      ) : (
        <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
      )}

      <Text fontSize="sm" opacity={0.7}>
        Created: {formatDate(post.createdDateTime)} | Updated:{" "}
        {formatDate(post.updatedDateTime)}
      </Text>

      <Box borderTopWidth="1px" opacity={0.3} />

      {/* COMMENTS */}
      <Stack gap={3}>
        <Heading size="md">Yorumlar</Heading>

        {/* ✅ Login olmayan yorum yazamasın */}
        <Textarea
          placeholder={isLoggedIn ? "Yorum yaz..." : "Yorum yazmak için giriş yapmalısın"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!isLoggedIn}
        />

        <HStack justify="space-between">
          {!isLoggedIn ? (
            <Text fontSize="sm" opacity={0.7}>
              Yorum eklemek için giriş yapmalısın.
            </Text>
          ) : (
            <Box />
          )}

          <HStack justify="flex-end">
            {!isLoggedIn && (
              <RouterLink to="/login" style={{ textDecoration: "none" }}>
              <Button variant="outline" size="sm">
                Login
              </Button>
            </RouterLink>
            )}
            <Button onClick={addComment} disabled={!isLoggedIn || !newComment.trim()}>
              Yorum ekle
            </Button>
          </HStack>
        </HStack>

        {commentsLoading ? (
          <Spinner />
        ) : comments.length === 0 ? (
          <Text opacity={0.6}>Henüz yorum yok.</Text>
        ) : (
          <Stack gap={3}>
            {comments.map((c) => {
              const isEditing = editingId === c.id;

              return (
                <Box key={c.id} borderWidth="1px" borderRadius="lg" p={3}>
                  <Text fontSize="sm" opacity={0.6} mb={1}>
                    {c.userName || `User #${c.userId}`}
                  </Text>

                  {isEditing ? (
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      disabled={!isLoggedIn}
                    />
                  ) : (
                    <Text whiteSpace="pre-wrap">{c.description}</Text>
                  )}

                  {/* ✅ Düzenle/Sil sadece login ise göster */}
                  {isLoggedIn && (
                    <HStack mt={2} justify="flex-end">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditingText("");
                            }}
                          >
                            İptal
                          </Button>
                          <Button size="sm" onClick={saveEdit} disabled={!editingText.trim()}>
                            Kaydet
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(c.id);
                              setEditingText(c.description);
                            }}
                          >
                            Düzenle
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteComment(c.id)}
                          >
                            Sil
                          </Button>
                        </>
                      )}
                    </HStack>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Stack>

      {/* Delete Dialog: sadece login ise anlamlı, ama yine de kalsın */}
      <Dialog.Root open={deleteOpen} onOpenChange={(e) => setDeleteOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="lg">
            <Dialog.Header fontWeight="semibold">Post silinsin mi?</Dialog.Header>
            <Dialog.Body>
              <Text opacity={0.8}>
                Bu işlem geri alınamaz. Post kalıcı olarak silinecek.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack justify="flex-end" w="100%">
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deletingPost}
                >
                  İptal
                </Button>
                <Button
                  onClick={confirmDeletePost}
                  disabled={deletingPost}
                  colorPalette="red"
                >
                  {deletingPost ? "Siliniyor..." : "Evet, sil"}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Stack>
  );
}
