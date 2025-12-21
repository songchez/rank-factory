import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  adminCreateManualTopic,
  adminDeleteTopic,
  adminUpdateTopic,
  adminUploadImage,
  fetchTopic,
  fetchTopics,
  runSeed,
} from "../lib/api";
import { normalizeTopic } from "../lib/topics";

type ManualItem = { id?: string; name: string; image_url?: string };

const cardClass =
  "rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-7";
const buttonBase =
  "inline-flex items-center justify-center rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed";
const buttonVariants: Record<string, string> = {
  primary: "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700",
  neutral: "border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
  subtle: "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "border-rose-500 bg-rose-500 text-white hover:bg-rose-600",
  outline: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
};

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonVariants }) {
  return (
    <button
      className={`${buttonBase} ${buttonVariants[variant]} px-4 py-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function Admin() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({
    title: "",
    category: "General",
    viewType: "battle",
    mode: "A",
  });
  const [manualItems, setManualItems] = useState<ManualItem[]>([
    { name: "", image_url: "" },
    { name: "", image_url: "" },
  ]);

  const [editId, setEditId] = useState<string>("");
  const [editForm, setEditForm] = useState({
    title: "",
    category: "General",
    viewType: "battle",
    mode: "A",
  });
  const [editItems, setEditItems] = useState<ManualItem[]>([]);
  const [editQuestions, setEditQuestions] = useState<any[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const allowedAdmins = useMemo(
    () => ["tama4840@gmail.com"].map((email) => email.toLowerCase()),
    []
  );
  const normalizedEmail = (user?.email || "").toLowerCase();
  const isAdmin = user && allowedAdmins.includes(normalizedEmail);

  const viewTypeToMode = useMemo(
    () => ({ battle: "A", test: "B", tier: "C", fact: "D" }),
    []
  );
  const modeToViewType = useMemo(
    () => ({ A: "battle", B: "test", C: "tier", D: "fact" }),
    []
  );

  const loadTopics = async () => {
    setLoading(true);
    try {
      const res = await fetchTopics();
      if (res.success && res.data) {
        setTopics(res.data.map(normalizeTopic));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleSeed = async () => {
    setSeedMessage("시드 실행 중...");
    try {
      await runSeed();
      await loadTopics();
      setSeedMessage("시드 완료! 데이터가 갱신되었습니다.");
    } catch (err) {
      console.error(err);
      setSeedMessage("시드 실패. 콘솔을 확인하세요.");
    }
  };

  const handleManualItemChange = (index: number, key: "name" | "image_url", value: string) => {
    setManualItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const handleEditItemChange = (index: number, key: "name" | "image_url", value: string) => {
    setEditItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const addManualItem = () => setManualItems((prev) => [...prev, { name: "", image_url: "" }]);
  const addEditItem = () => setEditItems((prev) => [...prev, { name: "", image_url: "" }]);

  const removeManualItem = (index: number) => {
    setManualItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== index)));
  };
  const removeEditItem = (index: number) => {
    setEditItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== index)));
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const extractClipboardFile = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return null;
    for (const item of Array.from(items)) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) return file;
      }
    }
    return null;
  };

  const handleUploadImage = async (
    scope: "manual" | "edit",
    index: number,
    fileOrDataUrl?: File | string
  ) => {
    if (!fileOrDataUrl) return;
    setUploadError(null);
    const key = `${scope}-${index}`;
    setUploadingKey(key);
    try {
      const dataUrl =
        typeof fileOrDataUrl === "string"
          ? fileOrDataUrl
          : await fileToDataUrl(fileOrDataUrl);
      const res = await adminUploadImage({
        dataUrl,
        filename: typeof fileOrDataUrl === "string" ? "pasted-image" : fileOrDataUrl.name,
      });
      const url = (res as any)?.url || (res as any)?.data?.url || (res as any)?.data?.publicUrl;
      if (!url) throw new Error("업로드 URL을 받지 못했습니다.");

      if (scope === "manual") {
        setManualItems((prev) =>
          prev.map((item, idx) => (idx === index ? { ...item, image_url: url } : item))
        );
      } else {
        setEditItems((prev) =>
          prev.map((item, idx) => (idx === index ? { ...item, image_url: url } : item))
        );
      }
    } catch (err) {
      setUploadError((err as Error).message || "이미지 업로드 실패");
    } finally {
      setUploadingKey(null);
    }
  };

  const renderPreview = (url?: string) => {
    if (!url) {
      return (
        <div className="w-full h-16 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-center">
          미리보기 없음
        </div>
      );
    }
    return (
      <div className="w-full h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
        <img src={url} alt="preview" className="w-full h-full object-cover" />
      </div>
    );
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMessage(null);
    setCreateError(null);

    if (!manualForm.title.trim()) {
      setCreateError("제목을 입력하세요.");
      return;
    }

    const normalizedItems = manualItems
      .map((item) => ({ name: item.name.trim(), image_url: item.image_url?.trim() }))
      .filter((item) => item.name);

    const minItems = manualForm.viewType === "fact" ? 1 : 2;
    if (normalizedItems.length < minItems) {
      setCreateError(`아이템을 최소 ${minItems}개 입력하세요.`);
      return;
    }

    setCreateLoading(true);
    try {
      await adminCreateManualTopic({
        title: manualForm.title.trim(),
        category: manualForm.category,
        view_type: manualForm.viewType as "battle" | "test" | "tier" | "fact",
        mode: manualForm.mode,
        items: normalizedItems,
      });
      setCreateMessage("등록 완료! 목록을 새로고침했습니다.");
      setManualForm({
        title: "",
        category: "General",
        viewType: "battle",
        mode: "A",
      });
      setUploadError(null);
      setManualItems([
        { name: "", image_url: "" },
        { name: "", image_url: "" },
      ]);
      await loadTopics();
    } catch (err) {
      setCreateError((err as Error).message || "등록 실패");
    } finally {
      setCreateLoading(false);
    }
  };

  const hydrateEditForm = async (topicId: string) => {
    if (!topicId) return;
    try {
      let topic = topics.find((t) => t.id === topicId);
      if (!topic) {
        const res = await fetchTopic(topicId);
        if (res?.success && res.data) {
          topic = normalizeTopic(res.data);
        }
      }
      if (!topic) return;

      const viewType = (topic.view_type || "battle").toLowerCase();
      setEditId(topic.id);
      setEditForm({
        title: topic.title || "",
        category: topic.category || "General",
        viewType,
        mode: topic.mode || viewTypeToMode[viewType] || "A",
      });
      setEditItems(
        (topic.items || []).map((item: any) => ({
          id: item.id,
          name: item.name || "",
          image_url: item.image_url || item.imageUrl || "",
        }))
      );
      const questions = ((topic.meta as any)?.questions || []).map((q: any) => ({
        id: q.id || '',
        prompt: q.prompt || '',
        image_url: q.image_url || '',
        choices: q.choices || [{ text: '', weight: 0 }, { text: '', weight: 0 }],
      }));
      setEditQuestions(questions);
      setEditMessage(null);
      setEditError(null);
      setUploadError(null);
    } catch (err) {
      setEditError((err as Error).message || "토픽 불러오기 실패");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMessage(null);
    setEditError(null);
    if (!editId) {
      setEditError("수정할 콘텐츠를 선택하세요.");
      return;
    }
    if (!editForm.title.trim()) {
      setEditError("제목을 입력하세요.");
      return;
    }

    const normalizedItems = editItems
      .map((item) => ({ id: item.id, name: item.name.trim(), image_url: item.image_url?.trim() }))
      .filter((item) => item.name);

    const minItems = editForm.viewType === "fact" ? 1 : 2;
    if (normalizedItems.length < minItems) {
      setEditError(`아이템을 최소 ${minItems}개 입력하세요.`);
      return;
    }

    setEditLoading(true);
    try {
      const topic = topics.find(t => t.id === editId);
      const updatedMeta = {
        ...(topic?.meta || {}),
        questions: editQuestions.filter(q => q.prompt.trim() !== ''),
      };

      await adminUpdateTopic(editId, {
        title: editForm.title.trim(),
        category: editForm.category,
        view_type: editForm.viewType as "battle" | "test" | "tier" | "fact",
        mode: editForm.mode,
        meta: updatedMeta,
        items: normalizedItems,
      });
      setEditMessage("수정 완료! 목록을 새로고침했습니다.");
      await loadTopics();
      hydrateEditForm(editId);
      setUploadError(null);
    } catch (err) {
      setEditError((err as Error).message || "수정 실패");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) {
      setEditError("삭제할 콘텐츠를 선택하세요.");
      return;
    }
    const ok = window.confirm("정말 삭제할까요? 연결된 아이템도 함께 삭제됩니다.");
    if (!ok) return;
    setEditLoading(true);
    setEditMessage(null);
    setEditError(null);
    try {
      await adminDeleteTopic(editId);
      setEditMessage("삭제 완료! 목록을 새로고침했습니다.");
      setEditId("");
      setEditItems([]);
      setEditQuestions([]);
      setEditForm({
        title: "",
        category: "General",
        viewType: "battle",
        mode: "A",
      });
      await loadTopics();
    } catch (err) {
      setEditError((err as Error).message || "삭제 실패");
    } finally {
      setEditLoading(false);
    }
  };

  const addEditQuestion = () => {
    const newId = `q${editQuestions.length + 1}`;
    setEditQuestions([...editQuestions, {
      id: newId,
      prompt: '',
      image_url: '',
      choices: [
        { text: '', weight: 1 },
        { text: '', weight: 2 },
      ],
    }]);
  };

  const removeEditQuestion = (idx: number) => {
    setEditQuestions(editQuestions.filter((_, i) => i !== idx));
  };

  const updateEditQuestion = (idx: number, field: string, value: any) => {
    const updated = [...editQuestions];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditQuestions(updated);
  };

  const addQuestionChoice = (qIdx: number) => {
    const updated = [...editQuestions];
    updated[qIdx].choices.push({ text: '', weight: 0 });
    setEditQuestions(updated);
  };

  const removeQuestionChoice = (qIdx: number, cIdx: number) => {
    const updated = [...editQuestions];
    updated[qIdx].choices = updated[qIdx].choices.filter((_, i) => i !== cIdx);
    setEditQuestions(updated);
  };

  const updateQuestionChoice = (qIdx: number, cIdx: number, field: string, value: any) => {
    const updated = [...editQuestions];
    updated[qIdx].choices[cIdx][field] = field === 'weight' ? Number(value) : value;
    setEditQuestions(updated);
  };

  const handleUploadImageForQuestion = async (questionIdx: number, file?: File) => {
    if (!file) return;

    setUploadingKey(`question-${questionIdx}`);
    setUploadError(null);

    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await adminUploadImage({ dataUrl, filename: file.name });
      const url = (res as any)?.url;

      if (url) {
        const updated = [...editQuestions];
        updated[questionIdx].image_url = url;
        setEditQuestions(updated);
      }
    } catch (err) {
      setUploadError((err as Error).message || "이미지 업로드 실패");
    } finally {
      setUploadingKey(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">인증 확인 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 bg-slate-50">
        <p className="text-sm text-slate-500">관리자 로그인이 필요합니다.</p>
        <Button onClick={() => navigate("/login")} variant="primary">
          로그인
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 px-6 bg-slate-50">
        <p className="text-sm text-slate-500">접근 권한이 없습니다.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          홈으로
        </Button>
      </div>
    );
  }

  const grouped = topics.reduce<Record<string, any[]>>((acc, t) => {
    const mode = t.mode || "A";
    acc[mode] = acc[mode] || [];
    acc[mode].push(t);
    return acc;
  }, {});

  const endpointList = [
    { label: "헬스체크", path: "/api/health" },
    { label: "토픽 목록", path: "/api/topics" },
    { label: "시드 실행", path: "/api/seed/all" },
    { label: "게임 리더보드", path: "/api/games/:id/leaderboard" },
    { label: "게임 점수 기록", path: "/api/games/:id/score" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 space-y-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Rank Factory Admin</p>
            <h1 className="text-3xl font-semibold text-slate-900">콘텐츠/시드 관리</h1>
            <p className="text-sm text-slate-500 mt-1">
              토픽을 추가·수정하고 아이템 이미지를 업로드하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              메인 보기
            </Button>
            <Button variant="outline" onClick={signOut}>
              로그아웃
            </Button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">유틸리티</p>
                <h2 className="text-lg font-semibold text-slate-900">데이터 관리</h2>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={handleSeed} disabled={loading}>
                기본 시드 채우기
              </Button>
              <Button variant="outline" onClick={loadTopics}>
                데이터 새로고침
              </Button>
              {seedMessage && <span className="text-sm text-slate-500">{seedMessage}</span>}
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">엔드포인트 체크</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {endpointList.map((ep) => (
                <div
                  key={ep.path}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <span className="text-slate-800">{ep.label}</span>
                  <code className="text-[12px] bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    {ep.path}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500">Manual Create</p>
              <h2 className="text-xl font-semibold text-slate-900">새 콘텐츠 등록</h2>
              <p className="text-xs text-slate-500">
                이미지 URL은 붙여넣기(클립보드 이미지/데이터 URL)나 파일 선택 시 바로 Supabase에 업로드되어 반영됩니다.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleManualCreate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">제목</label>
                <input
                  type="text"
                  value={manualForm.title}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                  placeholder="예: 가장 맛있는 떡볶이 브랜드"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">카테고리</label>
                <select
                  value={manualForm.category}
                  onChange={(e) => setManualForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                >
                  {["General", "Food", "Tech", "Game", "Entertain"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Mode</label>
                  <select
                    value={manualForm.mode}
                    onChange={(e) =>
                      setManualForm((prev) => ({
                        ...prev,
                        mode: e.target.value,
                        viewType: modeToViewType[e.target.value] || prev.viewType,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                  >
                    {["A", "B", "C", "D"].map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">View Type</label>
                  <select
                    value={manualForm.viewType}
                    onChange={(e) =>
                      setManualForm((prev) => ({
                        ...prev,
                        viewType: e.target.value,
                        mode: viewTypeToMode[e.target.value] || prev.mode,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                  >
                    {["battle", "test", "tier", "fact"].map((vt) => (
                      <option key={vt} value={vt}>
                        {vt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm text-slate-800">아이템 목록</div>
                <Button variant="outline" type="button" onClick={addManualItem}>
                  항목 추가
                </Button>
              </div>
              <div className="space-y-2">
                {manualItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3"
                  >
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">이름</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleManualItemChange(idx, "name", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                        placeholder="예: 신전떡볶이"
                        required
                      />
                    </div>
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">이미지 URL</label>
                      <input
                        type="text"
                        value={item.image_url || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleManualItemChange(idx, "image_url", value);
                          if (value.startsWith("data:image")) {
                            handleUploadImage("manual", idx, value);
                          }
                        }}
                        onPaste={(e) => {
                          const file = extractClipboardFile(e);
                          if (file) {
                            e.preventDefault();
                            handleUploadImage("manual", idx, file);
                          }
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                        placeholder="붙여넣기나 파일 업로드를 사용할 수 있습니다."
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700">파일 업로드</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadImage("manual", idx, e.target.files?.[0])}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
                      />
                      {uploadingKey === `manual-${idx}` && (
                        <span className="text-[11px] text-slate-500">업로드 중...</span>
                      )}
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      {renderPreview(item.image_url)}
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      {manualItems.length > 1 && (
                        <Button variant="outline" type="button" onClick={() => removeManualItem(idx)} className="w-full">
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                배틀/퀴즈/티어 모드는 최소 2개, 팩트는 최소 1개 항목이 필요합니다. 이미지 URL은 붙여넣기(클립보드/데이터 URL)나 파일 선택으로 자동 업로드됩니다.
              </p>
            </div>

            {uploadError && <div className="text-xs text-rose-600">{uploadError}</div>}
            {createError && <div className="text-sm text-rose-600">{createError}</div>}
            {createMessage && <div className="text-sm text-emerald-600">{createMessage}</div>}

            <Button type="submit" disabled={createLoading} className="px-5 py-2.5">
              {createLoading ? "등록 중..." : "콘텐츠 등록"}
            </Button>
          </form>
        </div>

        <div className={cardClass}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500">Edit Content</p>
              <h2 className="text-xl font-semibold text-slate-900">기존 콘텐츠 수정/삭제</h2>
              <p className="text-xs text-slate-500">
                토픽을 선택한 뒤 필드를 수정하거나 항목을 추가/삭제할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setEditId("");
                  setEditItems([]);
                  setEditQuestions([]);
                  setEditForm({ title: "", category: "General", viewType: "battle", mode: "A" });
                  setEditMessage(null);
                  setEditError(null);
                  setUploadError(null);
                }}
              >
                초기화
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">콘텐츠 선택</label>
              <select
                value={editId}
                onChange={(e) => hydrateEditForm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">-- 토픽을 선택하세요 --</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    [{topic.mode}] {topic.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">빠른 불러오기</label>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => editId && hydrateEditForm(editId)}
                disabled={!editId}
              >
                다시 불러오기
              </Button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">제목</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                  placeholder="제목 수정"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">카테고리</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                >
                  {["General", "Food", "Tech", "Game", "Entertain"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Mode</label>
                  <select
                    value={editForm.mode}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        mode: e.target.value,
                        viewType: modeToViewType[e.target.value] || prev.viewType,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                  >
                    {["A", "B", "C", "D"].map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">View Type</label>
                  <select
                    value={editForm.viewType}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        viewType: e.target.value,
                        mode: viewTypeToMode[e.target.value] || prev.mode,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                  >
                    {["battle", "test", "tier", "fact"].map((vt) => (
                      <option key={vt} value={vt}>
                        {vt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm text-slate-800">아이템 목록</div>
                <Button variant="outline" type="button" onClick={addEditItem} disabled={!editId}>
                  항목 추가
                </Button>
              </div>
              <div className="space-y-2">
                {editItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3"
                  >
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">이름</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleEditItemChange(idx, "name", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                        placeholder="아이템 이름"
                        required
                      />
                    </div>
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">이미지 URL</label>
                      <input
                        type="text"
                        value={item.image_url || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleEditItemChange(idx, "image_url", value);
                          if (value.startsWith("data:image")) {
                            handleUploadImage("edit", idx, value);
                          }
                        }}
                        onPaste={(e) => {
                          const file = extractClipboardFile(e);
                          if (file) {
                            e.preventDefault();
                            handleUploadImage("edit", idx, file);
                          }
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                        placeholder="붙여넣기나 파일 업로드를 사용할 수 있습니다."
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700">파일 업로드</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadImage("edit", idx, e.target.files?.[0])}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
                      />
                      {uploadingKey === `edit-${idx}` && (
                        <span className="text-[11px] text-slate-500">업로드 중...</span>
                      )}
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      {renderPreview(item.image_url)}
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      {editItems.length > 1 && (
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => removeEditItem(idx)}
                          className="w-full"
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {editItems.length === 0 && (
                  <p className="text-xs text-slate-500">항목을 불러오려면 토픽을 선택하세요.</p>
                )}
              </div>
              <p className="text-xs text-slate-500">
                배틀/퀴즈/티어 모드는 최소 2개, 팩트는 최소 1개 항목이 필요합니다. 이미지 URL은 붙여넣기(클립보드/데이터 URL)나 파일 선택으로 자동 업로드됩니다.
              </p>
            </div>

            {editForm.mode === 'B' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm text-slate-800">질문 목록</div>
                  <Button variant="outline" type="button" onClick={addEditQuestion} disabled={!editId}>
                    질문 추가
                  </Button>
                </div>

                <div className="space-y-4">
                  {editQuestions.map((q, qIdx) => (
                    <div key={q.id} className="rounded-xl border-2 border-slate-300 bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-800">질문 {qIdx + 1}</div>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => removeEditQuestion(qIdx)}
                          className="text-xs"
                        >
                          삭제
                        </Button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">질문 ID</label>
                        <input
                          type="text"
                          value={q.id}
                          onChange={(e) => updateEditQuestion(qIdx, 'id', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                          placeholder="예: q1"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">질문 내용</label>
                        <textarea
                          value={q.prompt}
                          onChange={(e) => updateEditQuestion(qIdx, 'prompt', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                          placeholder="질문을 입력하세요"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-6 space-y-1">
                          <label className="text-xs font-semibold text-slate-700">이미지 URL</label>
                          <input
                            type="text"
                            value={q.image_url || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateEditQuestion(qIdx, 'image_url', value);
                              if (value.startsWith("data:image")) {
                                handleUploadImageForQuestion(qIdx, value);
                              }
                            }}
                            onPaste={(e) => {
                              const file = extractClipboardFile(e);
                              if (file) {
                                e.preventDefault();
                                handleUploadImageForQuestion(qIdx, file);
                              }
                            }}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                            placeholder="이미지 URL (선택사항)"
                          />
                        </div>
                        <div className="md:col-span-4 flex flex-col gap-2">
                          <label className="text-xs font-semibold text-slate-700">파일 업로드</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadImageForQuestion(qIdx, e.target.files?.[0])}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
                          />
                          {uploadingKey === `question-${qIdx}` && (
                            <span className="text-[11px] text-slate-500">업로드 중...</span>
                          )}
                        </div>
                        <div className="md:col-span-2 flex items-end">
                          {q.image_url && (
                            <img
                              src={q.image_url}
                              alt="preview"
                              className="w-full h-16 object-cover rounded border"
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">선택지</label>
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => addQuestionChoice(qIdx)}
                            className="text-xs py-1 px-2"
                          >
                            선택지 추가
                          </Button>
                        </div>

                        {q.choices.map((choice: any, cIdx: number) => (
                          <div key={cIdx} className="flex gap-2">
                            <input
                              type="text"
                              value={choice.text}
                              onChange={(e) => updateQuestionChoice(qIdx, cIdx, 'text', e.target.value)}
                              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                              placeholder="선택지 텍스트"
                            />
                            <input
                              type="number"
                              value={choice.weight}
                              onChange={(e) => updateQuestionChoice(qIdx, cIdx, 'weight', e.target.value)}
                              className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                              placeholder="가중치"
                            />
                            {q.choices.length > 2 && (
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() => removeQuestionChoice(qIdx, cIdx)}
                                className="px-3 text-xs"
                              >
                                삭제
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {editQuestions.length === 0 && (
                    <p className="text-sm text-slate-500">
                      질문을 추가하려면 "질문 추가" 버튼을 클릭하세요.
                    </p>
                  )}
                </div>
              </div>
            )}

            {uploadError && <div className="text-xs text-rose-600">{uploadError}</div>}
            {editError && <div className="text-sm text-rose-600">{editError}</div>}
            {editMessage && <div className="text-sm text-emerald-600">{editMessage}</div>}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={editLoading || !editId} className="px-5 py-2.5">
                {editLoading ? "저장 중..." : "수정 저장"}
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={editLoading || !editId}
                className="px-5 py-2.5"
              >
                삭제
              </Button>
            </div>
          </form>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500">Topics</p>
              <h2 className="text-xl font-semibold text-slate-900">토픽 목록</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["A", "B", "C", "D"].map((mode) => (
              <div key={mode} className="rounded-xl border border-slate-200 p-4 bg-slate-50/70">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-slate-800">모드 {mode}</div>
                  <span className="text-xs text-slate-500">{grouped[mode]?.length || 0}개</span>
                </div>
                <div className="space-y-2">
                  {(grouped[mode] || []).map((topic) => (
                    <div
                      key={topic.id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{topic.title}</div>
                        <div className="text-xs text-slate-500 flex gap-2">
                          <span>{topic.items.length}개 항목</span>
                          <span className="uppercase">{topic.view_type}</span>
                        </div>
                      </div>
                      <Button variant="outline" type="button" onClick={() => hydrateEditForm(topic.id)}>
                        편집
                      </Button>
                    </div>
                  ))}
                  {(grouped[mode] || []).length === 0 && (
                    <p className="text-xs text-slate-500">아직 데이터가 없습니다.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
