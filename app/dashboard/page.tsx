"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  MessageOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  UserOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Layout, Menu, Select, Space, Tag, Typography } from "antd";
import {
  clearSessionEntryGate,
  getAdminRuntimeData,
  getServerAdminRuntimeSnapshot,
  subscribeAdminRuntimeData,
} from "@/lib/runtime/store";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    clearSessionEntryGate();
  }, []);

  const runtimeData = useSyncExternalStore(
    subscribeAdminRuntimeData,
    getAdminRuntimeData,
    getServerAdminRuntimeSnapshot,
  );

  const { scenarios, personas } = runtimeData;

  const [selectedScenarioId, setSelectedScenarioId] = useState(
    () => getServerAdminRuntimeSnapshot().scenarios[0]?.id ?? "",
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState(
    () => getServerAdminRuntimeSnapshot().personas[0]?.id ?? "",
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const resolvedScenarioId = useMemo(() => {
    if (scenarios.some((s) => s.id === selectedScenarioId)) {
      return selectedScenarioId;
    }
    return scenarios[0]?.id ?? "";
  }, [scenarios, selectedScenarioId]);

  const selectedScenario = useMemo(
    () => scenarios.find((item) => item.id === resolvedScenarioId),
    [scenarios, resolvedScenarioId],
  );

  const compatiblePersonas = useMemo(() => {
    if (!selectedScenario) return personas;
    return personas.filter((persona) =>
      selectedScenario.personaIds.includes(persona.id),
    );
  }, [personas, selectedScenario]);

  const resolvedPersonaId = useMemo(() => {
    if (compatiblePersonas.some((p) => p.id === selectedPersonaId)) {
      return selectedPersonaId;
    }
    return compatiblePersonas[0]?.id ?? "";
  }, [compatiblePersonas, selectedPersonaId]);

  const selectedPersona = useMemo(
    () => personas.find((item) => item.id === resolvedPersonaId),
    [personas, resolvedPersonaId],
  );

  if (scenarios.length === 0 || personas.length === 0) {
    return <main className="p-6 text-sm">No runtime data available.</main>;
  }

  return (
    <Layout className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#f5f7fb]">
      <header className="flex w-full shrink-0 items-center border-b border-zinc-200 bg-white">
        <div className="w-[220px] shrink-0 border-r border-zinc-200 px-5 py-4">
          <Space align="center">
            <MessageOutlined style={{ color: "#4f46e5", fontSize: "22px", fontWeight: "bold" }} />
            <Title level={4} className="!mb-0 !text-zinc-800 !text-xl">
              AI Role Player
            </Title>
          </Space>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-start px-5 py-4">
          <div className="min-w-0">
            <Title level={4} className="!mb-0 !truncate !text-lg !font-semibold !text-zinc-900">
              Start a Role Play
            </Title>
            <Text type="secondary" className="mt-0.5 block truncate text-sm">
              Practice real customer conversations. Improve your skills.
            </Text>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 border-l border-zinc-100 px-5 py-3">
          <Button
            icon={<SafetyCertificateOutlined style={{ color: "#4f46e5" }} />}
            onClick={() => router.push("/admin")}
            size="large"
            className="!h-10 !rounded-xl !px-4"
          >
            Switch to Admin
          </Button>
        </div>
      </header>

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
              selectedKeys={["dashboard"]}
              className="border-none"
              items={[
                {
                  key: "dashboard",
                  icon: <BankOutlined />,
                  label: "Dashboard",
                },
                {
                  key: "history",
                  icon: <ClockCircleOutlined />,
                  label: "History",
                },
              ]}
            />
            <div className="mt-auto border-t border-zinc-100 px-5 py-6">
              <Space align="center">
                <Avatar size="small">JS</Avatar>
                <div>
                  <Text strong>Jane Smith</Text>
                  <br />
                  <Text type="secondary" className="text-xs">
                    Sales Rep
                  </Text>
                </div>
              </Space>
            </div>
          </div>
        </Sider>

        <Content className="min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-6 lg:px-7 lg:py-7">
          <div className="mx-auto flex w-full flex-col gap-5">
          <Card className="rounded-2xl" styles={{ body: { padding: 24 } }}>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Text strong className="text-sm">Scenario</Text>
                <Select
                  showSearch
                  size="large"
                  style={{ marginTop: "0.75rem" }}
                  value={resolvedScenarioId || undefined}
                  placeholder="Select a scenario"
                  notFoundContent="No scenario found."
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? "");
                    const keywords = (option?.keywords as string | undefined) ?? "";
                    return `${label} ${keywords}`.toLowerCase().includes(input.toLowerCase());
                  }}
                  options={scenarios.map((scenario) => ({
                    label: scenario.name,
                    value: scenario.id,
                    keywords: scenario.description,
                  }))}
                  onChange={(value) => {
                    setSelectedScenarioId(value);
                    const scenario = scenarios.find((item) => item.id === value);
                    if (!scenario) return;
                    const firstCompatiblePersona = personas.find((persona) =>
                      scenario.personaIds.includes(persona.id),
                    );
                    if (firstCompatiblePersona) setSelectedPersonaId(firstCompatiblePersona.id);
                  }}
                  className="mt-2 w-full"
                />
              </div>

              <div>
                <Text strong className="text-sm">Persona</Text>
                <Select
                  showSearch
                  size="large"
                  style={{ marginTop: "0.75rem" }}
                  value={resolvedPersonaId || undefined}
                  placeholder="Select a persona"
                  notFoundContent="No persona found."
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? "");
                    const keywords = (option?.keywords as string | undefined) ?? "";
                    return `${label} ${keywords}`.toLowerCase().includes(input.toLowerCase());
                  }}
                  options={compatiblePersonas.map((persona) => ({
                    label: persona.name,
                    value: persona.id,
                    keywords: persona.name,
                  }))}
                  onChange={setSelectedPersonaId}
                  className="mt-2 w-full"
                />
              </div>

              <div>
                <Text strong className="text-sm">Difficulty</Text>
                <Text type="secondary" className="ml-1 text-xs">
                  (Optional)
                </Text>
                <Select
                  size="large"
                  style={{ marginTop: "0.75rem" }}
                  value={difficulty}
                  onChange={setDifficulty}
                  options={[
                    { label: "Easy", value: "easy" },
                    { label: "Medium", value: "medium" },
                    { label: "Hard", value: "hard" },
                  ]}
                  className="mt-2 w-full"
                />
              </div>
            </div>

            <div className="mt-10 flex flex-col items-end gap-2">
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined style={{ color: "#ffffff" }} />}
                disabled={!selectedScenario || !selectedPersona}
                onClick={() => {
                  const q = new URLSearchParams({
                    scenarioId: resolvedScenarioId,
                    personaId: resolvedPersonaId,
                    difficulty,
                  });
                  router.push(`/session?${q.toString()}`);
                }}
                className="h-12 min-w-56 rounded-xl bg-indigo-600 px-8 hover:!bg-indigo-500"
              >
                Start Role Play
              </Button>
            </div>
          </Card>

          <Card className="rounded-2xl" title="Session Summary" styles={{ body: { padding: 0 } }}>
            {selectedScenario && selectedPersona ? (
              <div className="grid md:grid-cols-3">
                <div className="border-b border-zinc-100 p-5 md:border-b-0 md:border-r">
                  <Space align="center">
                    <Avatar
                      size="small"
                      style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}
                      icon={<SafetyCertificateOutlined />}
                    />
                    <Text strong>Scenario Goal(s)</Text>
                  </Space>
                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    {selectedScenario.scenarioGoals.map((goal) => (
                      <li key={goal}>{goal}</li>
                    ))}
                  </ul>
                </div>

                <div className="border-b border-zinc-100 p-5 md:border-b-0 md:border-r">
                  <Space align="center">
                    <Avatar
                      size="small"
                      style={{ backgroundColor: "#ecfdf5", color: "#16a34a" }}
                      icon={<UserOutlined />}
                    />
                    <Text strong>Persona Traits</Text>
                  </Space>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedPersona.traits.map((trait) => (
                      <Tag key={trait}>{trait}</Tag>
                    ))}
                  </div>
                  <Text type="secondary" className="mt-2 block">
                    {selectedPersona.behaviorNotes}
                  </Text>
                </div>

                <div className="p-5">
                  <Space align="center">
                    <Avatar
                      size="small"
                      style={{ backgroundColor: "#fff7ed", color: "#f59e0b" }}
                      icon={<StarOutlined />}
                    />
                    <Text strong>Suggested Skill Focus</Text>
                  </Space>
                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    {selectedScenario.suggestedSkillFocus.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Text type="secondary">Select a scenario and persona to preview summary.</Text>
            )}
          </Card>

          <Card
            className="rounded-2xl border-indigo-100 !bg-indigo-50/70"
            styles={{ body: { padding: 16 } }}
          >
            <div className="flex items-center justify-between gap-3">
              <Space>
                <Avatar
                  size="small"
                  style={{ backgroundColor: "#eef2ff", color: "#6366f1" }}
                  icon={<InfoCircleOutlined />}
                />
                <Text>You can review your past sessions and feedback in History.</Text>
              </Space>
            </div>
          </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
