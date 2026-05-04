"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BarcodeOutlined, EditTwoTone, EyeOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Space, Typography, message } from "antd";
import {
  getAdminRuntimeData,
  getServerAdminRuntimeSnapshot,
  setAdminRuntimeData,
  subscribeAdminRuntimeData,
} from "@/lib/runtime/store";
import type { Persona, Scenario } from "@/lib/types/domain";

import { PersonaForm } from "./components/PersonaForm";
import { ScenarioForm } from "./components/ScenarioForm";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

function createScenario(): Scenario {
  const now = new Date().toISOString();
  return {
    id: `scenario_${crypto.randomUUID()}`,
    name: "",
    description: "",
    difficulty: "Medium",
    personaIds: [],
    scenarioGoals: [""],
    suggestedSkillFocus: [],
    scoring: {
      weights: { Discovery: 40, ObjectionHandling: 40, Closing: 20 },
      criteria: [{ id: `crit_${crypto.randomUUID()}`, description: "", weight: 40 }],
    },
    voiceBehaviorOverrides: {
      interruptFrequency: "Medium",
      speakingPace: "Moderate",
      toneStyle: "Neutral",
    },
    createdAt: now,
    updatedAt: now,
  };
}

function setScenario(list: Scenario[], next: Scenario): Scenario[] {
  return list.map((item) => (item.id === next.id ? next : item));
}

function setPersona(list: Persona[], next: Persona): Persona[] {
  return list.map((item) => (item.id === next.id ? next : item));
}

function createPersona(): Persona {
  const now = new Date().toISOString();
  return {
    id: `persona_${crypto.randomUUID()}`,
    name: "",
    traits: [],
    behaviorNotes: "",
    voiceBehavior: {
      interruptFrequency: "Medium",
      speakingPace: "Moderate",
      toneStyle: "Professional",
    },
    createdAt: now,
    updatedAt: now,
  };
}

type AdminAppHeaderProps = {
  contextTitle?: string;
  contextSubtitle?: string;
  showEditorActions?: boolean;
  onSave?: () => void;
  saveDisabled?: boolean;
};

function AdminAppHeader({
  contextTitle,
  contextSubtitle,
  showEditorActions,
  onSave,
  saveDisabled,
}: AdminAppHeaderProps) {
  return (
    <header className="flex w-full shrink-0 items-center border-b border-zinc-200 bg-white">
      <div className="w-[220px] shrink-0 border-r border-zinc-200 px-5 py-4">
        <Space align="center">
          <EditTwoTone style={{ color: "#4f46e5", fontSize: "22px", fontWeight: "bold" }} />
          <Title level={4} className="!mb-0 !text-zinc-800 !text-xl">
            AI Role Player
          </Title>
        </Space>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-start px-5 py-4">
        {contextTitle ? (
          <div className="min-w-0">
            <Title level={4} className="!mb-0 !truncate !text-lg !font-semibold !text-zinc-900">
              {contextTitle}
            </Title>
            {contextSubtitle ? (
              <Text type="secondary" className="mt-0.5 block truncate text-sm">
                {contextSubtitle}
              </Text>
            ) : null}
          </div>
        ) : (
          <Text type="secondary" className="text-sm font-medium">
            Admin Console
          </Text>
        )}
      </div>
      {showEditorActions ? (
        <div className="flex shrink-0 items-center gap-2 border-l border-zinc-100 px-5 py-3">
          <Button icon={<EyeOutlined />}>Preview</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            disabled={saveDisabled}
            onClick={() => onSave?.()}
          >
            Save Changes
          </Button>
        </div>
      ) : null}
    </header>
  );
}

