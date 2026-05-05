"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  ClockCircleOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  SafetyCertificateFilled,
  StarFilled,
  UserOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Layout, Menu, Select, Space, Tag, Typography } from "antd";
import { AppBrandLogo } from "@/components/AppBrandLogo";
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
    <Layout className="flex h-screen min-h-0 flex-col overflow-hidden bg-app-shell">
      <header className="flex w-full shrink-0 items-center border-b border-zinc-200 bg-white">
        <div className="w-[220px] shrink-0 border-r border-zinc-200 px-5 py-4">
          <Space align="center">
            <AppBrandLogo />
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
                className="h-12 min-w-56 rounded-xl px-8"
              >
                Start Role Play
              </Button>
            </div>
          </Card>

          <Card
            className="rounded-2xl"
            title="Session Summary"
            styles={{ body: { padding: 0 }, title: { fontSize: 18, fontWeight: 600 } }}
          >
            {selectedScenario && selectedPersona ? (
              <div className="grid md:grid-cols-3">
                <div className="flex flex-col gap-5 border-b border-zinc-100 p-5 md:border-b-0 md:border-r">
                  <Space align="center">
                    <Avatar
                      size="small"
                      style={{ backgroundColor: "var(--brand-primary)", color: "#ffffff" }}
                      icon={<SafetyCertificateFilled />}
                    />
                    <Text strong className="text-base md:text-lg">
                      Scenario Goal(s)
                    </Text>
                  </Space>
                  <ul className="list-disc space-y-2.5 pl-5 marker:text-[var(--brand-primary)] [&_li]:leading-relaxed [&_li]:text-sm [&_li]:text-zinc-700">
                    {selectedScenario.scenarioGoals.map((goal) => (
                      <li key={goal}>{goal}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-5 border-b border-zinc-100 p-5 md:border-b-0 md:border-r">
                  <Space align="center">
                    <Avatar
                      size="small"
                      style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                      icon={<UserOutlined />}
                    />
                    <Text strong className="text-base md:text-lg">
                      Persona Traits
                    </Text>
                  </Space>
                  <div className="flex flex-wrap gap-2">
                    {selectedPersona.traits.map((trait) => (
                      <Tag key={trait}>{trait}</Tag>
                    ))}
                  </div>
                  <Text type="secondary" className="block leading-relaxed">
                    {selectedPersona.behaviorNotes}
                  </Text>
                </div>

                <div className="flex flex-col gap-5 p-5">
                  <Space align="center">
                    <Avatar
                      size="small"
                      style={{ backgroundColor: "#f59e0b", color: "#ffffff" }}
                      icon={<StarFilled />}
                    />
                    <Text strong className="text-base md:text-lg">
                      Suggested Skill Focus
                    </Text>
                  </Space>
                  <ul className="list-disc space-y-2.5 pl-5 marker:text-amber-500 [&_li]:leading-relaxed [&_li]:text-sm [&_li]:text-zinc-700">
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
            className="rounded-2xl border-brand-border !bg-brand-surface/70"
            styles={{ body: { padding: 16 } }}
          >
            <div className="flex items-center justify-between gap-3">
              <Space>
                <Avatar
                  size="small"
                  style={{ backgroundColor: "var(--brand-muted-bg)", color: "var(--brand-primary)" }}
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
