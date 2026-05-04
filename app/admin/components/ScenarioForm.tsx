"use client";

import { useMemo } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Typography,
} from "antd";
import type { Persona, Scenario } from "@/lib/types/domain";

const { Text } = Typography;

function clampWeight(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.floor(value)));
}

export type ScenarioFormProps = {
  draft: Scenario;
  onChange: (next: Scenario) => void;
  personas: Persona[];
  filteredScenarios: Scenario[];
  search: string;
  onSearchChange: (value: string) => void;
  resolvedScenarioId: string;
  onSelectScenarioId: (id: string) => void;
  onAddScenario: () => void;
  onDeleteScenario: (id: string) => void;
};

export function ScenarioForm({
  draft,
  onChange,
  personas,
  filteredScenarios,
  search,
  onSearchChange,
  resolvedScenarioId,
  onSelectScenarioId,
  onAddScenario,
  onDeleteScenario,
}: ScenarioFormProps) {
  const totalWeight = useMemo(() => {
    return Object.values(draft.scoring.weights).reduce((sum, w) => sum + (w || 0), 0);
  }, [draft]);

  return (
    <>
      <div
        className="grid min-h-0 min-w-0 grid-cols-1 items-stretch gap-4 md:grid-cols-[290px_minmax(0,1fr)_290px]"
        id="scenario-edit-grid"
      >
        <Card
          className="flex h-full min-h-0 flex-col"
          styles={{
            body: {
              padding: 14,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            },
          }}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex shrink-0 items-center justify-between">
              <Text strong>All Scenarios</Text>
              <Button icon={<PlusOutlined />} onClick={onAddScenario} type="primary">
                New Scenario
              </Button>
            </div>
            <Input
              className="shrink-0"
              placeholder="Search scenarios..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredScenarios.map((scenario) => {
                const active = scenario.id === resolvedScenarioId;
                return (
                  <div
                    key={scenario.id}
                    className={`flex items-stretch gap-0.5 rounded-xl border transition ${
                      active
                        ? "border-indigo-200 bg-indigo-50"
                        : "border-transparent bg-white hover:border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 rounded-l-xl p-3 text-left"
                      onClick={() => onSelectScenarioId(scenario.id)}
                    >
                      <div className={`font-medium ${scenario.name.trim() ? "" : "text-zinc-400"}`}>
                        {scenario.name.trim() || "Untitled scenario"}
                      </div>
                      <Text type="secondary" className="text-xs">
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </Text>
                    </button>
                    <Popconfirm
                      title="Delete this scenario?"
                      description="This removes it from the library. Sessions that already used it are unchanged."
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => onDeleteScenario(scenario.id)}
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        className="!mr-1 shrink-0 self-center"
                        aria-label="Delete scenario"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card
          title="Basic Information"
          className="flex h-full min-h-0 flex-col"
          styles={{
            header: { flexShrink: 0 },
            body: {
              paddingTop: 20,
              paddingBottom: 20,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            },
          }}
        >
          <div className="flex w-full flex-col gap-7">
            <div>
              <Text strong>Scenario Name *</Text>
              <Input
                className="!mt-3"
                placeholder="e.g. Enterprise discovery call"
                value={draft.name}
                onChange={(e) => onChange({ ...draft, name: e.target.value })}
              />
            </div>

            <div>
              <Text strong>Description *</Text>
              <Input.TextArea
                className="!mt-3"
                rows={4}
                placeholder="What is the situation, stakes, and success criteria?"
                value={draft.description}
                onChange={(e) => onChange({ ...draft, description: e.target.value })}
              />
            </div>

            <div>
              <Text strong>Suggested Skill Focus</Text>
              <Select
                className="!mt-3 w-full"
                mode="tags"
                placeholder="Type and press Enter to add skills"
                value={draft.suggestedSkillFocus.length ? draft.suggestedSkillFocus : undefined}
                onChange={(suggestedSkillFocus) =>
                  onChange({ ...draft, suggestedSkillFocus: suggestedSkillFocus ?? [] })
                }
              />
            </div>

            <div>
              <Text strong>Scenario Goal(s)</Text>
              <Space orientation="vertical" className="mt-3 !w-full" size={12}>
                {draft.scenarioGoals.map((goal, idx) => (
                  <div key={idx} className="flex w-full items-center gap-2">
                    <Input
                      className="min-w-0 flex-1"
                      placeholder="Describe this goal"
                      value={goal}
                      onChange={(e) =>
                        onChange({
                          ...draft,
                          scenarioGoals: draft.scenarioGoals.map((g, i) =>
                            i === idx ? e.target.value : g,
                          ),
                        })
                      }
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={draft.scenarioGoals.length <= 1}
                      aria-label="Remove goal"
                      title={
                        draft.scenarioGoals.length <= 1
                          ? "At least one goal is required"
                          : "Remove goal"
                      }
                      onClick={() => {
                        if (draft.scenarioGoals.length <= 1) return;
                        onChange({
                          ...draft,
                          scenarioGoals: draft.scenarioGoals.filter((_, i) => i !== idx),
                        });
                      }}
                    />
                  </div>
                ))}
              </Space>
              <Button
                className="!mt-3"
                type="link"
                onClick={() => onChange({ ...draft, scenarioGoals: [...draft.scenarioGoals, ""] })}
              >
                + Add Goal
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex h-full min-h-0 min-w-0 flex-col gap-4">
          <Card title="Persona Compatibility *">
            <Space orientation="vertical" style={{ width: "100%" }}>
              {personas.map((persona) => (
                <Checkbox
                  key={persona.id}
                  checked={draft.personaIds.includes(persona.id)}
                  onChange={(e) =>
                    onChange({
                      ...draft,
                      personaIds: e.target.checked
                        ? [...draft.personaIds, persona.id]
                        : draft.personaIds.filter((id) => id !== persona.id),
                    })
                  }
                >
                  {persona.name}
                </Checkbox>
              ))}
            </Space>
          </Card>

          <Card title="Scoring Weights (Optional)">
            <Space orientation="vertical" style={{ width: "100%" }}>
              <div className="flex items-center justify-between">
                <Text>Discovery</Text>
                <InputNumber
                  min={0}
                  max={100}
                  value={draft.scoring.weights.Discovery}
                  onChange={(v) =>
                    onChange({
                      ...draft,
                      scoring: {
                        ...draft.scoring,
                        weights: {
                          ...draft.scoring.weights,
                          Discovery: clampWeight(v),
                        },
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Text>Objection Handling</Text>
                <InputNumber
                  min={0}
                  max={100}
                  value={draft.scoring.weights.ObjectionHandling}
                  onChange={(v) =>
                    onChange({
                      ...draft,
                      scoring: {
                        ...draft.scoring,
                        weights: {
                          ...draft.scoring.weights,
                          ObjectionHandling: clampWeight(v),
                        },
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Text>Closing</Text>
                <InputNumber
                  min={0}
                  max={100}
                  value={draft.scoring.weights.Closing}
                  onChange={(v) =>
                    onChange({
                      ...draft,
                      scoring: {
                        ...draft.scoring,
                        weights: {
                          ...draft.scoring.weights,
                          Closing: clampWeight(v),
                        },
                      },
                    })
                  }
                />
              </div>
              <div className="mt-2 flex items-center justify-between font-semibold">
                <Text>Total</Text>
                <Text>{totalWeight}%</Text>
              </div>
            </Space>
          </Card>

          <Card title="Voice Behavior (Optional)">
            <Space orientation="vertical" style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Interrupt Frequency</Text>
                <Select
                  className="mt-1 w-full"
                  value={draft.voiceBehaviorOverrides?.interruptFrequency ?? "Medium"}
                  onChange={(interruptFrequency) =>
                    onChange({
                      ...draft,
                      voiceBehaviorOverrides: {
                        ...draft.voiceBehaviorOverrides,
                        interruptFrequency,
                      },
                    })
                  }
                  options={[
                    { label: "Low", value: "Low" },
                    { label: "Medium", value: "Medium" },
                    { label: "High", value: "High" },
                  ]}
                />
              </div>
              <div>
                <Text type="secondary">Speaking Pace</Text>
                <Select
                  className="mt-1 w-full"
                  value={draft.voiceBehaviorOverrides?.speakingPace ?? "Moderate"}
                  onChange={(speakingPace) =>
                    onChange({
                      ...draft,
                      voiceBehaviorOverrides: { ...draft.voiceBehaviorOverrides, speakingPace },
                    })
                  }
                  options={[
                    { label: "Slow", value: "Slow" },
                    { label: "Moderate", value: "Moderate" },
                    { label: "Fast", value: "Fast" },
                  ]}
                />
              </div>
              <div>
                <Text type="secondary">Tone Style</Text>
                <Select
                  className="mt-1 w-full"
                  value={draft.voiceBehaviorOverrides?.toneStyle ?? "Neutral"}
                  onChange={(toneStyle) =>
                    onChange({
                      ...draft,
                      voiceBehaviorOverrides: { ...draft.voiceBehaviorOverrides, toneStyle },
                    })
                  }
                  options={[
                    { label: "Friendly", value: "Friendly" },
                    { label: "Casual", value: "Casual" },
                    { label: "Formal", value: "Formal" },
                    { label: "Professional", value: "Professional" },
                    { label: "Direct", value: "Direct" },
                    { label: "Neutral", value: "Neutral" },
                    { label: "Challenging", value: "Challenging" },
                  ]}
                />
              </div>
            </Space>
          </Card>
        </div>
      </div>
    </>
  );
}