export default function AdminPage() {
  const data = useSyncExternalStore(
    subscribeAdminRuntimeData,
    getAdminRuntimeData,
    getServerAdminRuntimeSnapshot,
  );
  const { scenarios, personas } = data;

  const [selectedNav, setSelectedNav] = useState<"scenarios" | "personas">("scenarios");
  const [search, setSearch] = useState("");
  const [personaSearch, setPersonaSearch] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    () => getServerAdminRuntimeSnapshot().scenarios[0]?.id ?? "",
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState(
    () => getServerAdminRuntimeSnapshot().personas[0]?.id ?? "",
  );
  const [draft, setDraft] = useState<Scenario | null>(null);
  const [personaDraft, setPersonaDraft] = useState<Persona | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const resolvedScenarioId = useMemo(() => {
    if (scenarios.some((s) => s.id === selectedScenarioId)) {
      return selectedScenarioId;
    }
    return scenarios[0]?.id ?? "";
  }, [scenarios, selectedScenarioId]);

  const lastResolvedScenarioId = useRef<string | null>(null);
  useEffect(() => {
    if (
      lastResolvedScenarioId.current !== null &&
      lastResolvedScenarioId.current === resolvedScenarioId
    ) {
      return;
    }
    lastResolvedScenarioId.current = resolvedScenarioId;
    const scenario = scenarios.find((s) => s.id === resolvedScenarioId) ?? null;
    setDraft(scenario ? { ...scenario } : null);
  }, [resolvedScenarioId, scenarios]);

  const resolvedPersonaId = useMemo(() => {
    if (personas.some((p) => p.id === selectedPersonaId)) {
      return selectedPersonaId;
    }
    return personas[0]?.id ?? "";
  }, [personas, selectedPersonaId]);

  const lastResolvedPersonaId = useRef<string | null>(null);
  useEffect(() => {
    if (
      lastResolvedPersonaId.current !== null &&
      lastResolvedPersonaId.current === resolvedPersonaId
    ) {
      return;
    }
    lastResolvedPersonaId.current = resolvedPersonaId;
    const persona = personas.find((p) => p.id === resolvedPersonaId) ?? null;
    setPersonaDraft(persona ? { ...persona } : null);
  }, [resolvedPersonaId, personas]);

  const filteredScenarios = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return scenarios;
    return scenarios.filter((s) =>
      `${s.name} ${s.description}`.toLowerCase().includes(keyword),
    );
  }, [scenarios, search]);

  const filteredPersonas = useMemo(() => {
    const keyword = personaSearch.trim().toLowerCase();
    if (!keyword) return personas;
    return personas.filter((p) =>
      `${p.name} ${p.behaviorNotes} ${p.traits.join(" ")}`.toLowerCase().includes(keyword),
    );
  }, [personas, personaSearch]);

  function persist(nextScenarios: Scenario[]): void {
    setAdminRuntimeData({ scenarios: nextScenarios, personas });
  }

  function persistPersonas(nextPersonas: Persona[]): void {
    setAdminRuntimeData({ scenarios, personas: nextPersonas });
  }

  function saveDraft(): void {
    if (!draft) return;
    if (!draft.name.trim()) {
      void messageApi.error("Scenario name is required.");
      return;
    }
    if (!draft.description.trim()) {
      void messageApi.error("Description is required.");
      return;
    }
    if (personas.length === 0) {
      void messageApi.error("Add at least one persona in the Personas library before saving a scenario.");
      return;
    }
    const hasCompatiblePersona = draft.personaIds.some((id) =>
      personas.some((p) => p.id === id),
    );
    if (!hasCompatiblePersona) {
      void messageApi.error("Select at least one persona under Persona Compatibility before saving.");
      return;
    }
    const next = { ...draft, updatedAt: new Date().toISOString() };
    persist(setScenario(scenarios, next));
    void messageApi.success("Scenario saved.");
  }

  function addScenario(): void {
    const next = createScenario();
    persist([...scenarios, next]);
    setSelectedScenarioId(next.id);
  }

  function deleteScenario(scenarioId: string): void {
    const remaining = scenarios.filter((s) => s.id !== scenarioId);
    persist(remaining);
    if (selectedScenarioId === scenarioId) {
      setSelectedScenarioId(remaining[0]?.id ?? "");
    }
    void messageApi.success("Scenario deleted.");
  }

  function savePersonaDraft(): void {
    if (!personaDraft) return;
    if (!personaDraft.name.trim()) {
      void messageApi.error("Persona name is required.");
      return;
    }
    if (!personaDraft.behaviorNotes.trim()) {
      void messageApi.error("Behavior notes are required.");
      return;
    }
    const next = { ...personaDraft, updatedAt: new Date().toISOString() };
    persistPersonas(setPersona(personas, next));
    void messageApi.success("Persona saved.");
  }

  function addPersona(): void {
    const next = createPersona();
    persistPersonas([...personas, next]);
    setSelectedPersonaId(next.id);
  }

  const adminHeaderContext = useMemo(() => {
    if (selectedNav === "scenarios" && draft) {
      return {
        contextTitle: "Edit Scenario" as const,
        contextSubtitle: draft.name.trim() || "Untitled scenario",
      };
    }
    if (selectedNav === "personas") {
      let contextSubtitle = "";
      if (personas.length === 0) {
        contextSubtitle = "No personas in library yet";
      } else if (personaDraft) {
        contextSubtitle = personaDraft.name.trim() || "Untitled persona";
      } else {
        contextSubtitle = "Select a persona from the library";
      }
      return { contextTitle: "Edit Persona" as const, contextSubtitle };
    }
    return {};
  }, [selectedNav, draft, personaDraft, personas]);

  function deletePersona(personaId: string): void {
    const remaining = personas.filter((p) => p.id !== personaId);
    const cleanedScenarios = scenarios.map((s) => ({
      ...s,
      personaIds: s.personaIds.filter((id) => id !== personaId),
    }));
    setAdminRuntimeData({ scenarios: cleanedScenarios, personas: remaining });
    if (selectedPersonaId === personaId) {
      setSelectedPersonaId(remaining[0]?.id ?? "");
    }
    void messageApi.success("Persona deleted.");
  }

  if (selectedNav === "scenarios" && !draft) {
    return (
      <Layout className="flex min-h-screen flex-col bg-[#f5f7fb]">
        <AdminAppHeader />
        <main className="flex-1 p-6 text-sm">No scenario data available.</main>
      </Layout>
    );
  }

  return (
    <Layout className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#f5f7fb]">
      {contextHolder}
      <AdminAppHeader
        {...adminHeaderContext}
        showEditorActions={Boolean(adminHeaderContext.contextTitle)}
        onSave={selectedNav === "scenarios" ? saveDraft : savePersonaDraft}
        saveDisabled={selectedNav === "personas" && !personaDraft}
      />

      <Layout className="flex min-h-0 flex-1 !bg-inherit">
        <Sider
          width={220}
          className="!shrink-0 !border-r !border-zinc-200 !bg-white"
          breakpoint="lg"
          collapsedWidth={0}
        >
          <div className="flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden pt-6 lg:pt-7">
            <Menu
              mode="inline"
              className="border-none"
              selectedKeys={[selectedNav]}
              onClick={(e) => setSelectedNav(e.key as "scenarios" | "personas")}
              items={[
                { key: "scenarios", icon: <BarcodeOutlined />, label: "Scenarios" },
                { key: "personas", icon: <UserOutlined />, label: "Personas" },
              ]}
            />
            <div className="mt-auto border-t border-zinc-100 px-5 py-6">
              <Space align="center">
                <Avatar size="small">A</Avatar>
                <Text strong>Admin User</Text>
              </Space>
            </div>
          </div>
        </Sider>

        <Content className="min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-6 lg:px-7 lg:py-7">
          <div className="mx-auto flex w-full flex-col gap-5">
            {selectedNav === "scenarios" && draft ? (
              <ScenarioForm
                draft={draft}
                onChange={setDraft}
                personas={personas}
                filteredScenarios={filteredScenarios}
                search={search}
                onSearchChange={setSearch}
                resolvedScenarioId={resolvedScenarioId}
                onSelectScenarioId={setSelectedScenarioId}
                onAddScenario={addScenario}
                onDeleteScenario={deleteScenario}
              />
            ) : (
              <PersonaForm
                personaDraft={personaDraft}
                onChange={setPersonaDraft}
                filteredPersonas={filteredPersonas}
                personaSearch={personaSearch}
                onPersonaSearchChange={setPersonaSearch}
                resolvedPersonaId={resolvedPersonaId}
                onSelectPersonaId={setSelectedPersonaId}
                onAddPersona={addPersona}
                onDeletePersona={deletePersona}
              />
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
